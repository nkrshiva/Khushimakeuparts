import type {
  ReviewSubmissionItem,
  ReviewStatus,
  TestimonialItem,
  CreateReviewInput,
} from '../../domain/review/types';
import {
  reviewRepository,
  IReviewRepository,
} from '../../repositories/review/ReviewRepository';

export interface SubmitReviewResult {
  success: boolean;
  review?: ReviewSubmissionItem;
  error?: string;
}

export interface ApproveReviewResult {
  success: boolean;
  approvedTestimonial?: TestimonialItem;
  error?: string;
}

export interface IReviewService {
  validateReview(data: Partial<ReviewSubmissionItem>): void;
  submitReview(
    clientId: string,
    input: CreateReviewInput | ReviewSubmissionItem
  ): Promise<SubmitReviewResult>;
  approveReview(
    clientId: string,
    reviewId: string,
    existingReview?: ReviewSubmissionItem
  ): Promise<ApproveReviewResult>;
  declineReview(clientId: string, reviewId: string): Promise<boolean>;
  deleteReview(clientId: string, reviewId: string): Promise<boolean>;
  getPendingReviews(clientId: string): Promise<ReviewSubmissionItem[]>;
  subscribePendingReviews(
    clientId: string,
    onData: (reviews: ReviewSubmissionItem[]) => void,
    onError?: (err: Error) => void
  ): () => void;
}

/**
 * ReviewService
 *
 * Domain service boundary orchestrating review validation, submission flows,
 * and admin approval/moderation workflows.
 * Contains ZERO direct Firebase SDK dependencies.
 */
export class ReviewService implements IReviewService {
  private repository: IReviewRepository;

  constructor(repository: IReviewRepository = reviewRepository) {
    this.repository = repository;
  }

  /**
   * Validates a review submission against platform business rules and schema.
   */
  validateReview(data: Partial<ReviewSubmissionItem>): void {
    if (!data.clientName || typeof data.clientName !== 'string' || !data.clientName.trim()) {
      throw new Error('Customer name is required for review submission');
    }

    if (!data.reviewText || typeof data.reviewText !== 'string' || !data.reviewText.trim()) {
      throw new Error('Review experience text is required');
    }

    if (
      typeof data.rating !== 'number' ||
      !Number.isInteger(data.rating) ||
      data.rating < 1 ||
      data.rating > 5
    ) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    if (data.status && data.status !== 'pending') {
      throw new Error('New review submissions must have pending status');
    }
  }

  /**
   * Orchestrates public review submission, generating secure ID and setting pending status.
   */
  async submitReview(
    clientId: string,
    input: CreateReviewInput | ReviewSubmissionItem
  ): Promise<SubmitReviewResult> {
    try {
      if (!clientId) {
        return { success: false, error: 'Tenant client ID is required' };
      }

      this.validateReview(input);

      const reviewId =
        ('id' in input && input.id) ||
        `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const finalReview: ReviewSubmissionItem = {
        id: reviewId,
        clientName: input.clientName.trim(),
        ceremony: input.ceremony?.trim() || 'Bridal Service',
        eventDate: input.eventDate?.trim() || 'Recent Wedding',
        rating: input.rating,
        reviewText: input.reviewText.trim(),
        photoUrl: input.photoUrl?.trim() || undefined,
        status: 'pending',
        submittedAt:
          ('submittedAt' in input && input.submittedAt) ||
          new Date().toISOString(),
      };

      await this.repository.savePendingReview(clientId, finalReview);
      return { success: true, review: finalReview };
    } catch (err: any) {
      console.warn('Failed to submit review via ReviewService:', err);
      return { success: false, error: err?.message || 'Review submission failed' };
    }
  }

  /**
   * Approves a pending review, creating a verified TestimonialItem for live publishing
   * and updating/removing the review from the pending queue.
   */
  async approveReview(
    clientId: string,
    reviewId: string,
    existingReview?: ReviewSubmissionItem
  ): Promise<ApproveReviewResult> {
    try {
      let target = existingReview;
      if (!target) {
        target = (await this.repository.getPendingReview(clientId, reviewId)) || undefined;
      }

      if (!target) {
        return { success: false, error: 'Pending review not found' };
      }

      const approvedTestimonial: TestimonialItem = {
        id: `test_${Date.now()}`,
        clientName: target.clientName,
        ceremony: target.ceremony,
        date: target.eventDate,
        rating: target.rating,
        reviewText: target.reviewText,
        photoUrl: target.photoUrl || '/portfolio/model-01.jpg',
        verified: true,
        hidden: false,
      };

      // Remove from pending subcollection once approved
      await this.repository.deletePendingReview(clientId, reviewId);

      return { success: true, approvedTestimonial };
    } catch (err: any) {
      console.warn('Failed to approve review via ReviewService:', err);
      return { success: false, error: err?.message || 'Review approval failed' };
    }
  }

  /**
   * Declines a pending review by removing it from the pending subcollection.
   */
  async declineReview(clientId: string, reviewId: string): Promise<boolean> {
    try {
      await this.repository.deletePendingReview(clientId, reviewId);
      return true;
    } catch (err) {
      console.warn('Failed to decline review via ReviewService:', err);
      return false;
    }
  }

  /**
   * Deletes a review.
   */
  async deleteReview(clientId: string, reviewId: string): Promise<boolean> {
    return this.declineReview(clientId, reviewId);
  }

  /**
   * Lists all pending reviews for an active client tenant.
   */
  async getPendingReviews(clientId: string): Promise<ReviewSubmissionItem[]> {
    return await this.repository.listPendingReviews(clientId);
  }

  /**
   * Attaches a real-time listener to pending reviews.
   */
  subscribePendingReviews(
    clientId: string,
    onData: (reviews: ReviewSubmissionItem[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    return this.repository.subscribePendingReviews(clientId, onData, onError);
  }
}

export const reviewService = new ReviewService();
