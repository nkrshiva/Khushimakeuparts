export interface PriceVariant {
  id: string;
  label: string; // e.g. 'Short Hair', 'Shoulder Length', 'Senior Stylist'
  price: string; // e.g. '₹1,500'
  priceNum: number;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  durationMinutes?: number;
}

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
  imageUrl?: string;
  hidden?: boolean;

  // Modular Extensions
  bookingMode?: 'wedding' | 'timeslot' | 'both';
  durationMinutes?: number;
  priceVariants?: PriceVariant[];
  addOns?: ServiceAddOn[];
  eligibleStaffIds?: string[];
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

export interface WhyKhushiBenefit {
  id: string;
  title: string;
  description: string;
  iconType: 'palette' | 'products' | 'occasion' | 'home' | 'expertise';
  hidden?: boolean;
}

export interface BridalPackage {
  id: string;
  name: string;
  tier: string;
  description: string;
  features: string[];
  isRecommended?: boolean;
  popular?: boolean;
  hidden?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  hidden?: boolean;
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

// ─── Production Suite Extensions ─────────────────────────────────────────────

export type EnquiryStatus = 'new' | 'contacted' | 'booked' | 'completed';

export interface EnquiryItem {
  id: string;
  clientName: string;
  phone: string;
  serviceId?: string;
  ceremonyType?: string;
  eventDate?: string;
  location?: string;
  notes?: string;
  status: EnquiryStatus;
  createdAt: string;
}

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

export type TenantLifecycleStatus = 'active' | 'suspended' | 'archived';

export interface ClientTenantSummary {
  id: string; // Unique URL slug, e.g. 'khushi', 'hina-hair-works'
  name: string; // Salon / Business Name
  founder: string; // Artist / Lead Name
  city: string; // Location / City
  phone: string; // WhatsApp / Phone
  instagram: string; // Instagram handle
  customDomain?: string; // Optional custom domain or subdomain
  archetype?: BusinessArchetype; // Tenant archetype preset (solo_mua, hair_salon, beauty_parlour, hybrid_atelier)
  status?: TenantLifecycleStatus; // 'active' | 'suspended' | 'archived'
  active: boolean; // Whether the site is live (alias for status === 'active')
  createdAt: string;
  updatedAt: string;
}

export interface AdminSessionContext {
  userRole: 'developer' | 'client' | null;
  effectiveTenantId: string | null;
  isDeveloperSuperAdmin: boolean;
  isDeveloperInspectingTenant: boolean;
}

// ─── MUA Vertical SaaS Extensions ───────────────────────────────────────────

export type AvailabilityStatus = 'booked' | 'limited' | 'available';

export interface DateAvailabilityItem {
  date: string; // ISO date 'YYYY-MM-DD'
  status: AvailabilityStatus;
  note?: string; // e.g. "Evening Muhurat Booked"
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

export interface ReviewSubmissionItem {
  id: string;
  clientName: string;
  ceremony: string;
  eventDate: string;
  rating: number; // 1 to 5
  reviewText: string;
  photoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface OfferPopupConfig {
  enabled: boolean;
  imageUrl: string;
  topBadgeText?: string;
  topTitle?: string;
  bottomHighlight?: string;
  bottomText?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  showOncePerSession?: boolean;
}

// ─── MASTER PLATFORM: ARCHETYPE & MODULAR SAAS TYPES ──────────────────────────

export type BusinessArchetype =
  | 'solo_mua'         // Solo Makeup Artist (bridal focus, auspicious calendar, venue visits)
  | 'hair_salon'       // Hair & Styling Salon (time slots, chairs, hair length tiers, stylists)
  | 'beauty_parlour'   // Parlour & Skin Aesthetics (facials, wax, threading, treatment rooms)
  | 'hybrid_atelier';  // Hybrid Luxury Atelier (bridal vanity + in-studio salon & aesthetics)

export type ModuleId =
  | 'coreCMS'               // Base branding, contacts, SEO, analytics
  | 'bridalPortfolio'       // Bridal looks, model galleries, video showcase
  | 'muaMuhuratCalendar'    // Auspicious wedding date availability markers
  | 'bridalPackages'        // Tiered luxury bridal packages
  | 'beforeAfterGallery'    // Transformation slider & looks comparison
  | 'videoShowcase'         // YouTube Shorts / reels portfolio
  | 'timeSlotBooking'       // Hourly / minute-interval appointment booking engine
  | 'staffManagement'       // Team members, stylists, aestheticians & assignments
  | 'serviceVariants'       // Length/tier-based pricing (Short/Medium/Long, Junior/Senior)
  | 'businessHours'         // Day-by-day opening hours, break times, and closed days
  | 'leadEnquiries'         // Wedding & event inquiry inbox
  | 'appointmentBookings'   // Confirmed appointment schedule manager
  | 'offerPopup'            // Artistic popup modal for seasonal promotions
  | 'reviewsModeration'     // Verified client reviews and selfie submission queue
  | 'walkInQueue';          // Live token / walk-in status

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  category: 'booking' | 'marketing' | 'operations' | 'content';
  defaultEnabled: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;    // '10:00'
  closeTime: string;   // '20:00'
  breakStart?: string; // '14:00'
  breakEnd?: string;   // '15:00'
}

export interface BusinessHoursConfig {
  timezone: string;            // 'Asia/Kolkata'
  slotIntervalMinutes: number; // 30 | 45 | 60
  bufferMinutes: number;       // 10
  schedule: DaySchedule[];
}

export interface PublicStaffProfile {
  id: string;
  name: string;
  role: string;                // 'Senior Hair Stylist', 'Skin Aesthetician', 'Lead Artist'
  avatarUrl?: string;
  assignedServiceIds: string[]; // IDs of services this staff member can deliver
  workingDays: DayOfWeek[];
  active: boolean;
}

export interface StaffMember extends PublicStaffProfile {
  phone?: string;
  internalNotes?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface AppointmentItem {
  id: string;
  clientId: string;            // Multi-tenant key (strict activeClientId)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceTitle: string;
  variantId?: string;
  variantLabel?: string;
  selectedAddOns?: ServiceAddOn[];
  staffId?: string;
  staffName?: string;
  date: string;                // 'YYYY-MM-DD'
  timeSlot: string;            // '11:00 AM'
  endTime?: string;            // '12:30 PM'
  startMinute: number;         // Minutes from midnight (e.g. 660 for 11:00 AM)
  endMinute: number;           // Minutes from midnight (e.g. 750 for 12:30 PM)
  durationMinutes: number;     // Total duration (base service + all add-ons)
  price: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  source: 'website' | 'phone' | 'walk_in';
  lockIds?: string[];          // Deterministic slot lock document IDs
}

export interface BusySlotItem {
  id: string;
  date: string;
  startMinute: number;
  endMinute: number;
  staffId?: string;
}

export interface SlotLockItem {
  id: string;                  // Deterministic lock key: `${date}_${staffId}_${blockMinute}`
  clientId: string;            // Multi-tenant key
  appointmentId: string;
  date: string;
  staffId: string;
  blockMinute: number;
  startMinute: number;
  endMinute: number;
  createdAt: string;
}

