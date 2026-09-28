/**
 * Authoritative Active Tenant Role
 *
 * Defines the authoritative active roles for platform and tenant authorization:
 * - 'developer': Platform Super Admin / Master Admin (access to all tenants & Master Cockpit)
 * - 'client': Tenant Owner / Salon Administrator (scoped strictly to assigned tenant)
 */
export type ActiveTenantRole = 'developer' | 'client' | 'employee';

/**
 * TenantRole in session/context state. Represents an active tenant role or `null` when unauthenticated.
 */
export type TenantRole = ActiveTenantRole | null;

export interface TenantUserProfile {
  uid?: string;
  email?: string;
  role?: ActiveTenantRole;
  assignedClientId?: string | null;
  employeeId?: string;
  permissions?: string[];
  displayName?: string;
  active?: boolean;
  invitationId?: string;
  invitationAcceptedAt?: string;
  updatedAt?: string;
}

export type TenantLifecycleStatus = 'active' | 'suspended' | 'archived' | 'pending_invitation';

export type TenantInvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface TenantInvitation {
  invitationId: string;
  clientId: string;
  invitedOwnerEmail: string;
  invitedByUid: string;
  invitedByEmail: string;
  status: TenantInvitationStatus;
  token: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
  acceptedByUid?: string | null;
  revokedAt?: string | null;
  revokedByUid?: string | null;
}

export interface CreateInvitationInput {
  clientId: string;
  invitedOwnerEmail: string;
  invitedByUid: string;
  invitedByEmail: string;
  expiresInHours?: number;
  customToken?: string;
}

export interface AcceptInvitationInput {
  invitationId: string;
  token: string;
  acceptingUser: {
    uid: string;
    email: string;
    emailVerified?: boolean;
  };
}

export interface AcceptInvitationResult {
  success: boolean;
  clientId?: string;
  invitation?: TenantInvitation;
  error?: string;
}

export type BusinessArchetype =
  | 'solo_mua'         // Solo Makeup Artist (bridal focus, auspicious calendar, venue visits)
  | 'hair_salon'       // Hair & Styling Salon (time slots, chairs, hair length tiers, stylists)
  | 'beauty_parlour'   // Parlour & Skin Aesthetics (facials, wax, threading, treatment rooms)
  | 'hybrid_atelier';  // Hybrid Luxury Atelier (bridal vanity + in-studio salon & aesthetics)

export interface ClientTenantSummary {
  id: string; // Unique URL slug, e.g. 'khushi', 'hina-hair-works'
  name: string; // Salon / Business Name
  founder: string; // Artist / Lead Name
  city: string; // Location / City
  phone: string; // WhatsApp / Phone
  instagram: string; // Instagram handle
  customDomain?: string; // Optional custom domain or subdomain
  storefrontUrl?: string; // Authoritative production storefront URL (e.g. 'https://naveensln.vercel.app' or custom domain)
  vercelProjectName?: string; // Dedicated Vercel project name
  deploymentStatus?: 'pending' | 'live' | 'error'; // Vercel project deployment status
  archetype?: BusinessArchetype; // Tenant archetype preset (solo_mua, hair_salon, beauty_parlour, hybrid_atelier)
  status?: TenantLifecycleStatus; // 'active' | 'suspended' | 'archived' | 'pending_invitation'
  active: boolean; // Whether the site is live (alias for status === 'active')
  invitedOwnerEmail?: string; // Invited owner email for pending_invitation onboarding
  createdAt: string;
  updatedAt: string;
}

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

export interface CreateTenantInput {
  name: string;
  founder: string;
  city: string;
  phone: string;
  instagram: string;
  customDomain?: string;
  archetype?: BusinessArchetype;
  invitedOwnerEmail?: string;
}

export interface CreateTenantResult {
  success: boolean;
  id?: string;
  summary?: ClientTenantSummary;
  invitation?: TenantInvitation;
  error?: string;
}

export interface SetTenantStatusResult {
  success: boolean;
  error?: string;
}

export interface DeleteTenantResult {
  success: boolean;
  error?: string;
}

export interface SyncModulesConfig {
  services?: boolean;
  preserveClientPricing?: boolean;
  bridalPackages?: boolean;
  portfolio?: boolean;
  videos?: boolean;
  faqs?: boolean;
  sectionsVisibility?: boolean;
  announcementBar?: boolean;
  benefits?: boolean;
  testimonials?: boolean;
}

export interface SyncClientsResult {
  success: boolean;
  updatedCount: number;
  error?: string;
}

export const DEFAULT_MAIN_CLIENT: ClientTenantSummary = {
  id: 'khushi',
  name: 'Khushi Makeup Arts',
  founder: 'Khushi Kumari',
  city: 'Siwan, Bihar',
  phone: '+91 91621 43273',
  instagram: '@khushimakeuparts',
  customDomain: 'khushimakeupart.vercel.app',
  storefrontUrl: 'https://khushi.atly.in',
  vercelProjectName: 'khushi',
  deploymentStatus: 'live',
  archetype: 'solo_mua',
  status: 'active',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

/**
 * Helper to identify whether a tenant ID represents the primary Khushi Makeup Arts tenant
 * across both legacy ('khushi') and canonical ('khushi-makeup-arts') identifiers.
 */
export const isKhushiTenantId = (id?: string | null): boolean => {
  return id === 'khushi' || id === 'khushi-makeup-arts';
};
