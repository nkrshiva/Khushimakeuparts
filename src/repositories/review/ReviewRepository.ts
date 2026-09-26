import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import type { ReviewSubmissionItem, ReviewStatus } from '../../domain/review/types';

export interface IReviewRepository {
  getPendingReview(clientId: string, reviewId: string): Promise<ReviewSubmissionItem | null>;
  savePendingReview(clientId: string, review: ReviewSubmissionItem): Promise<void>;
  updatePendingReviewStatus(clientId: string, reviewId: string, status: ReviewStatus): Promise<void>;
  deletePendingReview(clientId: string, reviewId: string): Promise<void>;
  listPendingReviews(clientId: string): Promise<ReviewSubmissionItem[]>;
  subscribePendingReviews(
    clientId: string,
    onData: (reviews: ReviewSubmissionItem[]) => void,
    onError?: (err: Error) => void
  ): () => void;
}

/**
 * ReviewRepository
 *
 * Data access persistence boundary for review submissions and moderation.
 * Encapsulates all Cloud Firestore operations under `/clients/{clientId}/pending_reviews`.
 */
export class ReviewRepository implements IReviewRepository {
  /**
   * Retrieves a single pending review by ID.
   */
  async getPendingReview(clientId: string, reviewId: string): Promise<ReviewSubmissionItem | null> {
    if (!db || !clientId || !reviewId) return null;
    const ref = doc(db, 'clients', clientId, 'pending_reviews', reviewId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as ReviewSubmissionItem;
  }

  /**
   * Persists a pending review submission.
   */
  async savePendingReview(clientId: string, review: ReviewSubmissionItem): Promise<void> {
    if (!db) {
      throw new Error('Database is not initialized');
    }
    if (!clientId) {
      throw new Error('Client ID is required to save review');
    }
    const ref = doc(db, 'clients', clientId, 'pending_reviews', review.id);
    await setDoc(ref, review);
  }

  /**
   * Updates the status of an existing pending review.
   */
  async updatePendingReviewStatus(clientId: string, reviewId: string, status: ReviewStatus): Promise<void> {
    if (!db) {
      throw new Error('Database is not initialized');
    }
    if (!clientId || !reviewId) {
      throw new Error('Client ID and Review ID are required');
    }
    const ref = doc(db, 'clients', clientId, 'pending_reviews', reviewId);
    await updateDoc(ref, { status });
  }

  /**
   * Deletes a review from the pending reviews subcollection.
   */
  async deletePendingReview(clientId: string, reviewId: string): Promise<void> {
    if (!db) {
      throw new Error('Database is not initialized');
    }
    if (!clientId || !reviewId) {
      throw new Error('Client ID and Review ID are required');
    }
    const ref = doc(db, 'clients', clientId, 'pending_reviews', reviewId);
    await deleteDoc(ref);
  }

  /**
   * Lists all pending reviews for an active client tenant.
   */
  async listPendingReviews(clientId: string): Promise<ReviewSubmissionItem[]> {
    if (!db || !clientId) return [];
    const colRef = collection(db, 'clients', clientId, 'pending_reviews');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as ReviewSubmissionItem));
  }

  /**
   * Attaches a real-time listener to the pending_reviews subcollection.
   */
  subscribePendingReviews(
    clientId: string,
    onData: (reviews: ReviewSubmissionItem[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    if (!db || !clientId) {
      return () => {};
    }

    const colRef = collection(db, 'clients', clientId, 'pending_reviews');
    const unsubscribe: Unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const reviews = snapshot.docs.map(
          (d) => ({ ...d.data(), id: d.id } as ReviewSubmissionItem)
        );
        onData(reviews);
      },
      (err) => {
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  }
}

export const reviewRepository = new ReviewRepository();
