import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  collection,
  runTransaction,
  query,
  limit,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { SiteContent, DEFAULT_SITE_CONTENT } from '../data/siteContent';
import {
  EnquiryItem,
  EnquiryStatus,
  ClientTenantSummary,
  TenantLifecycleStatus,
  ReviewSubmissionItem,
  BusinessArchetype,
  ModuleId,
  BusinessHoursConfig,
  StaffMember,
  PublicStaffProfile,
  AppointmentItem,
  AppointmentStatus,
  BusySlotItem,
  SlotLockItem,
  DayOfWeek
} from '../types';
import { ARCHETYPE_PRESETS, DEFAULT_BUSINESS_HOURS } from '../data/archetypePresets';

interface ContentContextType {
  content: SiteContent;
  appointments: AppointmentItem[];
  enquiries: EnquiryItem[];
  busySlots: BusySlotItem[];
  loading: boolean;
  isFirebaseConnected: boolean;
  activeClientId: string;
  clientsList: ClientTenantSummary[];
  setActiveClientId: (id: string) => void;
  saveContent: (newContent: SiteContent, targetClientId?: string) => Promise<{ success: boolean; error?: string }>;
  createClientSite: (tenantData: {
    name: string;
    founder: string;
    city: string;
    phone: string;
    instagram: string;
    customDomain?: string;
    archetype?: BusinessArchetype;
  }) => Promise<{ success: boolean; id?: string; error?: string }>;
  deleteClientSite: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleClientStatus: (id: string, active: boolean) => Promise<boolean>;
  setTenantLifecycleStatus: (id: string, status: TenantLifecycleStatus) => Promise<boolean>;
  permanentDeleteTenant: (id: string, onProgress?: (msg: string) => void) => Promise<{ success: boolean; error?: string }>;
  syncContentToAllClients: (
    sourceContent: SiteContent,
    modulesToSync?: {
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
  ) => Promise<{ success: boolean; updatedCount: number; error?: string }>;
  resetToDefault: () => Promise<{ success: boolean; error?: string }>;
  exportConfigJson: () => string;
  importConfigJson: (jsonString: string) => Promise<{ success: boolean; error?: string }>;
  addEnquiry: (enquiry: Omit<EnquiryItem, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<boolean>;
  deleteEnquiry: (id: string) => Promise<boolean>;
  clearAllEnquiries: () => Promise<boolean>;
  addPendingReview: (review: ReviewSubmissionItem) => Promise<boolean>;

  // Master Modular SaaS Extensions
  isModuleEnabled: (moduleId: ModuleId) => boolean;
  setArchetypePreset: (archetype: BusinessArchetype) => Promise<boolean>;
  toggleModule: (moduleId: ModuleId, enabled?: boolean) => Promise<boolean>;
  addAppointment: (
    appointment: Omit<AppointmentItem, 'id' | 'createdAt' | 'status' | 'startMinute' | 'endMinute'> & {
      startMinute?: number;
      endMinute?: number;
    }
  ) => Promise<{
    success: boolean;
    error?: 'SLOT_TAKEN' | 'CLOSED' | 'INVALID_STAFF' | string;
    appointmentId?: string;
    assignedStaff?: { id: string; name: string };
  }>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  updateStaffList: (staff: StaffMember[]) => Promise<boolean>;
  updateBusinessHours: (hours: BusinessHoursConfig) => Promise<boolean>;
}

const DEFAULT_MAIN_CLIENT: ClientTenantSummary = {
  id: 'khushi',
  name: 'Khushi Makeup Arts',
  founder: 'Khushi Kumari',
  city: 'Siwan, Bihar',
  phone: '+91 91621 43273',
  instagram: '@khushimakeuparts',
  archetype: 'solo_mua',
  status: 'active',
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

const PLATFORM_REGISTRY_KEY = 'platform_clients_registry';
const PLATFORM_ACTIVE_CLIENT_KEY = 'platform_active_client_id';

const getLocalStorageKey = (clientId: string) => {
  return `tenant_content_${clientId}`;
};

const getTenantApptsKey = (clientId: string) => {
  return `tenant_appointments_${clientId}`;
};

const getTenantEnqsKey = (clientId: string) => {
  return `tenant_enquiries_${clientId}`;
};

const detectInitialClientId = (): string => {
  try {
    if (typeof window === 'undefined') return 'khushi';

    // 1. URL search parameter: ?client=pooja-makeovers (sanitize trailing slash)
    const params = new URLSearchParams(window.location.search);
    const rawClientParam = params.get('client')?.trim().toLowerCase();
    const clientParam = rawClientParam ? rawClientParam.replace(/\/+$/, '') : null;
    if (clientParam) return clientParam;

    // 2. Hash-based client parameter fallback: e.g. /#myadminpanel?client=pooja-makeovers
    const hash = window.location.hash;
    const hashParamMatch = hash.match(/[?&]client=([a-z0-9_-]+)/i);
    if (hashParamMatch && hashParamMatch[1]) {
      return hashParamMatch[1].toLowerCase().replace(/\/+$/, '');
    }

    // 3. Subdomain auto-detection (e.g. pooja.ateliersaas.com or pooja.localhost:3000)
    const hostname = window.location.hostname.toLowerCase();
    if (hostname && !hostname.startsWith('127.') && hostname !== 'localhost') {
      const parts = hostname.split('.');
      // Check for subdomains like pooja.domain.com or pooja.vercel.app
      if (parts.length >= 3 && parts[0] !== 'www') {
        return parts[0];
      }

      // Check for custom domains matching registered clients
      try {
        const cachedRegistry = localStorage.getItem(PLATFORM_REGISTRY_KEY) || localStorage.getItem('khushi_clients_registry');
        if (cachedRegistry) {
          const parsedClients: ClientTenantSummary[] = JSON.parse(cachedRegistry);
          const matched = parsedClients.find(
            (c) => c.customDomain && c.customDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '') === hostname
          );
          if (matched) return matched.id;
        }
      } catch {}
    }

    // 4. Hash-based client route: #/c/pooja-makeovers
    const match = hash.match(/#\/c\/([a-z0-9_-]+)/i);
    if (match && match[1]) return match[1].toLowerCase().replace(/\/+$/, '');

    // 5. Stored preference
    const stored = (localStorage.getItem(PLATFORM_ACTIVE_CLIENT_KEY) || localStorage.getItem('khushi_active_client_id'))?.trim().toLowerCase().replace(/\/+$/, '');
    if (stored) return stored;
  } catch {}
  return 'khushi';
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const mergeWithDefaults = (incoming?: any): SiteContent => {
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
        ...(incoming.brand?.aboutStory || {}),
      },
      philosophy: {
        ...DEFAULT_SITE_CONTENT.brand.philosophy,
        ...(incoming.brand?.philosophy || {}),
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
    testimonials: Array.isArray(incoming.testimonials) && incoming.testimonials.length > 0
      ? incoming.testimonials.map((t: any, idx: number) => {
          const fallbackMatch = DEFAULT_SITE_CONTENT.testimonials[idx] || DEFAULT_SITE_CONTENT.testimonials[0];
          return {
            ...fallbackMatch,
            ...t,
            videoUrl: t.videoUrl?.trim() || fallbackMatch?.videoUrl || 'https://www.youtube.com/shorts/fkqzlnFsuA4',
          };
        })
      : DEFAULT_SITE_CONTENT.testimonials,
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
    pendingReviews: Array.isArray(incoming.pendingReviews) ? incoming.pendingReviews : [],

    // Modular SaaS additions
    archetype: incoming.archetype || DEFAULT_SITE_CONTENT.archetype || 'solo_mua',
    enabledModules: {
      ...(ARCHETYPE_PRESETS[incoming.archetype as BusinessArchetype || 'solo_mua']?.defaultModules || DEFAULT_SITE_CONTENT.enabledModules),
      ...(incoming.enabledModules || {}),
    },
    businessHours: incoming.businessHours || DEFAULT_BUSINESS_HOURS,
    staff: Array.isArray(incoming.staff) ? incoming.staff : (DEFAULT_SITE_CONTENT.staff || []),
  };
};

export const createTailoredSiteContent = (meta: ClientTenantSummary, archetypeOverride?: BusinessArchetype): SiteContent => {
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
};

// Safe Firestore write helper with timeout protection so offline or slow connections never block the UI
const safeFirestoreWrite = async (
  writeFn: () => Promise<any>,
  timeoutMs = 2500
): Promise<boolean> => {
  if (!db) return false;
  try {
    const timeoutPromise = new Promise<{ isTimeout: true }>((resolve) =>
      setTimeout(() => resolve({ isTimeout: true }), timeoutMs)
    );
    const result = await Promise.race([writeFn(), timeoutPromise]);
    if (result && typeof result === 'object' && 'isTimeout' in result) {
      console.info(`Firestore operation backgrounded after ${timeoutMs}ms timeout. Local state preserved.`);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Firestore write warning:', err?.message || err);
    return false;
  }
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, assignedClientId } = useAuth();
  const [activeClientId, setActiveClientIdState] = useState<string>(detectInitialClientId);

  // Clients registry list
  const [clientsList, setClientsList] = useState<ClientTenantSummary[]>(() => {
    try {
      const cached = localStorage.getItem(PLATFORM_REGISTRY_KEY) || localStorage.getItem('khushi_clients_registry');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [DEFAULT_MAIN_CLIENT];
  });

  // Helper to migrate legacy localStorage namespaces to neutral keys
  const migrateLegacyStorage = (clientId: string) => {
    try {
      const key = getLocalStorageKey(clientId);
      const cached = localStorage.getItem(key) || localStorage.getItem(`khushi_tenant_content_${clientId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        let modified = false;
        if (parsed.appointments && Array.isArray(parsed.appointments)) {
          const apptKey = getTenantApptsKey(clientId);
          if (!localStorage.getItem(apptKey) && parsed.appointments.length > 0) {
            localStorage.setItem(apptKey, JSON.stringify(parsed.appointments));
          }
          delete parsed.appointments;
          modified = true;
        }
        if (parsed.enquiries && Array.isArray(parsed.enquiries)) {
          const enqKey = getTenantEnqsKey(clientId);
          if (!localStorage.getItem(enqKey) && parsed.enquiries.length > 0) {
            localStorage.setItem(enqKey, JSON.stringify(parsed.enquiries));
          }
          delete parsed.enquiries;
          modified = true;
        }
        if (modified) {
          localStorage.setItem(key, JSON.stringify(parsed));
        } else if (!localStorage.getItem(key)) {
          localStorage.setItem(key, cached);
        }
      }

      // Migrate legacy khushi_custom_site_content_v1 to standardized tenant storage key
      const v1 = localStorage.getItem('khushi_custom_site_content_v1');
      if (v1 && !localStorage.getItem(getLocalStorageKey('khushi'))) {
        localStorage.setItem(getLocalStorageKey('khushi'), v1);
      }

      // Migrate legacy appts and enqs keys
      const oldApptKey = `khushi_tenant_appointments_${clientId}`;
      const newApptKey = getTenantApptsKey(clientId);
      const oldAppts = localStorage.getItem(oldApptKey);
      if (oldAppts && !localStorage.getItem(newApptKey)) {
        localStorage.setItem(newApptKey, oldAppts);
      }

      const oldEnqKey = `khushi_tenant_enquiries_${clientId}`;
      const newEnqKey = getTenantEnqsKey(clientId);
      const oldEnqs = localStorage.getItem(oldEnqKey);
      if (oldEnqs && !localStorage.getItem(newEnqKey)) {
        localStorage.setItem(newEnqKey, oldEnqs);
      }
    } catch (err) {
      console.warn('Legacy storage migration notice:', err);
    }
  };

  // Run initial migration
  migrateLegacyStorage(activeClientId);

  // Content state for the currently active tenant (pure CMS and configurations)
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const key = getLocalStorageKey(activeClientId);
      const cached = localStorage.getItem(key) || localStorage.getItem(`khushi_tenant_content_${activeClientId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        return mergeWithDefaults(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse local site content cache', e);
    }
    return DEFAULT_SITE_CONTENT;
  });

  // Private operational states isolated from SiteContent
  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => {
    try {
      const cached = localStorage.getItem(getTenantApptsKey(activeClientId)) || localStorage.getItem(`khushi_tenant_appointments_${activeClientId}`);
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });

  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(() => {
    try {
      const cached = localStorage.getItem(getTenantEnqsKey(activeClientId)) || localStorage.getItem(`khushi_tenant_enquiries_${activeClientId}`);
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });

  // Anonymized busy slots for public collision detection (zero customer PII)
  const [busySlots, setBusySlots] = useState<BusySlotItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Anti-tampering gate: For client role, effective tenant must ALWAYS strictly equal assignedClientId
  useEffect(() => {
    if (role === 'client' && assignedClientId) {
      if (activeClientId !== assignedClientId) {
        console.warn(`Anti-tamper enforcement: Active client ${activeClientId} redirected to authorized tenant ${assignedClientId}`);
        setActiveClientIdState(assignedClientId);
        try {
          localStorage.setItem(PLATFORM_ACTIVE_CLIENT_KEY, assignedClientId);
          const url = new URL(window.location.href);
          url.searchParams.set('client', assignedClientId);
          window.history.replaceState(null, '', url.toString());
        } catch {}
      }
    }
  }, [role, assignedClientId, activeClientId]);

  // 1. Sync Clients Registry from Firestore
  useEffect(() => {
    if (!db) return;
    try {
      const regDocRef = doc(db, 'settings', 'clients_registry');
      const unsubscribe = onSnapshot(
        regDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (Array.isArray(data?.clients) && data.clients.length > 0) {
              setClientsList(data.clients);
              try {
                localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(data.clients));
              } catch {}
            }
          }
        },
        (err) => {
          console.warn('Clients registry sync notice:', err.message);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not attach clients registry listener:', err);
    }
  }, []);

  // Sync active client ID dynamically when URL query param or hash changes (for public and developer)
  useEffect(() => {
    const handleUrlChange = () => {
      // Client users cannot switch tenant context via URL
      if (role === 'client' && assignedClientId) {
        if (activeClientId !== assignedClientId) {
          setActiveClientIdState(assignedClientId);
        }
        return;
      }
      const detected = detectInitialClientId();
      if (detected && detected !== activeClientId) {
        setActiveClientIdState(detected);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [activeClientId, role, assignedClientId]);

  // 2. Real-time sync for active client's content
  useEffect(() => {
    // When active client changes, first load from local cache
    try {
      const key = getLocalStorageKey(activeClientId);
      const cached = localStorage.getItem(key);
      if (cached) {
        setContent(mergeWithDefaults(JSON.parse(cached)));
      } else {
        const clientMeta = clientsList.find((c) => c.id === activeClientId);
        if (clientMeta) {
          setContent(createTailoredSiteContent(clientMeta));
        } else if (activeClientId === 'khushi') {
          setContent(DEFAULT_SITE_CONTENT);
        }
      }
    } catch {}

    if (!db) {
      setIsFirebaseConnected(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      // Primary document for this tenant: clients/{activeClientId}
      const tenantDocRef = doc(db, 'clients', activeClientId);

      unsubscribe = onSnapshot(
        tenantDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const remoteData = snapshot.data();
            const rawContent = remoteData?.content || remoteData;
            const merged = mergeWithDefaults(rawContent);
            setContent(merged);
            try {
              localStorage.setItem(getLocalStorageKey(activeClientId), JSON.stringify(merged));
            } catch {}
            setIsFirebaseConnected(true);
          } else {
            setIsFirebaseConnected(true);
          }
        },
        (err) => {
          console.warn(`Firestore sync notice for client '${activeClientId}':`, err.message);
          setIsFirebaseConnected(false);
        }
      );
    } catch (err: any) {
      console.warn('Could not attach Firestore snapshot:', err?.message || err);
      setIsFirebaseConnected(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeClientId, clientsList]);

  // 3. Real-time sync for active client's private appointments subcollection (Admin only)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(getTenantApptsKey(activeClientId));
      if (cached) {
        setAppointments(JSON.parse(cached));
      } else {
        setAppointments([]);
      }
    } catch {}

    if (!db || !activeClientId) return;

    let unsubscribe: (() => void) | undefined;
    try {
      const aptColRef = collection(db, 'clients', activeClientId, 'appointments');
      unsubscribe = onSnapshot(
        aptColRef,
        (snapshot) => {
          const list: AppointmentItem[] = [];
          snapshot.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as AppointmentItem);
          });
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setAppointments(list);
          try {
            localStorage.setItem(getTenantApptsKey(activeClientId), JSON.stringify(list));
          } catch {}
        },
        () => {
          // Public visitors cannot read appointments subcollection (expected denial)
        }
      );
    } catch (err) {
      console.warn('Could not attach appointments subcollection listener:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeClientId]);

  // 4. Real-time sync for active client's private enquiries subcollection (Admin only)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(getTenantEnqsKey(activeClientId));
      if (cached) {
        setEnquiries(JSON.parse(cached));
      } else {
        setEnquiries([]);
      }
    } catch {}

    if (!db || !activeClientId) return;

    let unsubscribe: (() => void) | undefined;
    try {
      const enqColRef = collection(db, 'clients', activeClientId, 'enquiries');
      unsubscribe = onSnapshot(
        enqColRef,
        (snapshot) => {
          const list: EnquiryItem[] = [];
          snapshot.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as EnquiryItem);
          });
          list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setEnquiries(list);
          try {
            localStorage.setItem(getTenantEnqsKey(activeClientId), JSON.stringify(list));
          } catch {}
        },
        () => {
          // Public visitors cannot read enquiries subcollection (expected denial)
        }
      );
    } catch (err) {
      console.warn('Could not attach enquiries subcollection listener:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeClientId]);

  // 5. Real-time sync for active client's anonymized busy slots (Public booking collision detection)
  useEffect(() => {
    if (!db || !activeClientId) return;

    let unsubscribe: (() => void) | undefined;
    try {
      const busyColRef = collection(db, 'clients', activeClientId, 'busy_slots');
      unsubscribe = onSnapshot(
        busyColRef,
        (snapshot) => {
          const list: BusySlotItem[] = [];
          snapshot.forEach((d) => {
            list.push({ ...d.data(), id: d.id } as BusySlotItem);
          });
          setBusySlots(list);
        },
        (err) => {
          console.warn('Busy slots sync notice:', err.message);
        }
      );
    } catch (err) {
      console.warn('Could not attach busy slots listener:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeClientId]);

  // Switch active client
  const setActiveClientId = (newId: string) => {
    const cleanId = newId.trim().toLowerCase();
    if (!cleanId) return;

    // Strict Anti-Tamper check for client users
    if (role === 'client' && assignedClientId && cleanId !== assignedClientId) {
      console.warn('Unauthorized tenant switch attempted by client user. Enforcing assignedClientId.');
      return;
    }

    setActiveClientIdState(cleanId);
    try {
      localStorage.setItem(PLATFORM_ACTIVE_CLIENT_KEY, cleanId);

      // Cleanly reflect in URL query parameter without page reload
      const url = new URL(window.location.href);
      url.searchParams.set('client', cleanId);
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };

  // Save content for active client or target client
  const saveContent = async (newContent: SiteContent, targetClientId?: string): Promise<{ success: boolean; error?: string }> => {
    const targetId = (targetClientId || activeClientId).trim().toLowerCase();
    try {
      // 1. Update React state immediately
      setContent(newContent);
      try {
        localStorage.setItem(getLocalStorageKey(targetId), JSON.stringify(newContent));
      } catch (lsErr) {
        console.warn('LocalStorage save notice:', lsErr);
      }

      // Sanitize staff list in public document to ensure zero private staff PII (phone, notes) is exposed
      const sanitizedStaff: PublicStaffProfile[] = (newContent.staff || []).map((st) => ({
        id: st.id,
        name: st.name,
        role: st.role,
        avatarUrl: st.avatarUrl,
        assignedServiceIds: st.assignedServiceIds || [],
        workingDays: st.workingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        active: st.active !== false,
      }));

      const publicContentToSave: SiteContent = {
        ...newContent,
        staff: sanitizedStaff,
      };

      // 2. Persist strictly to /clients/{targetId} with ZERO dual-writes to /settings/siteContent
      if (db) {
        const synced = await safeFirestoreWrite(async () => {
          const clientDocRef = doc(db, 'clients', targetId);
          await setDoc(clientDocRef, {
            id: targetId,
            name: newContent.brand.name,
            founder: newContent.brand.founder,
            city: newContent.brand.location,
            phone: newContent.brand.phone,
            instagram: newContent.brand.instagram,
            active: true,
            status: 'active',
            updatedAt: new Date().toISOString(),
            content: publicContentToSave,
          }, { merge: true });
        }, 2200);

        if (synced) {
          setIsFirebaseConnected(true);
        }
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to save content' };
    }
  };

  // Create a brand new client website
  const createClientSite = async (tenantData: {
    name: string;
    founder: string;
    city: string;
    phone: string;
    instagram: string;
    customDomain?: string;
    archetype?: BusinessArchetype;
  }): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      const cleanName = tenantData.name.trim();
      if (!cleanName) return { success: false, error: 'Salon / Brand name is required' };

      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const id = slug || `client-${Date.now()}`;

      if (clientsList.some((c) => c.id === id)) {
        return { success: false, error: `A client website with ID "${id}" already exists.` };
      }

      const newSummary: ClientTenantSummary = {
        id,
        name: cleanName,
        founder: tenantData.founder.trim() || 'Lead Artist',
        city: tenantData.city.trim() || 'City',
        phone: tenantData.phone.trim() || '+91 98765 43210',
        instagram: tenantData.instagram.trim() || '@salon',
        customDomain: tenantData.customDomain?.trim() || undefined,
        archetype: tenantData.archetype || 'solo_mua',
        status: 'active',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tailoredContent = createTailoredSiteContent(newSummary, tenantData.archetype || 'solo_mua');

      const updatedList = [...clientsList, newSummary];
      setClientsList(updatedList);
      try {
        localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(updatedList));
        localStorage.setItem(getLocalStorageKey(id), JSON.stringify(tailoredContent));
      } catch {}

      if (db) {
        safeFirestoreWrite(async () => {
          // Save tenant document
          await setDoc(doc(db, 'clients', id), {
            ...newSummary,
            content: tailoredContent,
          });
          // Update registry
          await setDoc(doc(db, 'settings', 'clients_registry'), {
            clients: updatedList,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }, 3000);
      }

      return { success: true, id };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create client website' };
    }
  };

  // Set tenant lifecycle status: 'active' | 'suspended' | 'archived'
  const setTenantLifecycleStatus = async (id: string, status: TenantLifecycleStatus): Promise<boolean> => {
    try {
      const updatedList = clientsList.map((c) =>
        c.id === id ? { ...c, status, active: status === 'active', updatedAt: new Date().toISOString() } : c
      );
      setClientsList(updatedList);
      try {
        localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(updatedList));
      } catch {}

      if (db) {
        safeFirestoreWrite(async () => {
          await setDoc(doc(db, 'clients', id), {
            status,
            active: status === 'active',
            updatedAt: new Date().toISOString()
          }, { merge: true });
          await setDoc(doc(db, 'settings', 'clients_registry'), {
            clients: updatedList,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }, 2000);
      }
      return true;
    } catch {
      return false;
    }
  };

  // Toggle client active/suspended status (backward compatibility alias)
  const toggleClientStatus = async (id: string, active: boolean): Promise<boolean> => {
    return setTenantLifecycleStatus(id, active ? 'active' : 'suspended');
  };

  // Scalable paginated chunked subcollection purge and permanent tenant deletion
  const permanentDeleteTenant = async (
    id: string,
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      onProgress?.('Preparing subcollection purge...');
      const subcollections = [
        'slot_locks',
        'busy_slots',
        'appointments',
        'enquiries',
        'staff_private',
        'staff',
        'pending_reviews'
      ];

      if (db) {
        for (const sub of subcollections) {
          onProgress?.(`Purging ${sub}...`);
          let totalDeletedInSub = 0;
          while (true) {
            const subColRef = collection(db, 'clients', id, sub);
            const q = query(subColRef, limit(300));
            const snap = await getDocs(q);
            if (snap.empty) break;

            const batch = writeBatch(db);
            snap.docs.forEach((docItem) => batch.delete(docItem.ref));
            await batch.commit();
            totalDeletedInSub += snap.size;
            onProgress?.(`Purged ${totalDeletedInSub} docs in ${sub}...`);
          }
        }

        onProgress?.('Deleting parent tenant document...');
        await deleteDoc(doc(db, 'clients', id));
      }

      // Update registry
      const updatedList = clientsList.filter((c) => c.id !== id);
      setClientsList(updatedList);
      try {
        localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(updatedList));
        localStorage.removeItem(getLocalStorageKey(id));
        localStorage.removeItem(getTenantApptsKey(id));
        localStorage.removeItem(getTenantEnqsKey(id));
      } catch {}

      if (db) {
        safeFirestoreWrite(async () => {
          await setDoc(doc(db, 'settings', 'clients_registry'), {
            clients: updatedList,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }, 2500);
      }

      if (activeClientId === id) {
        const fallbackId = updatedList[0]?.id || 'khushi';
        setActiveClientId(fallbackId);
      }

      onProgress?.('Tenant deletion completed successfully.');
      return { success: true };
    } catch (err: any) {
      console.error('Failed to permanently delete tenant:', err);
      return { success: false, error: err?.message || 'Failed to permanently delete tenant' };
    }
  };

  // Delete a client website (delegates to permanentDeleteTenant)
  const deleteClientSite = async (id: string): Promise<{ success: boolean; error?: string }> => {
    return permanentDeleteTenant(id);
  };

  // Sync content updates from Main Master Site to all client sites while preserving their unique identity
  const syncContentToAllClients = async (
    sourceContent: SiteContent,
    modulesToSync?: {
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
  ): Promise<{ success: boolean; updatedCount: number; error?: string }> => {
    const defaultModules = {
      services: true,
      preserveClientPricing: true,
      bridalPackages: true,
      portfolio: true,
      videos: true,
      faqs: true,
      sectionsVisibility: true,
      announcementBar: true,
      benefits: true,
      testimonials: true,
      ...modulesToSync,
    };

    const clientTenants = clientsList.filter((c) => c.id !== 'khushi');
    if (clientTenants.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    try {
      let updatedCount = 0;

      for (const client of clientTenants) {
        // 1. Get client's current content
        let currentClientContent: SiteContent;
        try {
          const cached = localStorage.getItem(getLocalStorageKey(client.id));
          if (cached) {
            currentClientContent = mergeWithDefaults(JSON.parse(cached));
          } else {
            currentClientContent = createTailoredSiteContent(client);
          }
        } catch {
          currentClientContent = createTailoredSiteContent(client);
        }

        // 2. Clone client content and carefully preserve client's unique brand identity
        const updated: SiteContent = {
          ...currentClientContent,
          brand: {
            ...currentClientContent.brand,
            name: client.name,
            founder: client.founder,
            location: client.city,
            primaryServiceArea: client.city,
            phone: client.phone,
            instagram: client.instagram,
          },
          // Synchronize only the selected modules from sourceContent
          ...(defaultModules.services
            ? {
                services: sourceContent.services.map((srcService) => {
                  // Keep individual client's custom pricing intact if requested
                  if (defaultModules.preserveClientPricing) {
                    const existing = currentClientContent.services?.find((s) => s.id === srcService.id);
                    if (existing && (existing.price || existing.priceNum !== undefined)) {
                      return {
                        ...JSON.parse(JSON.stringify(srcService)),
                        price: existing.price,
                        priceNum: existing.priceNum,
                      };
                    }
                  }
                  return JSON.parse(JSON.stringify(srcService));
                }),
              }
            : {}),
          ...(defaultModules.bridalPackages ? { bridalPackages: JSON.parse(JSON.stringify(sourceContent.bridalPackages)) } : {}),
          ...(defaultModules.portfolio ? { portfolioCategories: JSON.parse(JSON.stringify(sourceContent.portfolioCategories)) } : {}),
          ...(defaultModules.videos ? { videos: JSON.parse(JSON.stringify(sourceContent.videos)) } : {}),
          ...(defaultModules.faqs ? { faqs: JSON.parse(JSON.stringify(sourceContent.faqs)) } : {}),
          ...(defaultModules.sectionsVisibility ? { sectionsVisibility: JSON.parse(JSON.stringify(sourceContent.sectionsVisibility)) } : {}),
          ...(defaultModules.announcementBar ? { announcementBar: JSON.parse(JSON.stringify(sourceContent.announcementBar)) } : {}),
          ...(defaultModules.benefits ? { benefits: JSON.parse(JSON.stringify(sourceContent.benefits)) } : {}),
          ...(defaultModules.testimonials ? { testimonials: JSON.parse(JSON.stringify(sourceContent.testimonials)) } : {}),
        };

        // 3. Update localStorage for client
        try {
          localStorage.setItem(getLocalStorageKey(client.id), JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage error during sync for client:', client.id, e);
        }

        // 4. Update Firestore for client
        if (db) {
          safeFirestoreWrite(async () => {
            await setDoc(doc(db, 'clients', client.id), {
              ...client,
              updatedAt: new Date().toISOString(),
              content: updated,
            }, { merge: true });
          }, 3000);
        }

        updatedCount++;
      }

      return { success: true, updatedCount };
    } catch (err: any) {
      console.error('Error during global client sync:', err);
      return { success: false, updatedCount: 0, error: err?.message || 'Sync failed' };
    }
  };

  // Enquiry methods scoped exclusively to active client subcollection
  const addEnquiry = async (enquiryData: Omit<EnquiryItem, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    try {
      const cleanPhone = (enquiryData.phone || '').replace(/[^0-9]/g, '');

      const existingIdx = enquiries.findIndex((item) => {
        const itemCleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
        const hasMatchingPhone = cleanPhone && itemCleanPhone && cleanPhone === itemCleanPhone;
        const hasMatchingIdentity =
          item.clientName?.trim().toLowerCase() === enquiryData.clientName?.trim().toLowerCase() &&
          item.ceremonyType === enquiryData.ceremonyType &&
          item.location === enquiryData.location;

        if (hasMatchingPhone || hasMatchingIdentity) {
          const existingTime = new Date(item.createdAt).getTime();
          const diffMinutes = (Date.now() - existingTime) / (1000 * 60);
          return diffMinutes < 30;
        }
        return false;
      });

      let updatedList: EnquiryItem[];
      let targetId: string;
      if (existingIdx !== -1) {
        updatedList = [...enquiries];
        targetId = updatedList[existingIdx].id;
        updatedList[existingIdx] = {
          ...updatedList[existingIdx],
          ...enquiryData,
          notes: enquiryData.notes || updatedList[existingIdx].notes,
          createdAt: new Date().toISOString(),
        };
      } else {
        targetId = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newEnquiry: EnquiryItem = {
          ...enquiryData,
          id: targetId,
          status: 'new',
          createdAt: new Date().toISOString(),
        };
        updatedList = [newEnquiry, ...enquiries];
      }

      setEnquiries(updatedList);
      try {
        localStorage.setItem(getTenantEnqsKey(activeClientId), JSON.stringify(updatedList));
      } catch (err) {
        console.warn('LocalStorage save notice:', err);
      }

      if (db) {
        safeFirestoreWrite(async () => {
          // Write strictly to isolated subcollection
          const enqDocRef = doc(db, 'clients', activeClientId, 'enquiries', targetId);
          const savedItem = updatedList.find((e) => e.id === targetId);
          if (savedItem) {
            await setDoc(enqDocRef, savedItem);
          }
        }, 2000);
      }
      return true;
    } catch (e) {
      console.warn('Failed to record inquiry:', e);
      return false;
    }
  };

  const updateEnquiryStatus = async (id: string, status: EnquiryStatus): Promise<boolean> => {
    try {
      const updatedList = enquiries.map((item) =>
        item.id === id ? { ...item, status } : item
      );
      setEnquiries(updatedList);
      try {
        localStorage.setItem(getTenantEnqsKey(activeClientId), JSON.stringify(updatedList));
      } catch {}

      if (db) {
        safeFirestoreWrite(async () => {
          const enqDocRef = doc(db, 'clients', activeClientId, 'enquiries', id);
          await setDoc(enqDocRef, { status }, { merge: true });
        }, 2000);
      }
      return true;
    } catch (e) {
      console.warn('Failed to update enquiry status:', e);
      return false;
    }
  };

  const deleteEnquiry = async (id: string): Promise<boolean> => {
    try {
      const updatedList = enquiries.filter((item) => item.id !== id);
      setEnquiries(updatedList);
      try {
        localStorage.setItem(getTenantEnqsKey(activeClientId), JSON.stringify(updatedList));
      } catch {}

      if (db) {
        safeFirestoreWrite(async () => {
          await deleteDoc(doc(db, 'clients', activeClientId, 'enquiries', id));
        }, 2000);
      }
      return true;
    } catch (e) {
      console.warn('Failed to delete enquiry:', e);
      return false;
    }
  };

  const clearAllEnquiries = async (): Promise<boolean> => {
    try {
      const currentList = [...enquiries];
      setEnquiries([]);
      try {
        localStorage.setItem(getTenantEnqsKey(activeClientId), JSON.stringify([]));
      } catch {}

      if (db) {
        safeFirestoreWrite(async () => {
          for (const item of currentList) {
            await deleteDoc(doc(db, 'clients', activeClientId, 'enquiries', item.id));
          }
        }, 3000);
      }
      return true;
    } catch (e) {
      console.warn('Failed to clear enquiries:', e);
      return false;
    }
  };

  const addPendingReview = async (review: ReviewSubmissionItem): Promise<boolean> => {
    try {
      const currentReviews = content.pendingReviews || [];
      const updatedList = [review, ...currentReviews];
      const updatedContent = { ...content, pendingReviews: updatedList };
      setContent(updatedContent);

      try {
        localStorage.setItem(getLocalStorageKey(activeClientId), JSON.stringify(updatedContent));
      } catch (err) {
        console.warn('LocalStorage save notice:', err);
      }

      if (db) {
        safeFirestoreWrite(async () => {
          // 1. Write to subcollection (public visitors are permitted via firestore.rules)
          const reviewDocRef = doc(db, 'clients', activeClientId, 'pending_reviews', review.id);
          await setDoc(reviewDocRef, review);

          // 2. Also attempt to update the parent document if permitted
          try {
            await setDoc(
              doc(db, 'clients', activeClientId),
              { pendingReviews: updatedList, 'content.pendingReviews': updatedList },
              { merge: true }
            );
          } catch {
            // Parent doc write might fail if unauthenticated, subcollection succeeds
          }
        }, 3000);
      }
      return true;
    } catch (e) {
      console.warn('Failed to record pending review:', e);
      return false;
    }
  };

  const resetToDefault = async (): Promise<{ success: boolean; error?: string }> => {
    return saveContent(DEFAULT_SITE_CONTENT);
  };

  const exportConfigJson = (): string => {
    return JSON.stringify(content, null, 2);
  };

  const importConfigJson = async (jsonString: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const parsed = JSON.parse(jsonString) as SiteContent;
      if (!parsed.brand || !parsed.services || !parsed.portfolioCategories) {
        return { success: false, error: 'Invalid configuration format. Missing required fields.' };
      }
      return await saveContent(parsed);
    } catch (e: any) {
      return { success: false, error: 'Invalid JSON file: ' + (e.message || '') };
    }
  };

  // ─── MASTER MODULAR SAAS EXTENSIONS ─────────────────────────────────────────

  const isModuleEnabled = useCallback(
    (moduleId: ModuleId): boolean => {
      if (content.enabledModules && typeof content.enabledModules[moduleId] === 'boolean') {
        return content.enabledModules[moduleId];
      }
      const archetype = content.archetype || 'solo_mua';
      return ARCHETYPE_PRESETS[archetype]?.defaultModules[moduleId] ?? true;
    },
    [content.enabledModules, content.archetype]
  );

  const setArchetypePreset = async (archetype: BusinessArchetype): Promise<boolean> => {
    try {
      const preset = ARCHETYPE_PRESETS[archetype] || ARCHETYPE_PRESETS.solo_mua;
      const updatedContent: SiteContent = {
        ...content,
        archetype,
        enabledModules: { ...preset.defaultModules },
        businessHours: content.businessHours || preset.defaultBusinessHours,
      };
      const res = await saveContent(updatedContent);
      return res.success;
    } catch {
      return false;
    }
  };

  const toggleModule = async (moduleId: ModuleId, enabled?: boolean): Promise<boolean> => {
    try {
      const currentVal = isModuleEnabled(moduleId);
      const nextVal = typeof enabled === 'boolean' ? enabled : !currentVal;
      const updatedModules = {
        ...(content.enabledModules || {}),
        [moduleId]: nextVal,
      };
      const updatedContent: SiteContent = {
        ...content,
        enabledModules: updatedModules,
      };
      const res = await saveContent(updatedContent);
      return res.success;
    } catch {
      return false;
    }
  };

  const addAppointment = async (
    appointment: Omit<AppointmentItem, 'id' | 'createdAt' | 'status' | 'startMinute' | 'endMinute'> & {
      startMinute?: number;
      endMinute?: number;
    }
  ): Promise<{
    success: boolean;
    error?: 'SLOT_TAKEN' | 'CLOSED' | 'INVALID_STAFF' | string;
    appointmentId?: string;
    assignedStaff?: { id: string; name: string };
  }> => {
    try {
      let startMin = appointment.startMinute;
      let endMin = appointment.endMinute;
      const duration = appointment.durationMinutes || 30;

      if (typeof startMin !== 'number') {
        const [timeStr, ampm] = (appointment.timeSlot || '10:00 AM').split(' ');
        const [hStr, mStr] = (timeStr || '10:00').split(':');
        let hour = parseInt(hStr, 10);
        const minute = parseInt(mStr || '0', 10);
        if (ampm?.toUpperCase() === 'PM' && hour < 12) hour += 12;
        if (ampm?.toUpperCase() === 'AM' && hour === 12) hour = 0;
        startMin = hour * 60 + minute;
      }
      if (typeof endMin !== 'number') {
        endMin = startMin + duration;
      }

      const endH24 = Math.floor(endMin / 60);
      const endMins = endMin % 60;
      const endAmPm = endH24 >= 12 ? 'PM' : 'AM';
      const endH12 = endH24 % 12 === 0 ? 12 : endH24 % 12;
      const calculatedEndTime = `${endH12.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')} ${endAmPm}`;

      // 1. Calculate 15-minute quanta blocks for deterministic locking (including buffer)
      const buffer = content.businessHours?.bufferMinutes || 0;
      const effectiveEndMin = endMin + buffer;
      const BLOCK_SIZE = 15;
      const blockMinutes: number[] = [];
      for (let m = Math.floor(startMin / BLOCK_SIZE) * BLOCK_SIZE; m < effectiveEndMin; m += BLOCK_SIZE) {
        blockMinutes.push(m);
      }

      // 2. Identify candidate staff member(s)
      const dateObj = new Date(`${appointment.date}T00:00:00`);
      const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = dayNames[dateObj.getDay()];

      let candidateStaffList: { id: string; name: string }[] = [];

      if (appointment.staffId) {
        // Specific specialist requested
        const staffMember = (content.staff || []).find((s) => s.id === appointment.staffId);
        if (staffMember && (staffMember.active === false || (staffMember.workingDays && !staffMember.workingDays.includes(dayOfWeek)))) {
          return { success: false, error: 'INVALID_STAFF' };
        }
        candidateStaffList = [
          { id: appointment.staffId, name: appointment.staffName || staffMember?.name || 'Specialist' }
        ];
      } else {
        // "Any Specialist"
        const activeSvc = (content.services || []).find((s) => s.id === appointment.serviceId);
        const eligibleStaff = (content.staff || []).filter((st) => {
          if (st.active === false) return false;
          if (st.workingDays && !st.workingDays.includes(dayOfWeek)) return false;
          if (activeSvc?.eligibleStaffIds && activeSvc.eligibleStaffIds.length > 0) {
            return activeSvc.eligibleStaffIds.includes(st.id);
          }
          if (st.assignedServiceIds && st.assignedServiceIds.length > 0 && activeSvc) {
            return st.assignedServiceIds.includes(activeSvc.id);
          }
          return true;
        });

        if (isModuleEnabled('staffManagement') && content.staff && content.staff.length > 0) {
          if (eligibleStaff.length === 0) {
            return { success: false, error: 'CLOSED' };
          }
          candidateStaffList = eligibleStaff.map((s) => ({ id: s.id, name: s.name }));
        } else {
          // Solo atelier / Khushi MUA
          candidateStaffList = [{ id: 'solo', name: content.brand.founder || 'Lead Artist' }];
        }
      }

      const newAptId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();

      if (db) {
        // Run atomic Firestore transaction
        const txResult = await runTransaction(db, async (transaction) => {
          // --- READ PHASE: Must read all lock documents across all candidates before writing ---
          type StaffCheck = {
            staff: { id: string; name: string };
            locks: { lockId: string; blockMinute: number; ref: any }[];
          };

          const staffChecks: StaffCheck[] = candidateStaffList.map((st) => ({
            staff: st,
            locks: blockMinutes.map((bMin) => {
              const lockId = `${appointment.date}_${st.id}_${bMin}`;
              const ref = doc(db, 'clients', activeClientId, 'slot_locks', lockId);
              return { lockId, blockMinute: bMin, ref };
            }),
          }));

          const readPromises: Promise<{ staffId: string; lockId: string; exists: boolean; blockMinute: number; ref: any }>[] = [];
          for (const sc of staffChecks) {
            for (const lock of sc.locks) {
              readPromises.push(
                transaction.get(lock.ref).then((snap) => ({
                  staffId: sc.staff.id,
                  lockId: lock.lockId,
                  exists: snap.exists(),
                  blockMinute: lock.blockMinute,
                  ref: lock.ref,
                }))
              );
            }
          }

          const readResults = await Promise.all(readPromises);

          // Find first candidate staff member who has zero conflicting locks
          let chosenStaff: { id: string; name: string } | null = null;
          let chosenLocks: { lockId: string; blockMinute: number; ref: any }[] = [];

          for (const sc of staffChecks) {
            const staffLocks = readResults.filter((r) => r.staffId === sc.staff.id);
            const isBlocked = staffLocks.some((r) => r.exists);
            if (!isBlocked) {
              chosenStaff = sc.staff;
              chosenLocks = sc.locks;
              break;
            }
          }

          if (!chosenStaff || chosenLocks.length === 0) {
            throw new Error('SLOT_TAKEN');
          }

          // --- WRITE PHASE: Atomically write locks + appointment + busy_slot ---
          const lockIds = chosenLocks.map((l) => l.lockId);

          for (const lock of chosenLocks) {
            const lockData: SlotLockItem = {
              id: lock.lockId,
              clientId: activeClientId,
              appointmentId: newAptId,
              date: appointment.date,
              staffId: chosenStaff.id,
              blockMinute: lock.blockMinute,
              startMinute: startMin,
              endMinute: endMin,
              createdAt: nowIso,
            };
            transaction.set(lock.ref, lockData);
          }

          const aptDocRef = doc(db, 'clients', activeClientId, 'appointments', newAptId);
          const finalAppointment: AppointmentItem = {
            ...appointment,
            id: newAptId,
            clientId: activeClientId,
            staffId: chosenStaff.id,
            staffName: chosenStaff.name,
            startMinute: startMin,
            endMinute: endMin,
            endTime: appointment.endTime || calculatedEndTime,
            durationMinutes: duration,
            status: 'pending',
            createdAt: nowIso,
            lockIds,
          };
          transaction.set(aptDocRef, finalAppointment);

          const busyDocRef = doc(db, 'clients', activeClientId, 'busy_slots', newAptId);
          const finalBusySlot: BusySlotItem = {
            id: newAptId,
            date: appointment.date,
            startMinute: startMin,
            endMinute: endMin,
            staffId: chosenStaff.id,
          };
          transaction.set(busyDocRef, finalBusySlot);

          return {
            appointment: finalAppointment,
            busySlot: finalBusySlot,
            assignedStaff: chosenStaff,
          };
        });

        // Transaction successfully committed! Update local React states
        setAppointments((prev) => [txResult.appointment, ...prev]);
        setBusySlots((prev) => [...prev, txResult.busySlot]);

        try {
          const stored = [txResult.appointment, ...appointments];
          localStorage.setItem(getTenantApptsKey(activeClientId), JSON.stringify(stored));
        } catch {}

        return {
          success: true,
          appointmentId: newAptId,
          assignedStaff: txResult.assignedStaff,
        };
      } else {
        // Local offline / development fallback
        const chosenStaff = candidateStaffList[0];
        const lockIds = blockMinutes.map((b) => `${appointment.date}_${chosenStaff.id}_${b}`);
        const fallbackAppointment: AppointmentItem = {
          ...appointment,
          id: newAptId,
          clientId: activeClientId,
          staffId: chosenStaff.id,
          staffName: chosenStaff.name,
          startMinute: startMin,
          endMinute: endMin,
          endTime: appointment.endTime || calculatedEndTime,
          durationMinutes: duration,
          status: 'pending',
          createdAt: nowIso,
          lockIds,
        };
        const fallbackBusySlot: BusySlotItem = {
          id: newAptId,
          date: appointment.date,
          startMinute: startMin,
          endMinute: endMin,
          staffId: chosenStaff.id,
        };
        setAppointments((prev) => [fallbackAppointment, ...prev]);
        setBusySlots((prev) => [...prev, fallbackBusySlot]);
        return {
          success: true,
          appointmentId: newAptId,
          assignedStaff: chosenStaff,
        };
      }
    } catch (e: any) {
      if (e?.message === 'SLOT_TAKEN' || e?.message?.includes('SLOT_TAKEN')) {
        return { success: false, error: 'SLOT_TAKEN' };
      }
      console.warn('Failed to record appointment atomically:', e);
      return { success: false, error: e?.message || 'TRANSACTION_FAILED' };
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus): Promise<boolean> => {
    try {
      const targetApt = appointments.find((item) => item.id === id);
      const updatedList = appointments.map((item) =>
        item.id === id ? { ...item, status } : item
      );
      setAppointments(updatedList);

      if (status === 'cancelled') {
        setBusySlots((prev) => prev.filter((s) => s.id !== id));
      }

      try {
        localStorage.setItem(getTenantApptsKey(activeClientId), JSON.stringify(updatedList));
      } catch {}

      if (db) {
        safeFirestoreWrite(async () => {
          const aptDocRef = doc(db, 'clients', activeClientId, 'appointments', id);
          await setDoc(aptDocRef, { status }, { merge: true });

          if (status === 'cancelled') {
            await deleteDoc(doc(db, 'clients', activeClientId, 'busy_slots', id));
            if (targetApt?.lockIds && Array.isArray(targetApt.lockIds)) {
              for (const lockId of targetApt.lockIds) {
                await deleteDoc(doc(db, 'clients', activeClientId, 'slot_locks', lockId));
              }
            }
          }
        }, 2000);
      }
      return true;
    } catch (e) {
      console.warn('Failed to update appointment status:', e);
      return false;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      const targetApt = appointments.find((item) => item.id === id);
      const updatedList = appointments.filter((item) => item.id !== id);
      setAppointments(updatedList);
      setBusySlots((prev) => prev.filter((s) => s.id !== id));

      try {
        localStorage.setItem(getTenantApptsKey(activeClientId), JSON.stringify(updatedList));
      } catch {}

      if (db) {
        safeFirestoreWrite(async () => {
          await deleteDoc(doc(db, 'clients', activeClientId, 'appointments', id));
          await deleteDoc(doc(db, 'clients', activeClientId, 'busy_slots', id));
          if (targetApt?.lockIds && Array.isArray(targetApt.lockIds)) {
            for (const lockId of targetApt.lockIds) {
              await deleteDoc(doc(db, 'clients', activeClientId, 'slot_locks', lockId));
            }
          }
        }, 2000);
      }
      return true;
    } catch (e) {
      console.warn('Failed to delete appointment:', e);
      return false;
    }
  };

  const updateStaffList = async (staff: StaffMember[]): Promise<boolean> => {
    try {
      const updatedContent = { ...content, staff };
      const res = await saveContent(updatedContent);
      return res.success;
    } catch {
      return false;
    }
  };

  const updateBusinessHours = async (hours: BusinessHoursConfig): Promise<boolean> => {
    try {
      const updatedContent = { ...content, businessHours: hours };
      const res = await saveContent(updatedContent);
      return res.success;
    } catch {
      return false;
    }
  };

  const value = useMemo(
    () => ({
      content,
      appointments,
      enquiries,
      busySlots,
      loading,
      isFirebaseConnected,
      activeClientId,
      clientsList,
      setActiveClientId,
      saveContent,
      createClientSite,
      deleteClientSite,
      toggleClientStatus,
      setTenantLifecycleStatus,
      permanentDeleteTenant,
      syncContentToAllClients,
      resetToDefault,
      exportConfigJson,
      importConfigJson,
      addEnquiry,
      updateEnquiryStatus,
      deleteEnquiry,
      clearAllEnquiries,
      addPendingReview,
      isModuleEnabled,
      setArchetypePreset,
      toggleModule,
      addAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      updateStaffList,
      updateBusinessHours,
    }),
    [
      content,
      appointments,
      enquiries,
      busySlots,
      loading,
      isFirebaseConnected,
      activeClientId,
      clientsList,
      isModuleEnabled,
    ]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useSiteContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a ContentProvider');
  }
  return context;
};
