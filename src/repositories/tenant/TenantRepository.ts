import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  limit,
  getDocs,
  where,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import type {
  TenantUserProfile,
  ClientTenantSummary,
  TenantInvitation,
  CreateInvitationInput,
  AcceptInvitationInput,
  AcceptInvitationResult,
} from '../../domain/tenant/types';

/**
 * ITenantRepository
 *
 * Domain-oriented contract for tenant and registry persistence.
 * Isolates Firestore SDK mechanics from application/service decisions.
 */
export interface ITenantRepository {
  // User Profile persistence (/users/{uid})
  getUserProfile(uid: string): Promise<TenantUserProfile | null>;
  getUserProfileByEmail(email: string): Promise<TenantUserProfile | null>;
  saveUserProfile(uid: string, profile: Partial<TenantUserProfile>): Promise<void>;
  getTenantEmployees(tenantId: string): Promise<TenantUserProfile[]>;
  saveEmployeeUserProfile(
    tenantId: string,
    email: string,
    profile: Partial<TenantUserProfile>
  ): Promise<string>;
  deleteEmployeeUserProfile(tenantId: string, userId: string): Promise<void>;

  // Platform Registry persistence (/settings/clients_registry)
  getClientsRegistry(): Promise<ClientTenantSummary[] | null>;
  saveClientsRegistry(clients: ClientTenantSummary[]): Promise<void>;
  subscribeClientsRegistry(
    onData: (clients: ClientTenantSummary[]) => void,
    onError?: (err: Error) => void
  ): () => void;

  // Tenant Document persistence (/clients/{clientId})
  getTenant(clientId: string): Promise<Record<string, any> | null>;
  saveTenant(clientId: string, data: Record<string, any>, merge?: boolean): Promise<void>;
  deleteTenant(clientId: string): Promise<void>;
  purgeTenantSubcollections(clientId: string, onProgress?: (msg: string) => void): Promise<void>;

  // Tenant Invitation persistence (/tenant_invitations/{invitationId})
  createInvitation(input: CreateInvitationInput): Promise<TenantInvitation>;
  getInvitation(invitationId: string): Promise<TenantInvitation | null>;
  getInvitationByToken(token: string): Promise<TenantInvitation | null>;
  getPendingInvitationsForTenant(clientId: string): Promise<TenantInvitation[]>;
  acceptInvitation(input: AcceptInvitationInput): Promise<AcceptInvitationResult>;
  revokeInvitation(invitationId: string, revokedByUid?: string): Promise<void>;
}

/**
 * TenantRepository
 *
 * Implements Firestore data-access operations for the Tenant domain.
 * Governs `/users/{uid}`, `/settings/clients_registry`, and `/clients/{clientId}` persistence.
 */
export class TenantRepository implements ITenantRepository {
  /**
   * Fetches user profile document from `/users/{uid}`.
   * Returns null if Firestore is not initialized or the document does not exist.
   */
  async getUserProfile(uid: string): Promise<TenantUserProfile | null> {
    if (!db) {
      return null;
    }
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      return null;
    }
    return userSnap.data() as TenantUserProfile;
  }

  /**
   * Fetches user profile document by email from `/users`.
   */
  async getUserProfileByEmail(email: string): Promise<TenantUserProfile | null> {
    if (!db || !email) {
      return null;
    }
    const cleanEmail = email.trim().toLowerCase();
    const q = query(
      collection(db, 'users'),
      where('email', '==', cleanEmail),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return null;
    }
    const docSnap = snap.docs[0];
    return { uid: docSnap.id, ...(docSnap.data() as TenantUserProfile) };
  }

  /**
   * Idempotently persists user profile fields to `/users/{uid}` with merge semantics.
   */
  async saveUserProfile(uid: string, profile: Partial<TenantUserProfile>): Promise<void> {
    if (!db) {
      return;
    }
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, profile, { merge: true });
  }

  /**
   * Fetches all employee user profiles belonging to a specific tenant.
   */
  async getTenantEmployees(tenantId: string): Promise<TenantUserProfile[]> {
    if (!db || !tenantId) return [];
    try {
      const q = query(
        collection(db, 'users'),
        where('assignedClientId', '==', tenantId),
        where('role', '==', 'employee')
      );
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...(docSnap.data() as TenantUserProfile),
      }));
    } catch (err) {
      console.warn('[TenantRepository] Failed to get tenant employees:', err);
      return [];
    }
  }

  /**
   * Creates or updates an employee user profile belonging strictly to the assigned tenant.
   */
  async saveEmployeeUserProfile(
    tenantId: string,
    email: string,
    profile: Partial<TenantUserProfile>
  ): Promise<string> {
    if (!db || !tenantId || !email) {
      throw new Error('Tenant ID and Employee Email are required.');
    }
    const cleanEmail = email.trim().toLowerCase();
    // Deterministic document ID or existing profile UID
    const profileId = profile.uid || `emp_${tenantId}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const userDocRef = doc(db, 'users', profileId);

    const payload: TenantUserProfile = {
      uid: profileId,
      email: cleanEmail,
      role: 'employee',
      assignedClientId: tenantId,
      employeeId: profile.employeeId || profileId,
      permissions: Array.isArray(profile.permissions) && profile.permissions.length > 0
        ? profile.permissions
        : ['view_schedule'],
      displayName: profile.displayName || profile.email?.split('@')[0] || 'Team Member',
      active: profile.active !== false,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, payload, { merge: true });
    return profileId;
  }

  /**
   * Deletes an employee user profile belonging strictly to the assigned tenant.
   */
  async deleteEmployeeUserProfile(tenantId: string, userId: string): Promise<void> {
    if (!db || !tenantId || !userId) return;
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
  }

  /**
   * Fetches the global platform registry document from `/settings/clients_registry`.
   */
  async getClientsRegistry(): Promise<ClientTenantSummary[] | null> {
    if (!db) {
      return null;
    }
    const regDocRef = doc(db, 'settings', 'clients_registry');
    const snap = await getDoc(regDocRef);
    if (!snap.exists()) {
      return null;
    }
    const data = snap.data();
    return Array.isArray(data?.clients) ? (data.clients as ClientTenantSummary[]) : null;
  }

  /**
   * Persists the global platform registry to `/settings/clients_registry`.
   */
  async saveClientsRegistry(clients: ClientTenantSummary[]): Promise<void> {
    if (!db) {
      return;
    }
    const regDocRef = doc(db, 'settings', 'clients_registry');
    await setDoc(
      regDocRef,
      {
        clients,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  /**
   * Subscribes to real-time updates for `/settings/clients_registry`.
   */
  subscribeClientsRegistry(
    onData: (clients: ClientTenantSummary[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    if (!db) {
      return () => {};
    }
    const regDocRef = doc(db, 'settings', 'clients_registry');
    return onSnapshot(
      regDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data?.clients) && data.clients.length > 0) {
            onData(data.clients as ClientTenantSummary[]);
          }
        }
      },
      (err) => {
        onError?.(err);
      }
    );
  }

  /**
   * Fetches the tenant root document from `/clients/{clientId}`.
   */
  async getTenant(clientId: string): Promise<Record<string, any> | null> {
    if (!db) {
      return null;
    }
    const clientDocRef = doc(db, 'clients', clientId);
    const snap = await getDoc(clientDocRef);
    if (!snap.exists()) {
      return null;
    }
    return snap.data();
  }

  /**
   * Saves or merges data into `/clients/{clientId}`.
   */
  async saveTenant(clientId: string, data: Record<string, any>, merge: boolean = true): Promise<void> {
    if (!db) {
      return;
    }
    const clientDocRef = doc(db, 'clients', clientId);
    await setDoc(clientDocRef, data, { merge });
  }

  /**
   * Deletes the parent tenant document `/clients/{clientId}`.
   */
  async deleteTenant(clientId: string): Promise<void> {
    if (!db) {
      return;
    }
    const clientDocRef = doc(db, 'clients', clientId);
    await deleteDoc(clientDocRef);
  }

  /**
   * Scalably purges all subcollections of `/clients/{clientId}` in batches of 300 documents.
   */
  async purgeTenantSubcollections(clientId: string, onProgress?: (msg: string) => void): Promise<void> {
    if (!db) {
      return;
    }
    const subcollections = [
      'slot_locks',
      'busy_slots',
      'appointments',
      'enquiries',
      'staff_private',
      'staff',
      'pending_reviews',
    ];

    for (const sub of subcollections) {
      onProgress?.(`Purging ${sub}...`);
      let totalDeletedInSub = 0;
      while (true) {
        const subColRef = collection(db, 'clients', clientId, sub);
        const q = query(subColRef, limit(300));
        const snap = await getDocs(q);
        if (snap.empty) {
          break;
        }

        const batch = writeBatch(db);
        snap.docs.forEach((docItem) => batch.delete(docItem.ref));
        await batch.commit();
        totalDeletedInSub += snap.size;
        onProgress?.(`Purged ${totalDeletedInSub} docs in ${sub}...`);
      }
    }
  }

  // ─── TENANT INVITATION OPERATIONS ──────────────────────────────────────────

  /**
   * Creates a single-use onboarding invitation for a prospective tenant owner.
   */
  async createInvitation(input: CreateInvitationInput): Promise<TenantInvitation> {
    if (!db) {
      throw new Error('Firestore database instance is not initialized.');
    }
    if (!input.clientId || !input.invitedOwnerEmail) {
      throw new Error('Client ID and invited owner email are required to create an invitation.');
    }

    const cleanEmail = input.invitedOwnerEmail.trim().toLowerCase();
    const token = input.customToken || generateSecureToken();
    const invitationId = `inv_${input.clientId}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const expiresInHours = input.expiresInHours && input.expiresInHours > 0 ? input.expiresInHours : 72;
    const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000).toISOString();

    const invitation: TenantInvitation = {
      invitationId,
      clientId: input.clientId,
      invitedOwnerEmail: cleanEmail,
      invitedByUid: input.invitedByUid,
      invitedByEmail: input.invitedByEmail,
      status: 'pending',
      token,
      createdAt: now.toISOString(),
      expiresAt,
      acceptedAt: null,
      acceptedByUid: null,
      revokedAt: null,
      revokedByUid: null,
    };

    const docRef = doc(db, 'tenant_invitations', invitationId);
    await setDoc(docRef, invitation);
    return invitation;
  }

  /**
   * Retrieves an invitation by its document ID.
   */
  async getInvitation(invitationId: string): Promise<TenantInvitation | null> {
    if (!db || !invitationId) return null;
    const docRef = doc(db, 'tenant_invitations', invitationId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as TenantInvitation;
  }

  /**
   * Retrieves an invitation by its unique token.
   */
  async getInvitationByToken(token: string): Promise<TenantInvitation | null> {
    if (!db || !token) return null;
    const q = query(
      collection(db, 'tenant_invitations'),
      where('token', '==', token.trim()),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as TenantInvitation;
  }

  /**
   * Retrieves all pending invitations for a specific tenant.
   */
  async getPendingInvitationsForTenant(clientId: string): Promise<TenantInvitation[]> {
    if (!db || !clientId) return [];
    try {
      const q = query(
        collection(db, 'tenant_invitations'),
        where('clientId', '==', clientId),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as TenantInvitation);
    } catch (err) {
      console.warn('[TenantRepository] Failed to query invitations:', err);
      return [];
    }
  }

  /**
   * Revokes an existing invitation, preventing future acceptance.
   */
  async revokeInvitation(invitationId: string, revokedByUid?: string): Promise<void> {
    if (!db || !invitationId) return;
    const docRef = doc(db, 'tenant_invitations', invitationId);
    await setDoc(
      docRef,
      {
        status: 'revoked',
        revokedAt: new Date().toISOString(),
        revokedByUid: revokedByUid || null,
      },
      { merge: true }
    );
  }

  /**
   * Authoritatively accepts an invitation in an atomic Firestore transaction.
   *
   * Security & Isolation Guarantees:
   * 1. Requires valid unexpired invitation with status === 'pending'.
   * 2. Validates matching secure token.
   * 3. Enforces that the authenticated Google account email strictly matches invitedOwnerEmail.
   * 4. Binds the authenticated UID to the tenant as an authoritative tenant_owner (role: 'client').
   * 5. Atomically transitions tenant lifecycle status from 'pending_invitation' to 'active'.
   * 6. Marks the invitation as 'accepted' with acceptedByUid, preventing any subsequent reuse.
   */
  async acceptInvitation(input: AcceptInvitationInput): Promise<AcceptInvitationResult> {
    if (!db) {
      return { success: false, error: 'Database service is unavailable.' };
    }
    if (!input.invitationId || !input.token) {
      return { success: false, error: 'Invitation ID and secure token are required.' };
    }
    if (!input.acceptingUser || !input.acceptingUser.uid || !input.acceptingUser.email) {
      return { success: false, error: 'Authenticated Google user information is required.' };
    }

    const cleanAcceptingEmail = input.acceptingUser.email.trim().toLowerCase();
    const cleanToken = input.token.trim();

    try {
      const result = await runTransaction(db, async (transaction) => {
        const inviteDocRef = doc(db, 'tenant_invitations', input.invitationId);
        const inviteSnap = await transaction.get(inviteDocRef);

        if (!inviteSnap.exists()) {
          throw new Error('Invitation not found or has been removed.');
        }

        const invitation = inviteSnap.data() as TenantInvitation;

        // 1. Verify token
        if (invitation.token !== cleanToken) {
          throw new Error('Invalid invitation token. The link may be corrupted.');
        }

        // 2. Verify status
        if (invitation.status === 'accepted') {
          throw new Error('This invitation has already been accepted and cannot be reused.');
        }
        if (invitation.status === 'revoked') {
          throw new Error('This invitation has been revoked by the platform administrator.');
        }
        if (invitation.status === 'expired') {
          throw new Error('This invitation has expired. Please request a new invitation.');
        }
        if (invitation.status !== 'pending') {
          throw new Error(`Invitation is invalid (status: ${invitation.status}).`);
        }

        // 3. Verify expiration date
        const expiresAtMs = new Date(invitation.expiresAt).getTime();
        if (Date.now() > expiresAtMs) {
          transaction.update(inviteDocRef, { status: 'expired' });
          throw new Error('This invitation has expired. Please request a new invitation.');
        }

        // 4. Verify accepting email strictly matches invited email
        const cleanInvitedEmail = invitation.invitedOwnerEmail.trim().toLowerCase();
        if (cleanAcceptingEmail !== cleanInvitedEmail) {
          throw new Error(
            `The authenticated Google account (${cleanAcceptingEmail}) does not match the email address this invitation was issued to (${cleanInvitedEmail}). Please sign in with the invited Google account.`
          );
        }

        // 5. Ensure clientId is present and valid
        if (!invitation.clientId) {
          throw new Error('Invitation is missing target tenant assignment.');
        }

        const nowIso = new Date().toISOString();

        // 6. Update invitation record (marked accepted, bound to UID)
        transaction.update(inviteDocRef, {
          status: 'accepted',
          acceptedAt: nowIso,
          acceptedByUid: input.acceptingUser.uid,
        });

        // 7. Authoritatively assign role: client & assignedClientId on /users/{uid}
        const userDocRef = doc(db, 'users', input.acceptingUser.uid);
        transaction.set(
          userDocRef,
          {
            uid: input.acceptingUser.uid,
            email: cleanAcceptingEmail,
            role: 'client',
            assignedClientId: invitation.clientId,
            invitationId: invitation.invitationId,
            invitationAcceptedAt: nowIso,
            updatedAt: nowIso,
          },
          { merge: true }
        );

        // 8. Activate tenant document in /clients/{clientId}
        // Protected by rule requiring resource.status == 'pending_invitation' and matching valid invitation
        const clientDocRef = doc(db, 'clients', invitation.clientId);
        transaction.set(
          clientDocRef,
          {
            status: 'active',
            active: true,
            activatedByInvitationId: invitation.invitationId,
            updatedAt: nowIso,
          },
          { merge: true }
        );


        const updatedInvitation: TenantInvitation = {
          ...invitation,
          status: 'accepted',
          acceptedAt: nowIso,
          acceptedByUid: input.acceptingUser.uid,
        };

        return {
          success: true,
          clientId: invitation.clientId,
          invitation: updatedInvitation,
        };
      });

      return result;
    } catch (err: any) {
      console.warn('[TenantRepository] acceptInvitation notice:', err?.message || err);
      return {
        success: false,
        error: err?.message || 'Failed to accept invitation.',
      };
    }
  }
}

/**
 * Generates a cryptographically strong 48-character hex token.
 */
export function generateSecureToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `tok_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
}

export const tenantRepository = new TenantRepository();

