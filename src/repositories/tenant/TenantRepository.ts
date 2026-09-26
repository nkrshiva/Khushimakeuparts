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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import type {
  TenantUserProfile,
  ClientTenantSummary,
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
  saveUserProfile(uid: string, profile: Partial<TenantUserProfile>): Promise<void>;

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
}

export const tenantRepository = new TenantRepository();
