export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface TestimonialItem {
  id: string;
  clientName: string;
  ceremony: string;
  date: string;
  rating: number; // 1 to 5
  reviewText: string;
  photoUrl: string;
  location?: string;
  hidden?: boolean;
  videoUrl?: string; // YouTube Short or MP4 video proof
  quote?: string; // Fallback alias for reviewText
  verified?: boolean;
}

export interface ReviewSubmissionItem {
  id: string;
  clientName: string;
  ceremony: string;
  eventDate: string;
  rating: number; // 1 to 5
  reviewText: string;
  photoUrl?: string;
  status: ReviewStatus;
  submittedAt: string;
}

export type CreateReviewInput = Omit<ReviewSubmissionItem, 'id' | 'status' | 'submittedAt'>;
