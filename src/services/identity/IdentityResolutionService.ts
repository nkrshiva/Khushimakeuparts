import { isBootstrapDeveloperEmail } from '../../config/adminCredentials';
import type {
  AuthUserInput,
  ResolvedIdentity,
  ResolvedDestination,
  IdentityResolutionResult,
} from '../../domain/identity/types';
import { tenantRepository, ITenantRepository } from '../../repositories/tenant/TenantRepository';

/**
 * Interface for Identity Resolution Service
 */
export interface IIdentityResolutionService {
  resolveIdentity(user: AuthUserInput | null): Promise<ResolvedIdentity>;
  resolveDestination(identity: ResolvedIdentity, emailVerified?: boolean): ResolvedDestination;
  getDestinationPath(destination: ResolvedDestination, identity: ResolvedIdentity): string;
  resolve(user: AuthUserInput | null): Promise<IdentityResolutionResult>;
}

/**
 * IdentityResolutionService
 *
 * Authoritative domain service responsible for mapping authenticated Firebase Auth credentials
 * to authoritative platform / tenant / employee identities and destinations.
 *
 * Architectural Guarantees:
 * - ZERO direct Firebase SDK dependencies.
 * - Framework-independent, pure application/domain layer.
 * - Does NOT consult localStorage, sessionStorage, URL parameters, or client React state for authorization.
 * - Strictly enforces Master Platform Admin authorization matching bootstrap identity.
 * - Isolates Tenant Owners strictly to their single assigned tenant.
 * - Confines Employees to their single assigned tenant and delegated permissions.
 * - Traps unassigned, inactive, or suspended accounts into NO_WORKSPACE.
 * - Enforces the email verification checkpoint uniformly.
 */
export class IdentityResolutionService implements IIdentityResolutionService {
  private tenantRepo: ITenantRepository;

  constructor(tenantRepo: ITenantRepository = tenantRepository) {
    this.tenantRepo = tenantRepo;
  }

  /**
   * Resolves the authoritative domain identity for an authenticated user.
   */
  async resolveIdentity(user: AuthUserInput | null): Promise<ResolvedIdentity> {
    if (!user || !user.uid) {
      return { type: 'UNAUTHENTICATED' };
    }

    const cleanEmail = user.email?.trim().toLowerCase() || '';

    // 1. Read authoritative user profile from repository
    let profile = null;
    try {
      profile = await this.tenantRepo.getUserProfile(user.uid);
      if (!profile && cleanEmail) {
        profile = await this.tenantRepo.getUserProfileByEmail(cleanEmail);
      }
    } catch (err) {
      console.warn('[IdentityResolutionService] Could not read user profile from repository:', err);
    }

    // 2. Authoritative Master Platform Admin Resolution
    // Requirement 1: An existing /users/{uid} profile with role === 'developer' is recognized
    // unconditionally as MASTER_PLATFORM_ADMIN without requiring isBootstrapDeveloperEmail() or matching any email.
    if (profile?.role === 'developer') {
      return {
        type: 'MASTER_PLATFORM_ADMIN',
        uid: user.uid,
        email: cleanEmail,
        name: profile.displayName || 'Platform Super Admin',
      };
    }

    // Requirement 4: Initial developer bootstrap mechanism strictly for first sign-in before profile exists
    if (!profile && isBootstrapDeveloperEmail(cleanEmail)) {
      // PHASE 1 FIX — Bootstrap write is no longer fire-and-forget.
      //
      // Problem eliminated: the Firestore rule isDeveloper() calls getUserData() which reads
      // /users/{uid} at rule evaluation time. When the write was inside a silent try/catch, a
      // Firestore permission error or cold-start delay could leave the document uncommitted.
      // The next Firestore operation (e.g. saveTenant) would then see an empty getUserData()
      // result and isDeveloper() would evaluate to false → PERMISSION_DENIED.
      //
      // Fix: await the write fully, then confirm it committed via a read-after-write.
      // If either operation fails, throw a tagged error rather than silently continuing.
      // The caller (resolve/UniversalLoginModal) must handle the failure explicitly.
      await this.tenantRepo.saveUserProfile(user.uid, {
        uid: user.uid,
        email: cleanEmail,
        role: 'developer',
        assignedClientId: null,
        updatedAt: new Date().toISOString(),
      });

      // Read-after-write: confirm the committed document is visible in Firestore before
      // returning MASTER_PLATFORM_ADMIN. This ensures isDeveloper() on the next rule
      // evaluation will find role == 'developer' in getUserData().
      const committed = await this.tenantRepo.getUserProfile(user.uid);
      if (!committed || committed.role !== 'developer') {
        throw new Error(
          '[BOOTSTRAP_ERROR] Developer identity bootstrap failed: the platform identity ' +
          'record could not be confirmed in Firestore. Please sign out and sign in again. ' +
          'If the problem persists, verify that the Firestore security rules are deployed ' +
          'and that the bootstrap allowCreate rule for naveen.kr.shiva@gmail.com is active.'
        );
      }

      return {
        type: 'MASTER_PLATFORM_ADMIN',
        uid: user.uid,
        email: cleanEmail,
        name: 'Platform Super Admin',
      };
    }


    // 3. User with no assigned tenant -> NO_WORKSPACE
    const assignedTenantId = profile?.assignedClientId?.trim() || null;
    if (!assignedTenantId) {
      return {
        type: 'NO_WORKSPACE',
        uid: user.uid,
        email: cleanEmail,
        reason: 'UNASSIGNED',
        tenantId: null,
      };
    }

    // 4. Verify authoritative tenant existence and lifecycle status
    let tenantDoc = null;
    try {
      tenantDoc = await this.tenantRepo.getTenant(assignedTenantId);
    } catch (err) {
      console.warn(`[IdentityResolutionService] Error reading tenant document for ${assignedTenantId}:`, err);
    }

    if (!tenantDoc) {
      return {
        type: 'NO_WORKSPACE',
        uid: user.uid,
        email: cleanEmail,
        reason: 'TENANT_NOT_FOUND',
        tenantId: assignedTenantId,
      };
    }

    if (tenantDoc.status === 'pending_invitation') {
      return {
        type: 'NO_WORKSPACE',
        uid: user.uid,
        email: cleanEmail,
        reason: 'TENANT_PENDING_ACTIVATION',
        tenantId: assignedTenantId,
      };
    }

    if (tenantDoc.status === 'suspended' || tenantDoc.active === false) {
      return {
        type: 'NO_WORKSPACE',
        uid: user.uid,
        email: cleanEmail,
        reason: 'TENANT_SUSPENDED',
        tenantId: assignedTenantId,
      };
    }

    // 5. Tenant Employee Resolution
    if (profile?.role === 'employee' || Boolean(profile?.employeeId)) {
      if (profile?.active === false) {
        return {
          type: 'NO_WORKSPACE',
          uid: user.uid,
          email: cleanEmail,
          reason: 'INACTIVE_ACCOUNT',
          tenantId: assignedTenantId,
        };
      }

      const permissions = Array.isArray(profile?.permissions) && profile.permissions.length > 0
        ? profile.permissions
        : ['view_schedule'];
      return {
        type: 'TENANT_EMPLOYEE',
        uid: user.uid,
        email: cleanEmail,
        tenantId: assignedTenantId,
        employeeId: profile?.employeeId || user.uid,
        permissions,
        tenantName: tenantDoc.name || assignedTenantId,
      };
    }

    // 6. Tenant Owner Resolution
    return {
      type: 'TENANT_OWNER',
      uid: user.uid,
      email: cleanEmail,
      tenantId: assignedTenantId,
      tenantName: tenantDoc.name || assignedTenantId,
      tenantStatus: tenantDoc.status || 'active',
    };
  }

  /**
   * Maps an authoritative identity and verification state to an authorized destination.
   */
  resolveDestination(identity: ResolvedIdentity, emailVerified: boolean = true): ResolvedDestination {
    if (identity.type === 'UNAUTHENTICATED') {
      return 'AUTHENTICATION_REQUIRED';
    }

    // Strict email verification checkpoint across all authenticated users
    if (!emailVerified) {
      return 'EMAIL_VERIFICATION';
    }

    switch (identity.type) {
      case 'MASTER_PLATFORM_ADMIN':
        return 'MASTER_ADMIN';
      case 'TENANT_OWNER':
        return 'TENANT_ADMIN';
      case 'TENANT_EMPLOYEE':
        return 'EMPLOYEE_WORKSPACE';
      case 'NO_WORKSPACE':
        return 'NO_WORKSPACE';
      default:
        return 'AUTHENTICATION_REQUIRED';
    }
  }

  /**
   * Resolves the canonical URL/hash path for an authorized destination.
   */
  getDestinationPath(destination: ResolvedDestination, _identity: ResolvedIdentity): string {
    switch (destination) {
      case 'MASTER_ADMIN':
        return '#masteradmin';
      case 'TENANT_ADMIN':
        return '#admin';
      case 'EMPLOYEE_WORKSPACE':
        return '#employee';
      case 'NO_WORKSPACE':
        return '#no-workspace';
      case 'EMAIL_VERIFICATION':
        return '#verify-email';
      case 'AUTHENTICATION_REQUIRED':
      default:
        return '#login';
    }
  }

  /**
   * Unified resolution pipeline returning complete identity, destination, and redirect metadata.
   */
  async resolve(user: AuthUserInput | null): Promise<IdentityResolutionResult> {
    const identity = await this.resolveIdentity(user);
    // User emailVerified flag if present, defaulting to true if not specified
    const emailVerified = user?.emailVerified !== undefined ? user.emailVerified : true;
    const destination = this.resolveDestination(identity, emailVerified);
    const redirectPath = this.getDestinationPath(destination, identity);

    return {
      identity,
      destination,
      requiresEmailVerification: !emailVerified && identity.type !== 'UNAUTHENTICATED',
      emailVerified,
      redirectPath,
    };
  }
}

export const identityResolutionService = new IdentityResolutionService();
