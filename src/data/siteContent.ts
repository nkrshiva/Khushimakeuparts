import {
  ServiceItem,
  PortfolioItem,
  VideoShowcaseItem,
  WhyKhushiBenefit,
  BridalPackage,
  FAQItem,
  TestimonialItem,
  AnnouncementBarConfig,
  SEOConfig,
  AnalyticsConfig,
  EnquiryItem,
  DateAvailabilityItem,
  BeforeAfterItem,
  ReviewSubmissionItem,
  OfferPopupConfig,
  BusinessArchetype,
  ModuleId,
  BusinessHoursConfig,
  StaffMember,
  AppointmentItem
} from '../types';
import { ARCHETYPE_PRESETS, DEFAULT_BUSINESS_HOURS } from './archetypePresets';
import { PortfolioCategory } from './portfolioData';
import {
  BRAND as DEFAULT_BRAND,
  SERVICES as DEFAULT_SERVICES,
  PORTFOLIO_ITEMS as DEFAULT_PORTFOLIO_ITEMS,
  VIDEO_SHOWCASE_ITEMS as DEFAULT_VIDEO_SHOWCASE_ITEMS,
  WHY_KHUSHI_BENEFITS as DEFAULT_WHY_KHUSHI_BENEFITS,
  BRIDAL_PACKAGES as DEFAULT_BRIDAL_PACKAGES,
  FAQ_ITEMS as DEFAULT_FAQ_ITEMS
} from './makeupData';
import { PORTFOLIO_CATEGORIES as DEFAULT_PORTFOLIO_CATEGORIES } from './portfolioData';
export type { SiteBrand, SectionVisibilityConfig, SiteContent } from '../domain/content/types';
import type { SiteBrand, SectionVisibilityConfig, SiteContent } from '../domain/content/types';

export const DEFAULT_SECTIONS_VISIBILITY: SectionVisibilityConfig = {
  announcementBar: true,
  hero: true,
  philosophy: true,
  services: true,
  portfolio: true,
  beforeAfter: true,
  testimonials: true,
  videos: true,
  dateAvailabilityCalendar: true,
  whyChooseUs: true,
  aboutStory: true,
  pricing: true,
  bridalPackages: true,
  bookingForm: true,
  faqs: true,
  finalCta: true,
  quickContactBar: true,
  offerPopup: true,
};

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    clientName: 'Pooja Verma',
    ceremony: 'Royal Bihari Bride',
    date: 'February 2026',
    rating: 5,
    reviewText:
      'Khushi made me feel like royalty on my wedding day. The base stayed 100% dewy and fresh through 14 hours of continuous rituals and photography. Every single guest asked who did my makeup!',
    photoUrl: '/portfolio/model-01.jpg',
    location: 'Siwan, Bihar',
    videoUrl: 'https://www.youtube.com/shorts/fkqzlnFsuA4',
    verified: true,
  },
  {
    id: 'test-2',
    clientName: 'Shreya Singhania',
    ceremony: 'Engagement & Ring Ceremony',
    date: 'January 2026',
    rating: 5,
    reviewText:
      'I wanted a soft glam pastel look that didn’t look cakey or artificial. Khushi understood my undertone perfectly and the eye detailing with subtle champagne shimmer was absolutely breathtaking.',
    photoUrl: '/portfolio/model2-01.jpeg',
    location: 'Patna, Bihar',
    videoUrl: 'https://www.youtube.com/shorts/5qap5aO4i9A',
    verified: true,
  },
  {
    id: 'test-3',
    clientName: 'Anjali Gupta',
    ceremony: 'Haldi & Sangeet',
    date: 'December 2025',
    rating: 5,
    reviewText:
      'The water-resistant primer used for my Haldi ceremony was incredible. Even with turmeric and rose petals, my makeup stayed pristine. Truly the most professional bridal vanity experience.',
    photoUrl: '/haldi-icon.jpg',
    location: 'Gopalganj, Bihar',
    videoUrl: 'https://www.youtube.com/shorts/DFCVBMnSMxY',
    verified: true,
  },
  {
    id: 'test-4',
    clientName: 'Neha Kumari',
    ceremony: 'Cocktail Reception',
    date: 'November 2025',
    rating: 5,
    reviewText:
      'From hair styling to the perfect smokey eye, the atelier experience in the comfort of my home was five stars. Punctual, polite, and exceptionally skilled.',
    photoUrl: '/party-icon.jpg',
    location: 'Siwan, Bihar',
    videoUrl: 'https://www.youtube.com/shorts/3JZ_D3ELwOQ',
    verified: true,
  },
];

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarConfig = {
  enabled: true,
  badge: 'WEDDING SEASON 2026–27',
  text: 'Bespoke bridal vanity bookings now open. Limited auspicious dates available.',
  linkText: 'Reserve Your Date',
  linkUrl: '#booking-concierge',
};

export const DEFAULT_SEO_CONFIG: SEOConfig = {
  siteTitle: 'Khushi Makeup Arts — Luxury Bridal & Occasion Makeup Artist',
  metaDescription:
    'Luxury bridal, engagement, and party makeup by Khushi in Siwan and across Bihar. Featuring HD luminous skin, bespoke hair design, and doorstep atelier vanity.',
  ogImage: '/portfolio/model-01.jpg',
};

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  googleAnalyticsId: '',
  metaPixelId: '',
};

export const DEFAULT_BEFORE_AFTER_GALLERY: BeforeAfterItem[] = [
  {
    id: 'ba-1',
    title: 'Signature Royal Bihari Bridal Glow',
    subtitle: 'High-Definition Waterproof HD Base & Royal Kohl Eyes',
    category: 'bridal',
    beforeImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=900&q=80',
    description: 'Raw skin prepped with 24K gold hydration serum followed by ultra-light seamless airbrush finish for 14-hour mandap endurance.',
  },
  {
    id: 'ba-2',
    title: 'Sangeet & Cocktail Shimmer Glam',
    subtitle: 'Champagne Lids, Sculpted Cheeks & Glass Finish',
    category: 'engagement',
    beforeImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80',
    description: 'Soft sculpted contour with sculpted champagne shimmer lids and glossy velvet berry lips designed for nighttime photography.',
  },
];

export const DEFAULT_CALENDAR_AVAILABILITY: DateAvailabilityItem[] = [
  { date: '2026-11-20', status: 'booked', note: 'Royal Bridal Wedding Mandap' },
  { date: '2026-11-21', status: 'booked', note: 'Evening Wedding Muhurat' },
  { date: '2026-11-22', status: 'limited', note: 'Only 1 Afternoon Slot Open' },
  { date: '2026-11-25', status: 'booked', note: 'Destination Wedding' },
  { date: '2026-11-28', status: 'available', note: 'Open for Booking' },
  { date: '2026-12-04', status: 'booked', note: 'Evening Wedding' },
  { date: '2026-12-05', status: 'limited', note: 'Morning Haldi Open' },
  { date: '2026-12-10', status: 'booked', note: 'Royal Reception' },
  { date: '2026-12-12', status: 'available', note: 'All Slots Open' },
];

export const DEFAULT_OFFER_POPUP: OfferPopupConfig = {
  enabled: true,
  imageUrl: '/portfolio/model-01.jpg',
  images: [
    '/portfolio/model-01.jpg',
    '/portfolio/model2-01.jpeg',
    '/portfolio/model3-01.jpg',
    '/portfolio/model4-01.jpg',
  ],
  topBadgeText: 'Limited Festive Offer',
  topTitle: 'Special Bridal Booking Privilege',
  bottomHighlight: 'Flat 15% Off On Full Bridal Packages',
  bottomText: 'Includes complimentary pre-wedding skin consultation',
  ctaButtonText: 'Reserve Your Date Now',
  ctaButtonLink: '#booking-form',
  showOncePerSession: true,
};


export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    ...DEFAULT_BRAND,
    googleMapsUrl: 'https://maps.google.com/?q=Siwan,+Bihar',
    aboutStory: {
      heading: 'Meet Khushi',
      subheading: 'Artist, visionary, and dedicated bridal beauty artisan in Siwan.',
      quote: '“Every bride carries a sacred grace. My artistry simply lets it shine with timeless confidence.”',
      paragraph1:
        'With 2 years of devoted hands-on craftsmanship across Siwan and Bihar, Khushi has redefined contemporary bridal elegance. Trained in both royal traditional Bihari aesthetics and modern feather-light HD glass skin techniques, she brings personalized atelier glamour right to your doorstep.',
      paragraph2:
        'From high-tension wedding mandap hours to joyful Haldi ceremonies, Khushi formulates waterproof, flash-proof looks tailored meticulously to your skin undertone, facial contours, and bridal couture.',
      yearsExperience: '2+',
      happyClients: '50+'
    },
    philosophy: {
      badge: 'studio philosophy',
      quote: '“You are already beautiful. Makeup simply brings your beauty forward.”',
      description:
        'Khushi believes makeup should enhance the beauty you already have, not hide who you are. Every look is built around your face, your features and your occasion — so what people notice, first and always, is you.'
    }
  },
  sectionsVisibility: DEFAULT_SECTIONS_VISIBILITY,
  announcementBar: DEFAULT_ANNOUNCEMENT_BAR,
  services: DEFAULT_SERVICES,
  bridalPackages: DEFAULT_BRIDAL_PACKAGES,
  portfolioCategories: DEFAULT_PORTFOLIO_CATEGORIES,
  curatedPortfolio: DEFAULT_PORTFOLIO_ITEMS,
  beforeAfterGallery: DEFAULT_BEFORE_AFTER_GALLERY,
  testimonials: DEFAULT_TESTIMONIALS,
  videos: DEFAULT_VIDEO_SHOWCASE_ITEMS,
  calendarAvailability: DEFAULT_CALENDAR_AVAILABILITY,
  benefits: DEFAULT_WHY_KHUSHI_BENEFITS,
  faqs: DEFAULT_FAQ_ITEMS,
  pendingReviews: [],
  seo: DEFAULT_SEO_CONFIG,
  analytics: DEFAULT_ANALYTICS_CONFIG,
  offerPopup: DEFAULT_OFFER_POPUP,

  // Default to Solo MUA for Khushi with complete MUA preset
  archetype: 'solo_mua',
  enabledModules: ARCHETYPE_PRESETS.solo_mua.defaultModules,
  businessHours: DEFAULT_BUSINESS_HOURS,
  staff: [],
};
