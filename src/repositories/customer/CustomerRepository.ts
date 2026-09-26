import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import type { CustomerItem } from '../../domain/customer/types';

export interface ICustomerRepository {
  getCustomer(clientId: string, customerId: string): Promise<CustomerItem | null>;
  saveCustomer(clientId: string, customer: CustomerItem): Promise<void>;
  deleteCustomer(clientId: string, customerId: string): Promise<void>;
  listCustomers(clientId: string): Promise<CustomerItem[]>;
  subscribeCustomers(
    clientId: string,
    onData: (customers: CustomerItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe;
}

/**
 * CustomerRepository
 *
 * Implements Firestore data-access operations for the Customer CRM domain.
 * Governs `/clients/{clientId}/customers` subcollection persistence.
 */
export class CustomerRepository implements ICustomerRepository {
  /**
   * Fetches an individual customer record.
   */
  async getCustomer(clientId: string, customerId: string): Promise<CustomerItem | null> {
    if (!db || !clientId || !customerId) return null;
    const docRef = doc(db, 'clients', clientId, 'customers', customerId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as CustomerItem;
  }

  /**
   * Persists a customer record with merge semantics.
   */
  async saveCustomer(clientId: string, customer: CustomerItem): Promise<void> {
    if (!db || !clientId || !customer.id) return;
    const docRef = doc(db, 'clients', clientId, 'customers', customer.id);
    await setDoc(docRef, customer, { merge: true });
  }

  /**
   * Deletes an individual customer record.
   */
  async deleteCustomer(clientId: string, customerId: string): Promise<void> {
    if (!db || !clientId || !customerId) return;
    const docRef = doc(db, 'clients', clientId, 'customers', customerId);
    await deleteDoc(docRef);
  }

  /**
   * Lists all customer records for a tenant.
   */
  async listCustomers(clientId: string): Promise<CustomerItem[]> {
    if (!db || !clientId) return [];
    const colRef = collection(db, 'clients', clientId, 'customers');
    const snap = await getDocs(colRef);
    const list: CustomerItem[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as CustomerItem);
    });
    return list;
  }

  /**
   * Subscribes to real-time updates for an active client's customer directory.
   */
  subscribeCustomers(
    clientId: string,
    onData: (customers: CustomerItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!db || !clientId) {
      return () => {};
    }

    const colRef = collection(db, 'clients', clientId, 'customers');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: CustomerItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as CustomerItem);
        });
        onData(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  }
}

export const customerRepository = new CustomerRepository();
