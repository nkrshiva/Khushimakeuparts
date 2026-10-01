import type {
  SiteContent,
  ClientTenantSummary,
  BusinessArchetype,
  TenantRole,
} from '../../types';
import {
  DEFAULT_SITE_CONTENT,
} from '../../data/siteContent';
import { ARCHETYPE_PRESETS, DEFAULT_BUSINESS_HOURS } from '../../data/archetypePresets';
import { authorizationService } from '../auth/AuthorizationService';
import {
  contentRepository,
  IContentRepository,
} from '../../repositories/content/ContentRepository';

export interface SaveContentResult {
  success: boolean;
  error?: string;
}

export interface IContentService {
  mergeWithDefaults(incoming?: any): SiteContent;
  createTailoredSiteContent(
    meta: ClientTenantSummary,
    archetypeOverride?: BusinessArchetype
  ): SiteContent;
  sanitizeForPersistence(content: SiteContent): SiteContent;
  getContent(clientId: string): Promise<SiteContent>;
  saveContent(
    role: TenantRole,
    assignedClientId: string | null,
    targetClientId: string,
    newContent: SiteContent
  ): Promise<SaveContentResult>;
  subscribeContent(
    clientId: string,
    onData: (content: SiteContent) => void,
    onError?: (err: Error) => void
  ): () => void;
  resetToDefault(
    role: TenantRole,
    assignedClientId: string | null,
    targetClientId: string
  ): Promise<SaveContentResult>;
}

/**
 * ContentService
 *
 * Domain service boundary orchestrating Site Content, Catalog management,
 * archetype tailoring, sanitization against parent document pollution,
 * and tenant-authorized storefront updates.
 * Contains ZERO direct Firebase SDK dependencies.
 */
export class ContentService implements IContentService {
  private repository: IContentRepository;

  constructor(repository: IContentRepository = contentRepository) {
    this.repository = repository;
  }

  /**
   * Deep-merges an incoming raw site content object with DEFAULT_SITE_CONTENT,
   * guaranteeing that every required section, list, and configuration structure exists.
   */
  mergeWithDefaults(incoming?: any): SiteContent {
    if (!incoming || typeof incoming !== 'object') {
      return DEFAULT_SITE_CONTENT;
    }

    return {
      ...DEFAULT_SITE_CONTENT,
      ...incoming,
      brand: {
        ...DEFAULT_SITE_CONTENT.brand,
        ...(incoming.brand || {}),
        aboutStory: {
          ...DEFAULT_SITE_CONTENT.brand.aboutStory,
          ...((incoming.brand && incoming.brand.aboutStory) || {}),
        },
        philosophy: {
          ...DEFAULT_SITE_CONTENT.brand.philosophy,
          ...((incoming.brand && incoming.brand.philosophy) || {}),
        },
      },
      sectionsVisibility: {
        ...DEFAULT_SITE_CONTENT.sectionsVisibility,
        ...(incoming.sectionsVisibility || {}),
      },
      announcementBar: {
        ...DEFAULT_SITE_CONTENT.announcementBar,
        ...(incoming.announcementBar || {}),
      },
      seo: {
        ...DEFAULT_SITE_CONTENT.seo,
        ...(incoming.seo || {}),
      },
      analytics: {
        ...DEFAULT_SITE_CONTENT.analytics,
        ...(incoming.analytics || {}),
      },
      services: Array.isArray(incoming.services) && incoming.services.length > 0
        ? incoming.services
        : DEFAULT_SITE_CONTENT.services,
      bridalPackages: Array.isArray(incoming.bridalPackages) && incoming.bridalPackages.length > 0
        ? incoming.bridalPackages
        : DEFAULT_SITE_CONTENT.bridalPackages,
      portfolioCategories: Array.isArray(incoming.portfolioCategories) && incoming.portfolioCategories.length > 0
        ? incoming.portfolioCategories
        : DEFAULT_SITE_CONTENT.portfolioCategories,
      curatedPortfolio: Array.isArray(incoming.curatedPortfolio) && incoming.curatedPortfolio.length > 0
        ? incoming.curatedPortfolio
        : DEFAULT_SITE_CONTENT.curatedPortfolio,
      testimonials: Array.isArray(incoming.testimonials)
        ? incoming.testimonials
        : DEFAULT_SITE_CONTENT.testimonials,
      pendingReviews: Array.isArray(incoming.pendingReviews)
        ? incoming.pendingReviews
        : (DEFAULT_SITE_CONTENT.pendingReviews || []),
      offerPopup: {
        ...DEFAULT_SITE_CONTENT.offerPopup,
        ...(incoming.offerPopup || {}),
        images: Array.isArray(incoming.offerPopup?.images)
          ? incoming.offerPopup.images
          : (incoming.offerPopup?.imageUrl
              ? [incoming.offerPopup.imageUrl]
              : (DEFAULT_SITE_CONTENT.offerPopup?.images || [DEFAULT_SITE_CONTENT.offerPopup?.imageUrl || ''])),
      },
      videos: Array.isArray(incoming.videos) && incoming.videos.length > 0
        ? incoming.videos
        : DEFAULT_SITE_CONTENT.videos,
      benefits: Array.isArray(incoming.benefits) && incoming.benefits.length > 0
        ? incoming.benefits
        : DEFAULT_SITE_CONTENT.benefits,
      faqs: Array.isArray(incoming.faqs) && incoming.faqs.length > 0
        ? incoming.faqs
        : DEFAULT_SITE_CONTENT.faqs,
      beforeAfterGallery: Array.isArray(incoming.beforeAfterGallery) && incoming.beforeAfterGallery.length > 0
        ? incoming.beforeAfterGallery
        : DEFAULT_SITE_CONTENT.beforeAfterGallery,
      calendarAvailability: Array.isArray(incoming.calendarAvailability) && incoming.calendarAvailability.length > 0
        ? incoming.calendarAvailability
        : DEFAULT_SITE_CONTENT.calendarAvailability,
      archetype: incoming.archetype || DEFAULT_SITE_CONTENT.archetype || 'solo_mua',
      enabledModules: {
        ...(ARCHETYPE_PRESETS[incoming.archetype as BusinessArchetype || 'solo_mua']?.defaultModules || DEFAULT_SITE_CONTENT.enabledModules),
        ...(incoming.enabledModules || {}),
      },
      businessHours: incoming.businessHours || DEFAULT_SITE_CONTENT.businessHours || DEFAULT_BUSINESS_HOURS,
      staff: Array.isArray(incoming.staff) ? incoming.staff : (DEFAULT_SITE_CONTENT.staff || []),
    };
  }

  /**
   * Synthesizes a tailored storefront site content and catalog preset for a newly created
   * or customized client tenant.
   */
  createTailoredSiteContent(
    meta: ClientTenantSummary,
    archetypeOverride?: BusinessArchetype
  ): SiteContent {
    const base: SiteContent = JSON.parse(JSON.stringify(DEFAULT_SITE_CONTENT));
    const archetype = archetypeOverride || meta.archetype || 'solo_mua';
    const preset = ARCHETYPE_PRESETS[archetype] || ARCHETYPE_PRESETS.solo_mua;
    const cleanPhone = (meta.phone || '').replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;

    base.archetype = archetype;
    base.enabledModules = { ...preset.defaultModules };
    base.businessHours = { ...preset.defaultBusinessHours };

    // Seed sample services if archetype provides them
    if (preset.sampleServices && preset.sampleServices.length > 0) {
      base.services = preset.sampleServices.map((s, idx) => ({
        ...DEFAULT_SITE_CONTENT.services[0],
        ...s,
        id: s.id || `service-${archetype}-${idx + 1}`,
      })) as any;
    }

    // Seed sample staff if archetype provides them
    if (preset.sampleStaff && preset.sampleStaff.length > 0) {
      base.staff = preset.sampleStaff.map((st, idx) => ({
        id: st.id || `staff-${idx + 1}`,
        name: st.name || 'Team Member',
        role: st.role || 'Stylist',
        workingDays: st.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        assignedServiceIds: st.assignedServiceIds || [],
        active: true,
      }));
    }

    base.brand = {
      ...base.brand,
      name: meta.name,
      founder: meta.founder,
      location: meta.city,
      phone: meta.phone,
      phoneDisplay: meta.phone,
      phoneHref: `tel:+${fullPhone}`,
      whatsappUrl: `https://wa.me/${fullPhone}?text=${encodeURIComponent(`Hello ${meta.founder}! ✨ I would like to inquire about ${preset.terminology.bookingNoun} at ${meta.name}.`)}`,
      instagram: meta.instagram,
      instagramDmUrl: `https://ig.me/m/${meta.instagram.replace('@', '')}`,
      tagline: `${preset.tagline} in ${meta.city}`,
      subtitle: `Signature artistry, curated care, and verified ${preset.terminology.serviceAreaNoun} in ${meta.city}.`,
      primaryServiceArea: meta.city,
      aboutStory: {
        ...base.brand.aboutStory,
        heading: `Meet ${meta.founder}`,
        subheading: `${preset.badge} and founder of ${meta.name} in ${meta.city}.`,
      },
    };

    base.seo = {
      ...base.seo,
      siteTitle: `${meta.name} | ${preset.name} in ${meta.city}`,
      metaDescription: `Official website for ${meta.name} in ${meta.city}. ${preset.tagline}.`,
    };

    return base;
  }

  /**
   * Sanitizes site content prior to Firestore persistence.
   * Strips all private operational collections (appointments, enquiries, customers, staff_private)
   * to strictly conform to firestore.rules anti-pollution validation.
   */
  sanitizeForPersistence(content: SiteContent): SiteContent {
    const clean: any = JSON.parse(JSON.stringify(content));

    // Strip operational subcollection data to prevent parent document bloat and rule violations
    delete clean.appointments;
    delete clean.enquiries;
    delete clean.customers;
    delete clean.staff_private;

    return clean as SiteContent;
  }

  /**
   * Retrieves tenant site content, merged with platform defaults.
   */
  async getContent(clientId: string): Promise<SiteContent> {
    const raw = await this.repository.getContent(clientId);
    return this.mergeWithDefaults(raw);
  }

  /**
   * Authorizes and saves site content for a specified tenant client ID.
   */
  async saveContent(
    role: TenantRole,
    assignedClientId: string | null,
    targetClientId: string,
    newContent: SiteContent
  ): Promise<SaveContentResult> {
    try {
      if (!targetClientId) {
        return { success: false, error: 'Target tenant ID is required.' };
      }

      // Authorization Guard
      if (!authorizationService.canEditTenantContent(role, assignedClientId, targetClientId)) {
        return {
          success: false,
          error: 'Permission denied: Cannot edit another tenant site.',
        };
      }

      const sanitized = this.sanitizeForPersistence(newContent);
      await this.repository.saveContent(targetClientId, sanitized);
      return { success: true };
    } catch (err: any) {
      console.warn('Failed to save site content via ContentService:', err);
      return {
        success: false,
        error: err?.message || 'Failed to save site content',
      };
    }
  }

  /**
   * Attaches a real-time listener to tenant site content, delivering merged defaults on each update.
   */
  subscribeContent(
    clientId: string,
    onData: (content: SiteContent) => void,
    onError?: (err: Error) => void
  ): () => void {
    return this.repository.subscribeContent(
      clientId,
      (raw) => {
        const merged = this.mergeWithDefaults(raw);
        onData(merged);
      },
      onError
    );
  }

  /**
   * Resets tenant site content to platform default content.
   */
  async resetToDefault(
    role: TenantRole,
    assignedClientId: string | null,
    targetClientId: string
  ): Promise<SaveContentResult> {
    return await this.saveContent(role, assignedClientId, targetClientId, DEFAULT_SITE_CONTENT);
  }
}

export const contentService = new ContentService();

export const mergeWithDefaults = (incoming?: any): SiteContent => {
  return contentService.mergeWithDefaults(incoming);
};

export const createTailoredSiteContent = (
  meta: ClientTenantSummary,
  archetypeOverride?: BusinessArchetype
): SiteContent => {
  return contentService.createTailoredSiteContent(meta, archetypeOverride);
};
