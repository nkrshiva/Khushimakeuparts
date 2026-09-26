import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import type { EnquiryItem, EnquiryStatus } from '../../domain/enquiry/types';

export interface IEnquiryRepository {
  getEnquiry(clientId: string, enquiryId: string): Promise<EnquiryItem | null>;
  saveEnquiry(clientId: string, enquiry: EnquiryItem): Promise<void>;
  updateEnquiryStatus(clientId: string, enquiryId: string, status: EnquiryStatus): Promise<void>;
  deleteEnquiry(clientId: string, enquiryId: string): Promise<void>;
  clearAllEnquiries(clientId: string, enquiryIds: string[]): Promise<void>;
  subscribeEnquiries(
    clientId: string,
    onData: (enquiries: EnquiryItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe;
}

/**
 * EnquiryRepository
 *
 * Implements Firestore data-access operations for the Enquiry domain.
 * Governs `/clients/{clientId}/enquiries` subcollection persistence.
 */
export class EnquiryRepository implements IEnquiryRepository {
  /**
   * Fetches an individual enquiry document from `/clients/{clientId}/enquiries/{enquiryId}`.
   */
  async getEnquiry(clientId: string, enquiryId: string): Promise<EnquiryItem | null> {
    if (!db || !clientId || !enquiryId) return null;
    const docRef = doc(db, 'clients', clientId, 'enquiries', enquiryId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as EnquiryItem;
  }

  /**
   * Persists an enquiry document to `/clients/{clientId}/enquiries/{enquiry.id}`.
   */
  async saveEnquiry(clientId: string, enquiry: EnquiryItem): Promise<void> {
    if (!db || !clientId || !enquiry.id) return;
    const docRef = doc(db, 'clients', clientId, 'enquiries', enquiry.id);
    await setDoc(docRef, enquiry);
  }

  /**
   * Updates status of an enquiry document with merge semantics.
   */
  async updateEnquiryStatus(
    clientId: string,
    enquiryId: string,
    status: EnquiryStatus
  ): Promise<void> {
    if (!db || !clientId || !enquiryId) return;
    const docRef = doc(db, 'clients', clientId, 'enquiries', enquiryId);
    await setDoc(docRef, { status }, { merge: true });
  }

  /**
   * Deletes an enquiry document from `/clients/{clientId}/enquiries/{enquiryId}`.
   */
  async deleteEnquiry(clientId: string, enquiryId: string): Promise<void> {
    if (!db || !clientId || !enquiryId) return;
    const docRef = doc(db, 'clients', clientId, 'enquiries', enquiryId);
    await deleteDoc(docRef);
  }

  /**
   * Deletes multiple enquiries in batch/loop.
   */
  async clearAllEnquiries(clientId: string, enquiryIds: string[]): Promise<void> {
    if (!db || !clientId || !enquiryIds.length) return;
    for (const id of enquiryIds) {
      try {
        await deleteDoc(doc(db, 'clients', clientId, 'enquiries', id));
      } catch (err) {
        console.warn(`Could not delete enquiry ${id}:`, err);
      }
    }
  }

  /**
   * Subscribes to real-time updates for an active client's private enquiries subcollection.
   */
  subscribeEnquiries(
    clientId: string,
    onData: (enquiries: EnquiryItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!db || !clientId) {
      return () => {};
    }

    const enqColRef = collection(db, 'clients', clientId, 'enquiries');
    return onSnapshot(
      enqColRef,
      (snapshot) => {
        const list: EnquiryItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as EnquiryItem);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onData(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  }
}

export const enquiryRepository = new EnquiryRepository();
