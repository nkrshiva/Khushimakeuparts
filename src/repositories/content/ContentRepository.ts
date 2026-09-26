import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import type { SiteContent } from '../../domain/content/types';

export interface IContentRepository {
  getContent(clientId: string): Promise<SiteContent | null>;
  saveContent(clientId: string, content: SiteContent): Promise<void>;
  subscribeContent(
    clientId: string,
    onData: (content: SiteContent) => void,
    onError?: (err: Error) => void
  ): () => void;
  deleteContent(clientId: string): Promise<void>;
}

/**
 * ContentRepository
 *
 * Data access persistence boundary for Site Content, Catalog, and Storefront configuration.
 * Encapsulates all Cloud Firestore operations on tenant documents under `/clients/{clientId}`.
 */
export class ContentRepository implements IContentRepository {
  /**
   * Retrieves the raw site content document for a given tenant client ID.
   */
  async getContent(clientId: string): Promise<SiteContent | null> {
    if (!db || !clientId) return null;
    const clientDocRef = doc(db, 'clients', clientId);
    const snap = await getDoc(clientDocRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return (data.content || data) as SiteContent;
  }

  /**
   * Persists site content and storefront catalog configuration to `/clients/{clientId}`.
   * Merges safely without overwriting document root metadata.
   */
  async saveContent(clientId: string, content: SiteContent): Promise<void> {
    if (!db) {
      throw new Error('Database is not initialized');
    }
    if (!clientId) {
      throw new Error('Client ID is required to save site content');
    }

    const clientDocRef = doc(db, 'clients', clientId);
    await setDoc(
      clientDocRef,
      {
        id: clientId,
        name: content.brand?.name,
        founder: content.brand?.founder,
        city: content.brand?.location,
        phone: content.brand?.phone,
        instagram: content.brand?.instagram,
        active: true,
        status: 'active',
        content,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  /**
   * Attaches a real-time listener to the `/clients/{clientId}` document.
   */
  subscribeContent(
    clientId: string,
    onData: (content: SiteContent) => void,
    onError?: (err: Error) => void
  ): () => void {
    if (!db || !clientId) {
      return () => {};
    }

    const clientDocRef = doc(db, 'clients', clientId);
    const unsubscribe: Unsubscribe = onSnapshot(
      clientDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const rawContent = (data.content || data) as SiteContent;
          onData(rawContent);
        }
      },
      (err) => {
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  }

  /**
   * Deletes the tenant document from `/clients/{clientId}`.
   */
  async deleteContent(clientId: string): Promise<void> {
    if (!db) {
      throw new Error('Database is not initialized');
    }
    if (!clientId) {
      throw new Error('Client ID is required to delete site content');
    }
    const clientDocRef = doc(db, 'clients', clientId);
    await deleteDoc(clientDocRef);
  }
}

export const contentRepository = new ContentRepository();
