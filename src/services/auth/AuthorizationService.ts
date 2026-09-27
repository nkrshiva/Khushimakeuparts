import type { TenantRole } from '../../domain/tenant/types';

/**
 * AuthorizationService
 *
 * Pure domain authorization service boundary.
 * Determines what an authenticated identity is permitted to do based on their role
 * and tenant assignment constraints.
 *
 * Architectural Rules:
 * - Does NOT perform Firebase authentication or touch auth tokens.
 * - Does NOT resolve tenants or query Firestore.
 * - Does NOT query arbitrary browser or UI state.
 * - Does NOT manage React state.
 * - Does NOT read or write localStorage.
 * - Does NOT render UI elements.
 */
export class AuthorizationService {
  /**
   * Whether the role is permitted to access the Master Admin Cockpit (developer only).
   */
  canAccessMasterAdmin(role: TenantRole, _email?: string | null): boolean {
    return role === 'developer';
  }

  /**
   * Whether the role is permitted to access the scoped tenant Admin Panel (CMS).
   */
  canAccessAdminPanel(role: TenantRole): boolean {
    return role === 'developer' || role === 'client';
  }

  /**
   * Whether the identity is permitted to access the Employee Workspace.
   */
  canAccessEmployeeWorkspace(role: TenantRole, identityType?: string): boolean {
    if (role === 'developer' || role === 'client' || role === 'employee') {
      return true;
    }
    return identityType === 'TENANT_EMPLOYEE';
  }

  /**
   * Whether the employee has a specific delegated permission.
   */
  hasEmployeePermission(permissions?: string[] | null, requiredPermission?: string): boolean {
    if (!permissions || !Array.isArray(permissions) || !requiredPermission) return false;
    return permissions.includes(requiredPermission) || permissions.includes('admin_all');
  }

  /**
   * Whether the role is permitted to access configuration cloning and export wizard.
   */
  canExportConfig(role: TenantRole): boolean {
    return role === 'developer';
  }

  /**
   * Whether the role is permitted to reset tenant configuration to original defaults.
   */
  canResetDefaults(role: TenantRole): boolean {
    return role === 'developer';
  }

  /**
   * Whether the role is permitted to provision new tenants, alter lifecycle status, or delete tenants.
   */
  canManageTenantLifecycle(role: TenantRole): boolean {
    return role === 'developer';
  }

  /**
   * Whether the role is permitted to execute a global multi-tenant content synchronization.
   */
  canSyncAllTenants(role: TenantRole): boolean {
    return role === 'developer';
  }

  /**
   * Whether the user is permitted to edit content for a specific target tenant ID.
   *
   * Rules:
   * - Developer: Can edit any tenant website across the platform.
   * - Client: Can strictly and exclusively edit their assigned tenant website.
   * - Unauthenticated / unassigned: Denied.
   */
  canEditTenantContent(
    role: TenantRole,
    assignedClientId: string | null,
    targetTenantId: string
  ): boolean {
    if (role === 'developer') {
      return true;
    }
    if (role === 'client' && assignedClientId && targetTenantId) {
      return assignedClientId.trim().toLowerCase() === targetTenantId.trim().toLowerCase();
    }
    return false;
  }
}

export const authorizationService = new AuthorizationService();
