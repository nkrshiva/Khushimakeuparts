import type { ServiceItem, BridalPackage } from '../catalog/types';
import type { PortfolioItem, VideoShowcaseItem, BeforeAfterItem } from '../portfolio/types';
import type { PortfolioCategory } from '../../data/portfolioData';
import type {
  WhyKhushiBenefit,
  FAQItem,
  AnnouncementBarConfig,
  SEOConfig,
  AnalyticsConfig,
  OfferPopupConfig,
} from '../shared/types';
import type { ReviewSubmissionItem, TestimonialItem } from '../review/types';
import type { StaffMember } from '../staff/types';
import type { BusinessArchetype, ModuleId } from '../tenant/types';
import type { DateAvailabilityItem, BusinessHoursConfig } from '../booking/types';

export interface SiteBrand {
  name: string;
  founder: string;
  tagline: string;
  subtitle: string;
  servicesList: string;
  location: string;
  primaryServiceArea: string;
  phone: string;
  phoneDisplay: string;
  phoneHref: string;
  instagram: string;
  instagramProfileUrl: string;
  instagramDmUrl: string;
  whatsappUrl: string;
  googleMapsUrl?: string;
  logoUrl: string;
  heroPhotoUrl: string;
  artistPhotoUrl: string;
  homeServiceNotice: string;
  aboutStory?: {
    heading: string;
    subheading: string;
    quote: string;
    paragraph1: string;
    paragraph2: string;
    yearsExperience: string;
    happyClients: string;
  };
  philosophy?: {
    badge: string;
    quote: string;
    description: string;
  };
}

export interface SectionVisibilityConfig {
  announcementBar: boolean;
  hero: boolean;
  philosophy: boolean;
  services: boolean;
  portfolio: boolean;
  beforeAfter: boolean;
  testimonials: boolean;
  videos: boolean;
  dateAvailabilityCalendar: boolean;
  whyChooseUs: boolean;
  aboutStory: boolean;
  pricing: boolean;
  bridalPackages: boolean;
  bookingForm: boolean;
  faqs: boolean;
  finalCta: boolean;
  quickContactBar: boolean;
  offerPopup?: boolean;
}

export interface SiteContent {
  brand: SiteBrand;
  sectionsVisibility: SectionVisibilityConfig;
  announcementBar: AnnouncementBarConfig;
  services: ServiceItem[];
  bridalPackages: BridalPackage[];
  portfolioCategories: PortfolioCategory[];
  curatedPortfolio: PortfolioItem[];
  beforeAfterGallery?: BeforeAfterItem[];
  testimonials: TestimonialItem[];
  videos: VideoShowcaseItem[];
  calendarAvailability?: DateAvailabilityItem[];
  benefits: WhyKhushiBenefit[];
  faqs: FAQItem[];
  pendingReviews?: ReviewSubmissionItem[];
  seo: SEOConfig;
  analytics: AnalyticsConfig;
  offerPopup?: OfferPopupConfig;

  // Master Modular SaaS Platform Extensions
  archetype?: BusinessArchetype;
  enabledModules?: Partial<Record<ModuleId, boolean>>;
  businessHours?: BusinessHoursConfig;
  staff?: StaffMember[];
}
