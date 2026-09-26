export interface PortfolioItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'bridal' | 'party' | 'festive' | 'video';
  mediaType: 'image' | 'video';
  imageUrl: string;
  alt: string;
  tag: string;
  highlightText: string;
  badge?: string;
  aspectRatio?: string;
  frameType?: 'arch' | 'asymmetric-1' | 'asymmetric-2' | 'oval';
  videoUrl?: string;
  hidden?: boolean;
}

export interface VideoShowcaseItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  duration: string;
  posterUrl: string;
  videoUrl: string;
  description: string;
  hidden?: boolean;
}

export interface BeforeAfterItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'bridal' | 'engagement' | 'party' | 'reception';
  beforeImageUrl: string;
  afterImageUrl: string;
  description?: string;
  hidden?: boolean;
}
