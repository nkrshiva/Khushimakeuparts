export interface WhyKhushiBenefit {
  id: string;
  title: string;
  description: string;
  iconType: 'palette' | 'products' | 'occasion' | 'home' | 'expertise';
  hidden?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  hidden?: boolean;
}

export interface AnnouncementBarConfig {
  enabled: boolean;
  text: string;
  badge?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface SEOConfig {
  siteTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  ogImageUrl?: string;
  keywords?: string;
}

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  metaPixelId?: string;
}

export interface OfferPopupConfig {
  enabled: boolean;
  imageUrl: string;
  images?: string[];
  topBadgeText?: string;
  topTitle?: string;
  bottomHighlight?: string;
  bottomText?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  showOncePerSession?: boolean;
}
