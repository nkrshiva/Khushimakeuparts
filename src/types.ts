export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: string;
  priceNum: number;
  duration: string;
  inclusions: string[];
  category: string;
  badge?: string;
  iconName: string;
}

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
}

export interface WhyKhushiBenefit {
  id: string;
  title: string;
  description: string;
  iconType: 'palette' | 'products' | 'occasion' | 'home' | 'expertise';
}

export interface BridalPackage {
  id: string;
  name: string;
  tier: string;
  description: string;
  features: string[];
  isRecommended?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  service: string;
  message: string;
}

export interface StoredBooking extends BookingFormData {
  id: string;
  createdAt: string;
}
