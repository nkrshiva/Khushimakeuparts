import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useTenant } from './TenantContext';
import { authorizationService } from '../services/auth/AuthorizationService';
import { bookingService } from '../services/booking/BookingService';
import { enquiryService } from '../services/enquiry/EnquiryService';
import { reviewService } from '../services/review';
import { contentService, mergeWithDefaults, createTailoredSiteContent } from '../services/content';
import { tenantService } from '../services/tenant';
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
  AppointmentItem,
  AppointmentStatus,
  BusySlotItem,
  DayOfWeek,
  DEFAULT_MAIN_CLIENT,
  TenantInvitation,
  isKhushiTenantId,
} from '../types';
import { ARCHETYPE_PRESETS, DEFAULT_BUSINESS_HOURS } from '../data/archetypePresets';
import { tenantResolutionService, TenantResolutionResult } from '../services/tenant';

interface ContentContextType {
  content: SiteContent;
  appointments: AppointmentItem[];
  enquiries: EnquiryItem[];
  busySlots: BusySlotItem[];
  loading: boolean;
  isFirebaseConnected: boolean;
  activeClientId: string;
  clientsList: ClientTenantSummary[];
  tenantResolution: TenantResolutionResult;
  isUnknownTenant: boolean;
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
    invitedOwnerEmail?: string;
  }) => Promise<{ success: boolean; id?: string; invitation?: TenantInvitation; error?: string }>;
  resendTenantInvitation: (clientId: string, invitedOwnerEmail: string) => Promise<{ success: boolean; invitation?: TenantInvitation; error?: string }>;
  revokeTenantInvitation: (invitationId: string) => Promise<{ success: boolean; error?: string }>;
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

const getInitialRegistry = (): ClientTenantSummary[] => {
  try {
    const cached = localStorage.getItem(PLATFORM_REGISTRY_KEY) || localStorage.getItem('khushi_clients_registry');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [DEFAULT_MAIN_CLIENT];
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export { mergeWithDefaults, createTailoredSiteContent };



export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, assignedClientId } = useTenant();

  // Clients registry list
  const [clientsList, setClientsList] = useState<ClientTenantSummary[]>(getInitialRegistry);

  // Authoritative Hostname Tenant Resolution
  const [tenantResolution, setTenantResolution] = useState<TenantResolutionResult>(() => {
    return tenantResolutionService.resolveTenantFromHost({
      clientsRegistry: getInitialRegistry(),
    });
  });

  const [activeClientId, setActiveClientIdState] = useState<string>(() => {
    return tenantResolution.tenantId || DEFAULT_MAIN_CLIENT.id;
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

  // 1. Sync Clients Registry from TenantService
  useEffect(() => {
    const unsubscribe = tenantService.subscribeClientsRegistry(
      (clients) => {
        setClientsList(clients);
        try {
          localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(clients));
        } catch {}

        // Re-resolve tenant from host with the updated clients list
        const resolved = tenantResolutionService.resolveTenantFromHost({
          clientsRegistry: clients,
        });
        setTenantResolution(resolved);

        if (resolved.tenantId && resolved.tenantId !== activeClientId) {
          if (role !== 'client') {
            setActiveClientIdState(resolved.tenantId);
          }
        }
      },
      (err) => {
        console.warn('Clients registry sync notice:', err?.message || err);
      }
    );
    return () => unsubscribe();
  }, [activeClientId, role]);

  // Sync active client ID dynamically when URL query param or hash changes (for development and navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      // Client users cannot switch tenant context via URL
      if (role === 'client' && assignedClientId) {
        if (activeClientId !== assignedClientId) {
          setActiveClientIdState(assignedClientId);
        }
        return;
      }

      const resolved = tenantResolutionService.resolveTenantFromHost({
        clientsRegistry: clientsList,
      });
      setTenantResolution(resolved);

      if (resolved.tenantId && resolved.tenantId !== activeClientId) {
        setActiveClientIdState(resolved.tenantId);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [activeClientId, role, assignedClientId, clientsList]);

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
        } else if (isKhushiTenantId(activeClientId)) {
          setContent(DEFAULT_SITE_CONTENT);
        }
      }
    } catch {}

    if (!activeClientId) return;

    const unsubscribe = contentService.subscribeContent(
      activeClientId,
      (remoteContent) => {
        setContent(remoteContent);
        try {
          localStorage.setItem(getLocalStorageKey(activeClientId), JSON.stringify(remoteContent));
        } catch {}
        setIsFirebaseConnected(true);
      },
      (err) => {
        console.warn(`Firestore sync notice for client '${activeClientId}':`, err?.message || err);
        setIsFirebaseConnected(false);
      }
    );

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

    if (!activeClientId) return;

    const unsubscribe = bookingService.subscribeAppointments(
      activeClientId,
      (list) => {
        setAppointments(list);
        try {
          localStorage.setItem(getTenantApptsKey(activeClientId), JSON.stringify(list));
        } catch {}
      },
      (err) => {
        // Public visitors cannot read appointments subcollection (expected denial)
        console.warn('Could not attach appointments subcollection listener:', err);
      }
    );

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

    if (!activeClientId) return;

    const unsubscribe = enquiryService.subscribeEnquiries(
      activeClientId,
      (list) => {
        setEnquiries(list);
        try {
          localStorage.setItem(getTenantEnqsKey(activeClientId), JSON.stringify(list));
        } catch {}
      },
      (err) => {
        // Public visitors cannot read enquiries subcollection (expected denial)
        console.warn('Could not attach enquiries subcollection listener:', err);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [activeClientId]);

  // 5. Real-time sync for active client's anonymized busy slots (Public booking collision detection)
  useEffect(() => {
    if (!activeClientId) return;

    const unsubscribe = bookingService.subscribeBusySlots(
      activeClientId,
      (list) => {
        setBusySlots(list);
      },
      (err) => {
        console.warn('Busy slots sync notice:', err.message);
      }
    );

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

      // Only update ?client= in development or platform mode, not on strict tenant production domains
      if (tenantResolution.source === 'development' || tenantResolution.isPlatform || role === 'developer') {
        const url = new URL(window.location.href);
        url.searchParams.set('client', cleanId);
        window.history.replaceState(null, '', url.toString());
      }
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

      // 2. Delegate persistence to ContentService (handles authorization, sanitization, and repository persistence)
      const result = await contentService.saveContent(role, assignedClientId, targetId, newContent);
      if (result.success) {
        setIsFirebaseConnected(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
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
    invitedOwnerEmail?: string;
  }): Promise<{ success: boolean; id?: string; invitation?: TenantInvitation; error?: string }> => {
    try {
      console.log('[ContentContext] createClientSite invoked. Current role:', role);
      const result = await tenantService.createTenantSite(role, tenantData, clientsList);
      console.log('[ContentContext] tenantService.createTenantSite returned:', result);
      if (result.success && result.id && result.summary) {
        const updatedList = [...clientsList, result.summary];
        setClientsList(updatedList);
        try {
          localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(updatedList));
        } catch {}
        return { success: true, id: result.id, invitation: result.invitation };
      }
      return { success: false, error: result.error };
    } catch (err: any) {
      console.error('[ContentContext] Unhandled error in createClientSite:', err);
      return { success: false, error: err?.message || 'Failed to create client tenant site.' };
    }
  };

  // Resend tenant onboarding invitation
  const resendTenantInvitation = async (
    clientId: string,
    invitedOwnerEmail: string
  ): Promise<{ success: boolean; invitation?: TenantInvitation; error?: string }> => {
    return tenantService.resendInvitation(role, clientId, invitedOwnerEmail);
  };

  // Revoke tenant onboarding invitation
  const revokeTenantInvitation = async (
    invitationId: string
  ): Promise<{ success: boolean; error?: string }> => {
    return tenantService.revokeInvitation(role, invitationId);
  };

  // Set tenant lifecycle status: 'active' | 'suspended' | 'archived'
  const setTenantLifecycleStatus = async (id: string, status: TenantLifecycleStatus): Promise<boolean> => {
    const result = await tenantService.setTenantLifecycleStatus(role, id, status, clientsList);
    if (result.success) {
      const updatedList = clientsList.map((c) =>
        c.id === id ? { ...c, status, active: status === 'active', updatedAt: new Date().toISOString() } : c
      );
      setClientsList(updatedList);
      try {
        localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(updatedList));
      } catch {}
      return true;
    }
    return false;
  };

  // Toggle client active/suspended status (backward compatibility alias)
  const toggleClientStatus = async (id: string, active: boolean): Promise<boolean> => {
    const result = await tenantService.toggleClientStatus(role, id, active, clientsList);
    if (result.success) {
      const nextStatus: TenantLifecycleStatus = active ? 'active' : 'suspended';
      const updatedList: ClientTenantSummary[] = clientsList.map((c) =>
        c.id === id ? { ...c, status: nextStatus, active, updatedAt: new Date().toISOString() } : c
      );
      setClientsList(updatedList);
      try {
        localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(updatedList));
      } catch {}
      return true;
    }
    return false;
  };

  // Scalable paginated chunked subcollection purge and permanent tenant deletion
  const permanentDeleteTenant = async (
    id: string,
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await tenantService.permanentDeleteTenant(role, id, clientsList, onProgress);
    if (result.success) {
      const updatedList = clientsList.filter((c) => c.id !== id);
      setClientsList(updatedList);
      try {
        localStorage.setItem(PLATFORM_REGISTRY_KEY, JSON.stringify(updatedList));
        localStorage.removeItem(getLocalStorageKey(id));
        localStorage.removeItem(getTenantApptsKey(id));
        localStorage.removeItem(getTenantEnqsKey(id));
      } catch {}

      if (activeClientId === id) {
        const fallbackId = updatedList[0]?.id || 'khushi';
        setActiveClientId(fallbackId);
      }
      return { success: true };
    }
    return { success: false, error: result.error };
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
    return tenantService.syncContentToAllClients(role, sourceContent, clientsList, modulesToSync);
  };

  // Enquiry methods scoped exclusively to active client subcollection
  const addEnquiry = async (enquiryData: Omit<EnquiryItem, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    try {
      const result = await enquiryService.submitEnquiry(activeClientId, enquiryData, enquiries);
      if (!result.success || !result.enquiry) {
        return false;
      }

      let updatedList: EnquiryItem[];
      if (result.isUpdate) {
        updatedList = enquiries.map((item) => (item.id === result.enquiry!.id ? result.enquiry! : item));
      } else {
        updatedList = [result.enquiry, ...enquiries];
      }

      setEnquiries(updatedList);
      try {
        localStorage.setItem(getTenantEnqsKey(activeClientId), JSON.stringify(updatedList));
      } catch (err) {
        console.warn('LocalStorage save notice:', err);
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

      await enquiryService.updateEnquiryStatus(activeClientId, id, status);
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

      await enquiryService.deleteEnquiry(activeClientId, id);
      return true;
    } catch (e) {
      console.warn('Failed to delete enquiry:', e);
      return false;
    }
  };

  const clearAllEnquiries = async (): Promise<boolean> => {
    try {
      const enquiryIds = enquiries.map((item) => item.id);
      setEnquiries([]);
      try {
        localStorage.setItem(getTenantEnqsKey(activeClientId), JSON.stringify([]));
      } catch {}

      await enquiryService.clearAllEnquiries(activeClientId, enquiryIds);
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

      const result = await reviewService.submitReview(activeClientId, review);
      if (!result.success) {
        console.warn('Review submission warning from reviewService:', result.error);
      }
      return result.success;
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
    const result = await bookingService.createAppointment({
      appointment,
      activeClientId,
      businessHours: content.businessHours,
      staffList: content.staff,
      servicesList: content.services,
      brandFounder: content.brand?.founder,
      isStaffManagementEnabled: isModuleEnabled('staffManagement'),
    });

    if (result.success && result.appointment && result.busySlot) {
      setAppointments((prev) => [result.appointment!, ...prev]);
      setBusySlots((prev) => [...prev, result.busySlot!]);

      try {
        const stored = [result.appointment, ...appointments];
        localStorage.setItem(getTenantApptsKey(activeClientId), JSON.stringify(stored));
      } catch {}

      return {
        success: true,
        appointmentId: result.appointmentId,
        assignedStaff: result.assignedStaff,
      };
    }

    return {
      success: false,
      error: result.error,
    };
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

      await bookingService.updateAppointmentStatus(activeClientId, id, status, targetApt?.lockIds);
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

      await bookingService.deleteAppointment(activeClientId, id, targetApt?.lockIds);
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

  const isUnknownTenant = tenantResolution.isUnknownTenant;

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
      tenantResolution,
      isUnknownTenant,
      setActiveClientId,
      saveContent,
      createClientSite,
      resendTenantInvitation,
      revokeTenantInvitation,
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
      tenantResolution,
      isUnknownTenant,
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
