import React, { useState, useRef } from 'react';
import { mediaService } from '../services/media/MediaService';
import {
  X,
  Save,
  LogOut,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  DollarSign,
  Briefcase,
  HelpCircle,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  Sliders,
  Eye,
  EyeOff,
  Copy,
  Check,
  MessageSquare,
  Star,
  Globe,
  MapPin,
  Calendar,
  User,
  PhoneCall,
  Search,
  Megaphone,
  BarChart3,
  FileSpreadsheet,
  Instagram,
  Youtube,
  Building2,
  Users,
  Power,
  ShieldCheck,
  Wand2,
  CheckCheck,
  Palette,
  Heart,
  Tag,
  Scissors,
  Clock
} from 'lucide-react';
import { parseYouTubeId, resolvePosterImage } from '../utils/videoUtils';
import { useSiteContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { authorizationService } from '../services/auth/AuthorizationService';
import { contentService } from '../services/content';
import { bookingService } from '../services/booking/BookingService';
import { enquiryService } from '../services/enquiry/EnquiryService';
import { SiteContent, SectionVisibilityConfig, DEFAULT_OFFER_POPUP } from '../data/siteContent';
import { PortfolioCategory, PortfolioModel } from '../data/portfolioData';
import {
  ServiceItem,
  BridalPackage,
  FAQItem,
  VideoShowcaseItem,
  EnquiryItem,
  EnquiryStatus,
  TestimonialItem,
  ClientTenantSummary,
  DateAvailabilityItem,
  BeforeAfterItem,
  ReviewSubmissionItem,
  AvailabilityStatus,
  OfferPopupConfig,
  BusinessArchetype,
  ModuleId,
  BusinessHoursConfig,
  StaffMember,
  AppointmentItem,
  AppointmentStatus
} from '../types';
import { ARCHETYPE_PRESETS, DEFAULT_BUSINESS_HOURS } from '../data/archetypePresets';
import { ArchetypeModulesTab } from './admin/ArchetypeModulesTab';
import { StaffManagerTab } from './admin/StaffManagerTab';
import { BusinessHoursTab } from './admin/BusinessHoursTab';
import { AppointmentsTab } from './admin/AppointmentsTab';
import { OfferPopupModal } from './OfferPopupModal';
import { SlideToggle } from './ui/SlideToggle';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminTenantId?: string;
}

type TabType =
  | 'archetypeModules'
  | 'appointments'
  | 'staff'
  | 'businessHours'
  | 'enquiries'
  | 'sections'
  | 'offerPopup'
  | 'portfolio'
  | 'beforeAfter'
  | 'testimonials'
  | 'calendar'
  | 'brand'
  | 'about'
  | 'services'
  | 'packages'
  | 'videos'
  | 'faqs'
  | 'seo'
  | 'export';

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, adminTenantId: propAdminTenantId }) => {
  const {
    content,
    saveContent,
    resetToDefault,
    exportConfigJson,
    importConfigJson,
    isFirebaseConnected,
    updateEnquiryStatus,
    deleteEnquiry,
    clearAllEnquiries,
    activeClientId,
    clientsList,
    setActiveClientId,
    createClientSite,
    deleteClientSite,
    toggleClientStatus,
    syncContentToAllClients,
    updateAppointmentStatus,
    deleteAppointment,
    isModuleEnabled,
    appointments: contextAppointments,
    enquiries: contextEnquiries,
  } = useSiteContent();
  const { user, logout } = useAuth();
  const { role, isDeveloper, assignedClientId } = useTenant();

  const effectiveAdminTenantId = (
    propAdminTenantId ||
    (role === 'client' && assignedClientId ? assignedClientId : activeClientId)
  ).trim().toLowerCase();

  // Scoped appointments & enquiries for the administered tenant
  const [appointments, setScopedAppointments] = useState<AppointmentItem[]>(contextAppointments);
  const [enquiries, setScopedEnquiries] = useState<EnquiryItem[]>(contextEnquiries);

  // Local draft state for editing before saving
  const [draft, setDraft] = useState<SiteContent>(content);
  const [activeTab, setActiveTab] = useState<TabType>('sections');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [showPopupPreview, setShowPopupPreview] = useState(false);

  // Multi-Tenant SaaS & Global Sync State
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncAlsoOnSave, setSyncAlsoOnSave] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncModules, setSyncModules] = useState({
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
  });
  const [newClientForm, setNewClientForm] = useState<{
    name: string;
    founder: string;
    city: string;
    phone: string;
    instagram: string;
    customDomain: string;
    archetype: BusinessArchetype;
  }>({
    name: '',
    founder: '',
    city: '',
    phone: '',
    instagram: '',
    customDomain: '',
    archetype: 'solo_mua',
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);
  const [copiedCredentialsSnippet, setCopiedCredentialsSnippet] = useState(false);

  // Mini-CRM Enquiries filter state
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | 'new' | 'contacted' | 'booked' | 'completed'>('all');
  const [enquirySearch, setEnquirySearch] = useState('');

  // Testimonials add state
  const [newTestimonial, setNewTestimonial] = useState<Partial<TestimonialItem>>({
    clientName: '',
    ceremony: 'Bridal Makeup & Styling',
    rating: 5,
    quote: '',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    verified: true,
    hidden: false,
  });
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);

  // Turnkey Client Clone Generator State
  const [newClientData, setNewClientData] = useState({
    salonName: '',
    founderName: '',
    location: '',
    phone: '',
    instagram: '',
    email: '',
    password: '',
  });
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // MUA Conversion: Calendar availability state
  const [newCalendarDate, setNewCalendarDate] = useState<{
    date: string;
    status: AvailabilityStatus;
    note: string;
  }>({
    date: '',
    status: 'booked',
    note: '',
  });

  // MUA Conversion: Before & After state
  const [newBeforeAfter, setNewBeforeAfter] = useState<Partial<BeforeAfterItem>>({
    title: '',
    subtitle: '',
    category: 'bridal',
    beforeImageUrl: '',
    afterImageUrl: '',
    description: '',
  });
  const [showAddBeforeAfter, setShowAddBeforeAfter] = useState(false);

  // Review Approval / Rejection Handlers
  const handleApproveReview = (revId: string) => {
    const pending = draft.pendingReviews || [];
    const target = pending.find((r) => r.id === revId);
    if (!target) return;
    const newApproved: TestimonialItem = {
      id: `test_${Date.now()}`,
      clientName: target.clientName,
      ceremony: target.ceremony,
      date: target.eventDate,
      rating: target.rating,
      reviewText: target.reviewText,
      photoUrl: target.photoUrl || '/portfolio/model-01.jpg',
      verified: true,
      hidden: false,
    };
    const updatedPending = pending.filter((r) => r.id !== revId);
    const updatedTestimonials = [newApproved, ...(draft.testimonials || [])];
    setDraft((prev) => ({
      ...prev,
      pendingReviews: updatedPending,
      testimonials: updatedTestimonials,
    }));
    showNotice('success', `✓ Review from ${target.clientName} approved and published live!`);
  };

  const handleDeclineReview = (revId: string) => {
    const pending = draft.pendingReviews || [];
    const updatedPending = pending.filter((r) => r.id !== revId);
    setDraft((prev) => ({
      ...prev,
      pendingReviews: updatedPending,
    }));
    showNotice('success', 'Review declined.');
  };

  // Calendar Handlers
  const handleAddCalendarDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalendarDate.date) {
      showNotice('error', 'Please select a date.');
      return;
    }
    const current = draft.calendarAvailability || [];
    const existingIdx = current.findIndex((c) => c.date === newCalendarDate.date);
    let updated: DateAvailabilityItem[];
    if (existingIdx !== -1) {
      updated = [...current];
      updated[existingIdx] = { ...newCalendarDate };
    } else {
      updated = [...current, { ...newCalendarDate }];
    }
    setDraft((prev) => ({ ...prev, calendarAvailability: updated }));
    setNewCalendarDate({ date: '', status: 'booked', note: '' });
    showNotice('success', `Updated availability for ${newCalendarDate.date}`);
  };

  const handleRemoveCalendarDate = (dateStr: string) => {
    const updated = (draft.calendarAvailability || []).filter((c) => c.date !== dateStr);
    setDraft((prev) => ({ ...prev, calendarAvailability: updated }));
    showNotice('success', `Removed date ${dateStr}`);
  };

  // Before & After Handlers
  const handleAddBeforeAfter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBeforeAfter.title || !newBeforeAfter.beforeImageUrl || !newBeforeAfter.afterImageUrl) {
      showNotice('error', 'Please provide a title, before image URL, and after image URL.');
      return;
    }
    const newItem: BeforeAfterItem = {
      id: `ba_${Date.now()}`,
      title: newBeforeAfter.title.trim(),
      subtitle: newBeforeAfter.subtitle?.trim() || 'Bridal Glamour',
      category: (newBeforeAfter.category as any) || 'bridal',
      beforeImageUrl: newBeforeAfter.beforeImageUrl.trim(),
      afterImageUrl: newBeforeAfter.afterImageUrl.trim(),
      description: newBeforeAfter.description?.trim() || '',
    };
    const updated = [...(draft.beforeAfterGallery || []), newItem];
    setDraft((prev) => ({ ...prev, beforeAfterGallery: updated }));
    setNewBeforeAfter({ title: '', subtitle: '', category: 'bridal', beforeImageUrl: '', afterImageUrl: '', description: '' });
    setShowAddBeforeAfter(false);
    showNotice('success', `Added transformation look "${newItem.title}"`);
  };

  const handleRemoveBeforeAfter = (id: string) => {
    const updated = (draft.beforeAfterGallery || []).filter((item) => item.id !== id);
    setDraft((prev) => ({ ...prev, beforeAfterGallery: updated }));
    showNotice('success', 'Transformation removed.');
  };

  const handleUpdateBeforeAfter = (id: string, updates: Partial<BeforeAfterItem>) => {
    const updated = (draft.beforeAfterGallery || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setDraft((prev) => ({ ...prev, beforeAfterGallery: updated }));
  };

  // Export Enquiries as CSV for salons
  const handleExportEnquiriesCsv = () => {
    const enquiriesList = enquiries || [];
    if (enquiriesList.length === 0) {
      showNotice('error', 'No enquiries to export.');
      return;
    }
    const headers = ['Client Name', 'Phone', 'Ceremony / Service', 'Event Date', 'Location', 'Status', 'Received At', 'Notes'];
    const rows = enquiriesList.map((e) => [
      `"${(e.clientName || '').replace(/"/g, '""')}"`,
      `"${(e.phone || '').replace(/"/g, '""')}"`,
      `"${(e.ceremonyType || '').replace(/"/g, '""')}"`,
      `"${(e.eventDate || '').replace(/"/g, '""')}"`,
      `"${(e.location || '').replace(/"/g, '""')}"`,
      `"${(e.status || 'new').toUpperCase()}"`,
      `"${(e.createdAt || '')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${draft.brand.name.toLowerCase().replace(/\s+/g, '_')}_enquiries.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotice('success', 'Enquiries exported to CSV!');
  };

  // Synchronize content draft with effective admin tenant
  React.useEffect(() => {
    if (!isOpen) return;

    if (effectiveAdminTenantId === activeClientId) {
      setDraft(content);
      return;
    }

    let isMounted = true;
    contentService.getContent(effectiveAdminTenantId).then((tenantContent) => {
      if (isMounted) setDraft(tenantContent);
    }).catch((err) => {
      console.warn(`[AdminPanel] Could not load content for ${effectiveAdminTenantId}:`, err);
    });

    const unsub = contentService.subscribeContent(
      effectiveAdminTenantId,
      (remoteContent) => {
        if (isMounted) setDraft(remoteContent);
      }
    );

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, [isOpen, effectiveAdminTenantId, activeClientId, content]);

  // Synchronize appointments and enquiries for effective admin tenant
  React.useEffect(() => {
    if (!isOpen) return;

    if (effectiveAdminTenantId === activeClientId) {
      setScopedAppointments(contextAppointments);
      setScopedEnquiries(contextEnquiries);
      return;
    }

    let isMounted = true;
    const unsubAppts = bookingService.subscribeAppointments(
      effectiveAdminTenantId,
      (list) => {
        if (isMounted) setScopedAppointments(list);
      }
    );
    const unsubEnqs = enquiryService.subscribeEnquiries(
      effectiveAdminTenantId,
      (list) => {
        if (isMounted) setScopedEnquiries(list);
      }
    );

    return () => {
      isMounted = false;
      if (unsubAppts) unsubAppts();
      if (unsubEnqs) unsubEnqs();
    };
  }, [isOpen, effectiveAdminTenantId, activeClientId, contextAppointments, contextEnquiries]);

  // Ensure client cannot remain on export tab
  React.useEffect(() => {
    if (!authorizationService.canExportConfig(role) && activeTab === 'export') {
      setActiveTab('enquiries');
    }
  }, [role, activeTab]);

  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientForm.name.trim()) {
      showNotice('error', 'Please enter the Salon / Business name.');
      return;
    }
    setIsCreatingClient(true);
    try {
      const rawDomain = newClientForm.customDomain?.trim();
      const cleanDomain = rawDomain
        ? rawDomain.toLowerCase().replace(/^https?:\/\//i, '').replace(/\/+$/, '')
        : undefined;

      const res = await createClientSite({
        name: newClientForm.name.trim(),
        founder: newClientForm.founder.trim() || 'Lead Artist',
        city: newClientForm.city.trim() || 'City',
        phone: newClientForm.phone.trim() || '+91 98765 43210',
        instagram: newClientForm.instagram.trim() || '@salon',
        archetype: newClientForm.archetype || 'solo_mua',
        ...(cleanDomain ? { customDomain: cleanDomain } : {}),
      });
      if (res.success && res.id) {
        showNotice('success', `🎉 New website created successfully for "${newClientForm.name}"!`);
        setShowAddClientModal(false);
        setActiveClientId(res.id);
        setNewClientForm({
          name: '',
          founder: '',
          city: '',
          phone: '',
          instagram: '',
          customDomain: '',
          archetype: 'solo_mua',
        });
      } else {
        showNotice('error', res.error || 'Failed to create client site.');
      }
    } catch (err: any) {
      showNotice('error', 'Error creating client site: ' + (err?.message || err));
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleCopyClientLink = (clientId: string) => {
    const origin = window.location.origin;
    const client = clientsList.find((c) => c.id === clientId);
    const isDev = origin.includes('localhost') || origin.includes('127.0.0.1');
    const url = client?.storefrontUrl || (clientId === 'khushi' ? origin : (isDev ? `${origin}/?client=${clientId}` : `https://${clientId}.vercel.app`));
    navigator.clipboard.writeText(url);
    setCopiedClientId(clientId);
    setTimeout(() => setCopiedClientId(null), 2500);
    showNotice('success', `Copied website link: ${url}`);
  };

  const handleCopyAdminLink = (clientId: string) => {
    const origin = window.location.origin;
    const client = clientsList.find((c) => c.id === clientId);
    const isDev = origin.includes('localhost') || origin.includes('127.0.0.1');
    const base = client?.storefrontUrl || (clientId === 'khushi' ? origin : (isDev ? `${origin}/?client=${clientId}` : `https://${clientId}.vercel.app`));
    const url = `${base}/#myadminpanel`;
    navigator.clipboard.writeText(url);
    setCopiedClientId(`admin_${clientId}`);
    setTimeout(() => setCopiedClientId(null), 2500);
    showNotice('success', `Copied Admin Panel link: ${url}`);
  };

  const handleDeleteClient = async (client: ClientTenantSummary) => {
    if (client.id === 'khushi') {
      showNotice('error', 'The Master Default site (Khushi) cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete the website for "${client.name}" (${client.id})? This cannot be undone.`)) {
      const res = await deleteClientSite(client.id);
      if (res.success) {
        showNotice('success', `Website for "${client.name}" deleted.`);
      } else {
        showNotice('error', res.error || 'Failed to delete client website.');
      }
    }
  };

  const handleSyncToAllClients = async () => {
    setIsSyncing(true);
    try {
      const res = await syncContentToAllClients(draft, syncModules);
      if (res.success) {
        showNotice(
          'success',
          `⚡ Successfully synced Main Site updates across all ${res.updatedCount} client website(s)!`
        );
        setShowSyncModal(false);
      } else {
        showNotice('error', res.error || 'Failed to sync across client sites.');
      }
    } catch (err: any) {
      showNotice('error', 'Sync error: ' + (err?.message || err));
    } finally {
      setIsSyncing(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !authorizationService.canAccessAdminPanel(role)) return null;

  const showNotice = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Regenerate WhatsApp and Instagram URLs dynamically based on updated phone and name
      const updatedBrand = { ...draft.brand };
      if (updatedBrand.phone) {
        const cleanPhone = updatedBrand.phone.replace(/[^0-9]/g, '');
        const fullPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
        if (!updatedBrand.whatsappUrl || updatedBrand.whatsappUrl.includes('wa.me')) {
          updatedBrand.whatsappUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(`Hello ${updatedBrand.founder || 'there'}! ✨ I would like to enquire about booking a makeup session.`)}`;
        }
        updatedBrand.phoneHref = `tel:+${fullPhone}`;
        updatedBrand.phoneDisplay = `+91 ${cleanPhone.slice(-10)}`;
      }

      if (updatedBrand.instagram) {
        const cleanInsta = updatedBrand.instagram.replace(/^@/, '').trim();
        updatedBrand.instagram = `@${cleanInsta}`;
        if (!updatedBrand.instagramProfileUrl || updatedBrand.instagramProfileUrl.includes('instagram.com')) {
          updatedBrand.instagramProfileUrl = `https://instagram.com/${cleanInsta}`;
        }
        if (!updatedBrand.instagramDmUrl || updatedBrand.instagramDmUrl.includes('ig.me')) {
          updatedBrand.instagramDmUrl = `https://ig.me/m/${cleanInsta}`;
        }
      }

      const payload = { ...draft, brand: updatedBrand };
      setDraft(payload);
      const res = await saveContent(payload, effectiveAdminTenantId);
      if (res.success) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 3000);

        // If saving with global sync enabled and authorized as developer, sync across all client sites!
        if (authorizationService.canSyncAllTenants(role) && syncAlsoOnSave && clientsList.length > 1) {
          const syncRes = await syncContentToAllClients(payload, syncModules);
          showNotice(
            'success',
            `✓ Saved to Main Site & synced live across ${syncRes.updatedCount} client website(s)!`
          );
        } else {
          showNotice('success', res.error ? res.error : 'All changes saved & live across the website!');
        }
      } else {
        showNotice('error', res.error || 'Failed to save changes.');
      }
    } catch (err: any) {
      showNotice('error', 'Error saving changes: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all site content back to defaults?')) {
      const res = await resetToDefault();
      if (res.success) {
        showNotice('success', 'Reset to default theme successfully.');
      }
    }
  };

  // Client-side image compression: converts high-res photos to crisp, lightweight web-ready JPEG (~100-200KB)
  const compressImageFile = (file: File, maxWidth = 1600, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.size < 60 * 1024) {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve((event.target?.result as string) || '');
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve((event.target?.result as string) || '');
        img.src = (event.target?.result as string) || '';
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Upload single file with Firebase Storage + compressed fallback
  const processAndUploadFile = async (file: File): Promise<string> => {
    const compressedDataUrl = await compressImageFile(file);

    if (isFirebaseConnected && mediaService.isAvailable()) {
      try {
        const cloudUrl = await mediaService.uploadAdminMedia(file, 3500);
        return cloudUrl;
      } catch (err) {
        console.info('Using client-compressed photo attachment:', err);
      }
    }

    return compressedDataUrl;
  };

  // Direct single image upload (for covers, logos, portraits)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUrlReady: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // Reset input so re-selecting the same file triggers onChange

    setUploadingImage('uploading');
    showNotice('success', `Processing "${file.name}"...`);

    try {
      const url = await processAndUploadFile(file);
      if (url) {
        onUrlReady(url);
        showNotice('success', 'Photo attached successfully! Click "Save & Publish Live" to save.');
      } else {
        showNotice('error', 'Could not process photo file.');
      }
    } catch (err: any) {
      showNotice('error', 'Failed to attach image: ' + (err?.message || 'Error'));
    } finally {
      setUploadingImage(null);
    }
  };

  // Multiple image upload for model galleries (batch upload up to 20 photos total)
  const handleMultipleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    catIdx: number,
    modelIdx: number
  ) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    e.target.value = ''; // Reset input

    const currentImgs = draft.portfolioCategories[catIdx].models[modelIdx].galleryImages || [];
    const availableSlots = 20 - currentImgs.length;

    if (availableSlots <= 0) {
      showNotice('error', 'Maximum limit of 20 photos reached for this model.');
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    setUploadingImage('uploading');
    showNotice('success', `Processing ${filesToUpload.length} photo(s)...`);

    try {
      const urls: string[] = [];
      for (const file of filesToUpload) {
        const url = await processAndUploadFile(file);
        if (url) urls.push(url);
      }

      if (urls.length > 0) {
        const nextCats = [...draft.portfolioCategories];
        const updatedImgs = [...nextCats[catIdx].models[modelIdx].galleryImages, ...urls];
        nextCats[catIdx].models[modelIdx].galleryImages = updatedImgs.slice(0, 20);
        setDraft({ ...draft, portfolioCategories: nextCats });
        showNotice(
          'success',
          `${urls.length} photo(s) added! (${Math.min(20, updatedImgs.length)} / 20) Click "Save & Publish Live" to save.`
        );
      }
    } catch (err: any) {
      showNotice('error', 'Failed to add photos: ' + (err?.message || 'Error'));
    } finally {
      setUploadingImage(null);
    }
  };


  const downloadConfigJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportConfigJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${draft.brand.name.toLowerCase().replace(/\s+/g, '_')}_site_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotice('success', 'Configuration exported! You can use this file to clone this site for any client.');
  };

  const handleDownloadClientCloneJson = () => {
    const salon = newClientData.salonName.trim() || 'Client Salon';
    const founder = newClientData.founderName.trim() || 'Beauty Artist';
    const phone = newClientData.phone.trim() || draft.brand.phone;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const location = newClientData.location.trim() || draft.brand.location;
    const insta = newClientData.instagram.trim() || draft.brand.instagram;

    // Create a deep copy of current draft tailored for client
    const clientConfig: SiteContent = JSON.parse(JSON.stringify(draft));
    clientConfig.brand.name = salon;
    clientConfig.brand.founder = founder;
    clientConfig.brand.location = location;
    clientConfig.brand.phone = phone;
    clientConfig.brand.phoneDisplay = phone;
    clientConfig.brand.phoneHref = `tel:${cleanPhone}`;
    clientConfig.brand.whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${founder}! I would like to inquire about bridal makeup bookings at ${salon}.`)}`;
    clientConfig.brand.instagram = insta;
    clientConfig.brand.tagline = `Bespoke Bridal & Luxury Glamour in ${location}`;
    if (clientConfig.brand.aboutStory) {
      clientConfig.brand.aboutStory.heading = `Meet ${founder}`;
      clientConfig.brand.aboutStory.subheading = `Artist, visionary, and bridal beauty artisan in ${location}.`;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(clientConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${salon.toLowerCase().replace(/[^a-z0-9]/g, '_')}_siteContent.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotice('success', `Generated and downloaded tailored configuration for ${salon}!`);
  };

  const generatedCredentialsSnippet = `/**
 * Generated Admin Credentials for ${newClientData.salonName.trim() || 'Client Salon'}
 * Place this code into: src/config/adminCredentials.ts
 */

export interface AdminAccount {
  email: string;
  password: string;
  role: 'developer' | 'client';
  label: string;
}

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  // ─── MASTER DEVELOPER (You - Can access all cloned sites) ────────────
  {
    email: 'admin@khushimakeup.com',
    password: 'khushi123',
    role: 'developer',
    label: 'Master Developer (Full Access + Cloning)',
  },

  // ─── CLIENT ACCESS (Only content editing for their site, NO cloning) ──
  {
    email: '${newClientData.email.trim() || 'client@salon.com'}',
    password: '${newClientData.password.trim() || 'client2026'}',
    role: 'client',
    label: '${newClientData.salonName.trim() || 'Client'} Editor',
  },
];
`;

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const contentStr = event.target?.result;
      if (typeof contentStr === 'string') {
        const res = await importConfigJson(contentStr);
        if (res.success) {
          showNotice('success', 'Configuration imported successfully! Site updated.');
        } else {
          showNotice('error', res.error || 'Import failed');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#140b0f]/95 backdrop-blur-md text-[#fcecee] font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* ── Master Developer Inspection Banner (Prominent, Non-Impersonated) ── */}
      {isDeveloper && (
        <div className="bg-gradient-to-r from-purple-950 via-[#271035] to-purple-950 border-b border-purple-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-purple-200 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 font-bold text-[11px]">🔧</span>
            <span>Master Developer Mode: Managing <strong className="text-white font-semibold">{draft.brand.name}</strong> (<code className="text-purple-300">{effectiveAdminTenantId}</code>)</span>
          </div>
          <button
            onClick={() => {
              onClose();
              window.location.hash = '#masteradmin';
            }}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Return to Master Admin Cockpit</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Top Header Bar ── */}
      <header className="px-6 py-3.5 border-b border-[#b89758]/30 flex flex-wrap items-center justify-between gap-3 bg-[#1f1016]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-['Playfair_Display'] text-xl text-white font-medium">
                {draft.brand.name} Admin Panel
              </h2>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'}`}>
                {isFirebaseConnected ? 'Firebase Synced 🟢' : 'Local / Offline Mode 🟡'}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${isDeveloper ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'bg-[#b89758]/15 text-[#fed488] border border-[#b89758]/35'}`}>
                {isDeveloper ? 'Developer Mode' : 'Studio Manager'}
              </span>
            </div>
            <p className="text-xs text-[#dfc3c9]">
              Customise your photos, videos, pricing, services, and operational hours.
            </p>
          </div>
        </div>

        {/* ── Center: Tenant Brand Identity ── */}
        <div className="flex items-center gap-2 bg-[#12080d]/80 border border-[#b89758]/30 rounded-xl px-3.5 py-1.5 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-[#fed488]" />
          <span className="text-xs text-white">
            Salon: <strong className="text-[#fed488]">{draft.brand.name}</strong>
          </span>
          <span className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30 font-mono">
            {effectiveAdminTenantId}
          </span>
          <a
            href={(() => {
              const client = clientsList.find((c) => c.id === effectiveAdminTenantId);
              if (client?.storefrontUrl) return client.storefrontUrl;
              if (effectiveAdminTenantId === 'khushi') return '/';
              const isDev = typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));
              return isDev ? `/?client=${effectiveAdminTenantId}` : `https://${effectiveAdminTenantId}.vercel.app`;
            })()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-white/10 text-[#fed488] hover:text-white rounded-lg transition-colors ml-1"
            title="View live website in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer border ${
              justSaved
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/30'
                : 'bg-gradient-to-r from-[#6c2e3e] to-[#b89758] hover:opacity-95 active:scale-95 text-white border-[#fed488]/40 shadow-lg shadow-[#6c2e3e]/40'
            }`}
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved &amp; Published! ✓</span>
              </>
            ) : isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#fed488]" />
                <span>Save &amp; Publish Live</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close Admin Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Status Toast ── */}
      {uploadingImage && (
        <div className="px-6 py-2.5 text-xs flex items-center gap-2 font-medium bg-amber-950/90 text-amber-200 border-b border-amber-500/40 animate-pulse">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          Processing &amp; attaching photo(s)... Please wait.
        </div>
      )}
      {statusMsg && !uploadingImage && (
        <div className={`px-6 py-2.5 text-xs flex items-center gap-2 font-medium transition-all ${statusMsg.type === 'success' ? 'bg-emerald-900/90 text-emerald-200 border-b border-emerald-500/40' : 'bg-rose-900/90 text-rose-200 border-b border-rose-500/40'}`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          {statusMsg.text}
        </div>
      )}

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-[#b89758]/20 bg-[#190c13] flex flex-col p-4 gap-1.5 shrink-0 overflow-y-auto">
          {/* Archetype & Capabilities Manager (always at top) */}
          <button
            onClick={() => setActiveTab('archetypeModules')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'archetypeModules'
                ? 'bg-gradient-to-r from-[#6c2e3e] to-[#8d3a4f] text-white shadow-md border border-[#fed488]/40'
                : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#fed488]" />
              <span>Archetypes &amp; Modules</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#fed488]/20 text-[#fed488] font-mono">
              {ARCHETYPE_PRESETS[draft.archetype || 'solo_mua']?.badge || 'SaaS'}
            </span>
          </button>

          <div className="my-1.5 border-t border-white/10" />



          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#b89758] px-3 py-1">
            Studio CRM &amp; Schedule
          </span>

          {/* Appointments CRM (if appointmentBookings enabled) */}
          {draft.enabledModules?.appointmentBookings && (
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'appointments'
                  ? 'bg-gradient-to-r from-[#6c2e3e] to-[#8d3a4f] text-white shadow-md border border-[#fed488]/40'
                  : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#fed488]" />
                <span>Appointments CRM</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fed488] text-[#562230]">
                {(appointments || []).length}
              </span>
            </button>
          )}

          {/* Enquiries & Leads (if leadEnquiries enabled) */}
          {draft.enabledModules?.leadEnquiries !== false && (
            <button
              onClick={() => setActiveTab('enquiries')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-gradient-to-r from-[#6c2e3e] to-[#8d3a4f] text-white shadow-md border border-[#fed488]/40'
                  : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#fed488]" />
                <span>Enquiries &amp; Leads</span>
              </div>
              {(enquiries || []).filter((e) => e.status === 'new').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm animate-pulse">
                  {(enquiries || []).filter((e) => e.status === 'new').length} new
                </span>
              )}
            </button>
          )}

          {/* Staff Team Members (if staffManagement enabled) */}
          {draft.enabledModules?.staffManagement && (
            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-gradient-to-r from-[#6c2e3e] to-[#8d3a4f] text-white shadow-md border border-[#fed488]/40'
                  : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Scissors className="w-4 h-4 text-[#fed488]" />
                <span>Stylists &amp; Team</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[#fed488]">
                {(draft.staff || []).length}
              </span>
            </button>
          )}

          {/* Business Hours & Slots (if businessHours enabled) */}
          {draft.enabledModules?.businessHours && (
            <button
              onClick={() => setActiveTab('businessHours')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'businessHours'
                  ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50'
                  : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4 text-[#fed488]" />
              <span>Business Hours &amp; Slots</span>
            </button>
          )}

          <div className="my-1 border-t border-white/10" />

          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#b89758] px-3 py-1">
            Editor Sections
          </span>

          <button
            onClick={() => setActiveTab('sections')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'sections' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
          >
            <Sliders className="w-4 h-4 text-[#fed488]" />
            Page Sections &amp; Visibility
          </button>

          {draft.enabledModules?.offerPopup !== false && (
            <button
              onClick={() => setActiveTab('offerPopup')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'offerPopup'
                  ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50'
                  : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Megaphone className="w-4 h-4 text-[#fed488]" />
                <span>Offer &amp; Announcement Popup</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  draft.offerPopup?.enabled !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {draft.offerPopup?.enabled !== false ? 'Live' : 'Off'}
              </span>
            </button>
          )}

          {draft.enabledModules?.bridalPortfolio !== false && (
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'portfolio' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
            >
              <ImageIcon className="w-4 h-4 text-[#fed488]" />
              <span>Portfolio &amp; Models</span>
            </button>
          )}

          {draft.enabledModules?.beforeAfterGallery !== false && (
            <button
              onClick={() => setActiveTab('beforeAfter')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'beforeAfter' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
            >
              <Wand2 className="w-4 h-4 text-[#fed488]" />
              <span>Before &amp; After Slider</span>
            </button>
          )}

          {draft.enabledModules?.muaMuhuratCalendar !== false && (
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'calendar' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#fed488]" />
                <span>Booked Dates Manager</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#b89758]/20 text-[#fed488]">
                {(draft.calendarAvailability || []).length}
              </span>
            </button>
          )}

          {draft.enabledModules?.reviewsModeration !== false && (
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'testimonials' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-[#fed488]" />
                <span>Bride Reviews</span>
              </div>
              {(draft.pendingReviews || []).filter((r) => r.status === 'pending').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-black animate-pulse">
                  {(draft.pendingReviews || []).filter((r) => r.status === 'pending').length} new
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('brand')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'brand' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
          >
            <Phone className="w-4 h-4 text-[#fed488]" />
            Brand, Phone &amp; Maps
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'about' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
          >
            <Sparkles className="w-4 h-4 text-[#fed488]" />
            Hero &amp; Atelier Story
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'services' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
          >
            <DollarSign className="w-4 h-4 text-[#fed488]" />
            Services &amp; Pricing
          </button>

          {draft.enabledModules?.bridalPackages !== false && (
            <button
              onClick={() => setActiveTab('packages')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'packages' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
            >
              <Layers className="w-4 h-4 text-[#fed488]" />
              Bridal Packages
            </button>
          )}

          {draft.enabledModules?.videoShowcase !== false && (
            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'videos' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
            >
              <Video className="w-4 h-4 text-[#fed488]" />
              Transformation Videos
            </button>
          )}

          <button
            onClick={() => setActiveTab('faqs')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'faqs' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
          >
            <HelpCircle className="w-4 h-4 text-[#fed488]" />
            Client FAQ
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'seo' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
          >
            <Globe className="w-4 h-4 text-[#fed488]" />
            SEO &amp; Tracking Analytics
          </button>

          {authorizationService.canExportConfig(role) && (
            <>
              <div className="my-2 border-t border-white/10" />

              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#b89758] px-3 py-1">
                White-Label &amp; Tools
              </span>

              <button
                onClick={() => setActiveTab('export')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${activeTab === 'export' ? 'bg-[#6c2e3e] text-white shadow-md border border-[#b89758]/50' : 'text-[#dfc3c9] hover:bg-white/5 hover:text-white'}`}
              >
                <Download className="w-4 h-4 text-[#fed488]" />
                Clone &amp; Export Config
              </button>
            </>
          )}

          <div className="mt-auto pt-4 flex flex-col gap-2">
            {authorizationService.canResetDefaults(role) && (
              <button
                onClick={handleReset}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset To Original Defaults
              </button>
            )}

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] text-rose-300/80 hover:text-rose-200 hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Admin
            </button>
          </div>
        </aside>

        {/* Tab Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-5xl mx-auto w-full">

          {/* ══════════ TAB: ARCHETYPES & MODULAR CAPABILITIES ══════════ */}
          {activeTab === 'archetypeModules' && (
            <ArchetypeModulesTab
              currentArchetype={draft.archetype || 'solo_mua'}
              enabledModules={draft.enabledModules || {}}
              onSwitchArchetype={(newArch) => {
                const preset = ARCHETYPE_PRESETS[newArch] || ARCHETYPE_PRESETS.solo_mua;
                setDraft((prev) => ({
                  ...prev,
                  archetype: newArch,
                  enabledModules: { ...preset.defaultModules },
                  businessHours: prev.businessHours || preset.defaultBusinessHours,
                }));
                showNotice('success', `Switched to "${preset.name}" preset. Click "Save & Publish Live" to apply.`);
              }}
              onToggleModule={(modId, val) => {
                setDraft((prev) => ({
                  ...prev,
                  enabledModules: {
                    ...(prev.enabledModules || {}),
                    [modId]: val,
                  },
                }));
              }}
            />
          )}

          {/* ══════════ TAB CRM: APPOINTMENTS ══════════ */}
          {activeTab === 'appointments' && (
            <AppointmentsTab
              appointments={appointments || []}
              onUpdateStatus={async (id, status) => {
                const ok = await updateAppointmentStatus(id, status);
                if (ok) showNotice('success', `Appointment status updated to ${status}`);
                return ok;
              }}
              onDeleteAppointment={async (id) => {
                const ok = await deleteAppointment(id);
                if (ok) showNotice('success', 'Appointment record removed.');
                return ok;
              }}
            />
          )}

          {/* ══════════ TAB: STYLISTS & TEAM MEMBERS ══════════ */}
          {activeTab === 'staff' && (
            <StaffManagerTab
              staffList={draft.staff || []}
              services={draft.services || []}
              onUpdateStaff={(newStaff) => {
                setDraft((prev) => ({ ...prev, staff: newStaff }));
                showNotice('success', 'Staff roster updated! Click "Save & Publish Live" to persist.');
              }}
              onUploadPhoto={processAndUploadFile}
              tenantId={effectiveAdminTenantId}
            />
          )}

          {/* ══════════ TAB: BUSINESS HOURS & APPOINTMENT SLOTS ══════════ */}
          {activeTab === 'businessHours' && (
            <BusinessHoursTab
              businessHours={draft.businessHours || DEFAULT_BUSINESS_HOURS}
              onUpdateBusinessHours={(newHours) => {
                setDraft((prev) => ({ ...prev, businessHours: newHours }));
                showNotice('success', 'Operating hours updated! Click "Save & Publish Live" to persist.');
              }}
            />
          )}

          {/* ══════════ TAB CRM: ENQUIRIES & LEADS ══════════ */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                      Client Enquiries &amp; Leads Inbox
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                      Mini CRM
                    </span>
                  </div>
                  <p className="text-xs text-[#dfc3c9] mt-1 max-w-2xl">
                    Real-time record of clients who filled the booking concierge form. You can update their status, launch instant WhatsApp chats, call directly, or export data for Excel.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(enquiries || []).length > 0 && (
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to clear all ${(enquiries || []).length} enquiry records? This will remove test submissions.`)) {
                          await clearAllEnquiries();
                          showNotice('success', 'All enquiry records cleared.');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer shrink-0"
                      title="Clear all enquiries"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All ({(enquiries || []).length})
                    </button>
                  )}

                  <button
                    onClick={handleExportEnquiriesCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all cursor-pointer shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#fed488]" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Filter Pills & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['all', 'new', 'contacted', 'booked', 'completed'] as const).map((filter) => {
                    const count = filter === 'all'
                      ? (enquiries || []).length
                      : (enquiries || []).filter((e) => e.status === filter).length;
                    return (
                      <button
                        key={filter}
                        onClick={() => setEnquiryFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                          enquiryFilter === filter
                            ? 'bg-[#6c2e3e] text-white border border-[#fed488]/40 shadow-sm'
                            : 'text-[#dfc3c9]/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {filter} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search client, phone, date..."
                    value={enquirySearch}
                    onChange={(e) => setEnquirySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#fed488]"
                  />
                </div>
              </div>

              {/* Enquiries List / Cards */}
              {(() => {
                const filtered = (enquiries || [])
                  .filter((e) => enquiryFilter === 'all' || e.status === enquiryFilter)
                  .filter((e) => {
                    if (!enquirySearch.trim()) return true;
                    const q = enquirySearch.toLowerCase();
                    return (
                      e.clientName?.toLowerCase().includes(q) ||
                      e.phone?.toLowerCase().includes(q) ||
                      e.ceremonyType?.toLowerCase().includes(q) ||
                      e.eventDate?.toLowerCase().includes(q) ||
                      e.location?.toLowerCase().includes(q) ||
                      e.notes?.toLowerCase().includes(q)
                    );
                  });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-2xl bg-black/30 border border-white/10 text-white/60 space-y-2">
                      <MessageSquare className="w-8 h-8 text-[#fed488]/50 mx-auto" />
                      <p className="text-sm font-medium text-white/80">No enquiries found</p>
                      <p className="text-xs text-white/50 max-w-sm mx-auto">
                        {enquirySearch
                          ? 'Try a different search term.'
                          : 'Whenever brides submit booking requests on your website, their contact details and date will be logged right here automatically.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map((item) => {
                      const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
                      const waPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
                      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
                        `Hello ${item.clientName}! This is ${draft.brand.founder} from ${draft.brand.name}. Regarding your ${item.ceremonyType || 'bridal makeup'} enquiry for ${item.eventDate || 'your ceremony'}...`
                      )}`;

                      return (
                        <div
                          key={item.id}
                          className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-[#fed488]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-['Playfair_Display'] text-base text-white font-medium">
                                {item.clientName || 'Unnamed Client'}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                                  item.status === 'new'
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                    : item.status === 'contacted'
                                    ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                                    : item.status === 'booked'
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                    : 'bg-zinc-800 text-zinc-300 border-zinc-600'
                                }`}
                              >
                                {item.status}
                              </span>
                              <span className="text-[11px] text-[#dfc3c9]/60">
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#dfc3c9]">
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-[#fed488]" />
                                <span>{item.phone || 'No phone provided'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#fed488]" />
                                <span>{item.eventDate || 'Flexible date'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#fed488]" />
                                <span className="truncate">{item.location || 'Studio'}</span>
                              </div>
                            </div>

                            <div className="text-xs text-[#fed488]/90 font-medium">
                              Requested: {item.ceremonyType || 'Signature Service'}
                            </div>

                            {item.notes && (
                              <div className="text-xs text-[#dfc3c9]/80 bg-white/5 p-2 rounded-xl border border-white/10 italic">
                                "{item.notes}"
                              </div>
                            )}
                          </div>

                          {/* Status Switcher & Actions */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                            <select
                              value={item.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as EnquiryStatus;
                                updateEnquiryStatus(item.id, newStatus);
                                showNotice('success', `Status updated to ${newStatus}`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488] cursor-pointer"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="booked">Booked</option>
                              <option value="completed">Completed</option>
                            </select>

                            {item.phone && (
                              <>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-[#25d366]/20 hover:bg-[#25d366] text-[#25d366] hover:text-white border border-[#25d366]/40 transition-all cursor-pointer"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </a>
                                <a
                                  href={`tel:${cleanPhone}`}
                                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
                                  title="Call Client"
                                >
                                  <PhoneCall className="w-4 h-4 text-[#fed488]" />
                                </a>
                              </>
                            )}

                            <button
                              onClick={() => {
                                if (confirm('Delete this enquiry record?')) {
                                  deleteEnquiry(item.id);
                                  showNotice('success', 'Enquiry deleted.');
                                }
                              }}
                              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══════════ TAB 0: SECTIONS & VISIBILITY ══════════ */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                    Page Sections &amp; Segments Visibility
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6c2e3e] text-[#fed488] border border-[#b89758]/40">
                    Live Toggle
                  </span>
                </div>
                <p className="text-xs text-[#dfc3c9] mt-1 max-w-2xl">
                  Slide any section ON or OFF. Hidden sections are completely removed from both the public website and the top navigation menu. Remember to click "Save &amp; Publish Live" after adjusting.
                </p>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-[#dfc3c9]">
                  {Object.values(draft.sectionsVisibility || {}).filter(Boolean).length} of 15 sections currently visible
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allOn: SectionVisibilityConfig = {
                        announcementBar: true,
                        hero: true,
                        philosophy: true,
                        services: true,
                        portfolio: true,
                        beforeAfter: true,
                        dateAvailabilityCalendar: true,
                        videos: true,
                        testimonials: true,
                        whyChooseUs: true,
                        aboutStory: true,
                        pricing: true,
                        bridalPackages: true,
                        bookingForm: true,
                        faqs: true,
                        finalCta: true,
                        quickContactBar: true,
                      };
                      setDraft({ ...draft, sectionsVisibility: allOn });
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-900 transition-colors cursor-pointer"
                  >
                    Enable All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const minimal: SectionVisibilityConfig = {
                        announcementBar: false,
                        hero: true,
                        philosophy: false,
                        services: true,
                        portfolio: true,
                        beforeAfter: true,
                        dateAvailabilityCalendar: true,
                        videos: false,
                        testimonials: true,
                        whyChooseUs: false,
                        aboutStory: true,
                        pricing: true,
                        bridalPackages: true,
                        bookingForm: true,
                        faqs: false,
                        finalCta: true,
                        quickContactBar: true,
                      };
                      setDraft({ ...draft, sectionsVisibility: minimal });
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs hover:bg-amber-900 transition-colors cursor-pointer"
                  >
                    Minimal Mode
                  </button>
                </div>
              </div>

              {/* Sections Toggle Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: 'announcementBar',
                    title: 'Top Festive Announcement Bar',
                    desc: 'Top announcement strip for festival offers, seasonal discounts, or booking updates.',
                    tag: 'Banner',
                  },
                  {
                    key: 'hero',
                    title: 'Hero Banner & Introduction',
                    desc: 'Main heading, tagline, monogram, background arches, and booking buttons.',
                    tag: 'Top Banner',
                  },
                  {
                    key: 'philosophy',
                    title: 'Studio Philosophy & Quote',
                    desc: '“You are already beautiful” quote and editorial beauty statement.',
                    tag: 'Narrative',
                  },
                  {
                    key: 'services',
                    title: 'Bespoke Services Menu',
                    desc: 'Individual cards showcasing bridal, engagement, party, haldi, and mehendi makeup.',
                    tag: 'Services',
                  },
                  {
                    key: 'portfolio',
                    title: 'Curated Portfolio & Model Lookbook',
                    desc: 'Model photos, categories (Bridal, Party, Haldi), full lightbox preview.',
                    tag: 'Gallery',
                  },
                  {
                    key: 'beforeAfter',
                    title: 'Before & After Glam Slider',
                    desc: 'Interactive split-screen comparison slider showing raw skin prep vs royal HD bridal glamour.',
                    tag: 'Artistry',
                  },
                  {
                    key: 'dateAvailabilityCalendar',
                    title: 'Wedding Dates Availability Calendar',
                    desc: 'Live interactive calendar highlighting booked, limited, and available wedding dates.',
                    tag: 'Booking',
                  },
                  {
                    key: 'videos',
                    title: 'Transformation Video Showcase',
                    desc: '“Behind the Brush” transformation video player cards and Instagram callout.',
                    tag: 'Media',
                  },
                  {
                    key: 'testimonials',
                    title: 'Real Brides Testimonials & Reviews',
                    desc: 'Showcase bride ratings, verified quotes, and spotlight reviews carousel.',
                    tag: 'Social Proof',
                  },
                  {
                    key: 'whyChooseUs',
                    title: 'Why Choose Artist (5 Benefits)',
                    desc: 'Artisanal techniques, hygienic kits, contoured undertones, and home service.',
                    tag: 'Benefits',
                  },
                  {
                    key: 'aboutStory',
                    title: 'Atelier Story & Bio',
                    desc: 'About Khushi narrative, artist portrait photo, years of experience, and bio.',
                    tag: 'Profile',
                  },
                  {
                    key: 'pricing',
                    title: 'Service Pricing Table',
                    desc: 'Detailed rate list with clear inclusions and duration per service.',
                    tag: 'Rates',
                  },
                  {
                    key: 'bridalPackages',
                    title: 'Bridal Package Suites',
                    desc: 'The 3 signature tiers (Royal Bihari Heritage, Classic Glass Glow, Reception).',
                    tag: 'Packages',
                  },
                  {
                    key: 'bookingForm',
                    title: 'Booking Concierge & Form',
                    desc: 'Interactive date & ceremony reservation form connecting directly to WhatsApp.',
                    tag: 'Bookings',
                  },
                  {
                    key: 'faqs',
                    title: 'Client Guidance FAQ Accordion',
                    desc: 'Collapsible questions &amp; answers for brides and wedding party clients.',
                    tag: 'Help',
                  },
                  {
                    key: 'finalCta',
                    title: 'Final Call-to-Action Banner',
                    desc: 'Closing banner with WhatsApp and Instagram direct messaging buttons.',
                    tag: 'CTA',
                  },
                  {
                    key: 'quickContactBar',
                    title: 'Mobile Floating Contact Bar',
                    desc: 'Floating WhatsApp and Instagram circular action buttons on mobile screens.',
                    tag: 'Mobile Widget',
                  },
                  {
                    key: 'offerPopup',
                    title: 'Artistic Announcement & Offer Popup',
                    desc: 'Artistic square modal with sprinkles & rings showing festive discounts or studio updates to visitors.',
                    tag: 'Visitor Popup',
                  },
                ].map((sec) => {
                  const isVisible = draft.sectionsVisibility?.[sec.key as keyof typeof draft.sectionsVisibility] !== false;
                  return (
                    <div
                      key={sec.key}
                      className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                        isVisible
                          ? 'bg-[#1d0e15] border-[#b89758]/40 shadow-sm'
                          : 'bg-black/30 border-white/10 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#fed488]">
                              {sec.tag}
                            </span>
                            <span className={`text-[10px] font-semibold ${isVisible ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isVisible ? '● VISIBLE' : '○ HIDDEN'}
                            </span>
                          </div>
                          <h4 className="font-['Playfair_Display'] text-base text-white font-medium mt-1">
                            {sec.title}
                          </h4>
                          <p className="text-xs text-[#dfc3c9]/80 mt-1 leading-relaxed">
                            {sec.desc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-[#fed488] font-medium">
                          {isVisible ? 'Display on Website' : 'Hidden from Website'}
                        </span>
                        <SlideToggle
                          checked={isVisible}
                          onChange={(val) => {
                            setDraft({
                              ...draft,
                              sectionsVisibility: {
                                ...draft.sectionsVisibility,
                                [sec.key]: val,
                              },
                              ...(sec.key === 'offerPopup'
                                ? {
                                    offerPopup: {
                                      ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                                      enabled: val,
                                    },
                                  }
                                : {}),
                            });
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════ TAB: OFFER & ANNOUNCEMENT POPUP ══════════ */}
          {activeTab === 'offerPopup' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                      Ongoing Offer &amp; Announcement Popup
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6c2e3e] text-[#fed488] border border-[#b89758]/40">
                      Artistic Square Popup
                    </span>
                  </div>
                  <p className="text-xs text-[#dfc3c9] mt-1 max-w-2xl">
                    Configure the artistic square popup displayed to visitors when they land on your website. Upload a square promotional photo, edit the touched top/bottom banner texts, and manage live visibility.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPopupPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider border border-[#fed488]/50 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Eye className="w-4 h-4 text-[#fed488]" />
                  <span>Preview Popup Live</span>
                </button>
              </div>

              {/* Master Switches Card */}
              <div className="p-6 rounded-2xl bg-[#1d0e15] border border-[#b89758]/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#fed488]" />
                      <span>Enable Offer / Announcement Popup</span>
                    </h4>
                    <p className="text-xs text-[#dfc3c9]/70 mt-0.5">
                      When turned ON, visitors will see the artistic popup after landing on your website.
                    </p>
                  </div>
                  <SlideToggle
                    checked={draft.offerPopup?.enabled ?? true}
                    onChange={(val) => {
                      setDraft({
                        ...draft,
                        offerPopup: {
                          ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                          enabled: val,
                        },
                        sectionsVisibility: {
                          ...draft.sectionsVisibility,
                          offerPopup: val,
                        },
                      });
                    }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Visitor Display Frequency
                    </h4>
                    <p className="text-xs text-[#dfc3c9]/70 mt-0.5">
                      {draft.offerPopup?.showOncePerSession !== false
                        ? 'Show once per session (Recommended: user closes it once, it will not pop up again during the same visit)'
                        : 'Show on every visit (Opens every time someone opens or refreshes the site)'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current = draft.offerPopup?.showOncePerSession !== false;
                      setDraft({
                        ...draft,
                        offerPopup: {
                          ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                          showOncePerSession: !current,
                        },
                      });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      draft.offerPopup?.showOncePerSession !== false
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                    }`}
                  >
                    {draft.offerPopup?.showOncePerSession !== false ? '✓ Once Per Session' : '⚠️ Always Every Visit'}
                  </button>
                </div>
              </div>

              {/* Square Image & Content Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Image Uploader & Live Preview */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#1d0e15] border border-[#b89758]/40 space-y-4">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#fed488]" />
                    <span>Middle Square Photo / Flyer</span>
                  </h4>
                  <p className="text-xs text-[#dfc3c9]/70">
                    Upload a square promotional poster, festive offer banner, or bridal glamour photo.
                  </p>

                  {/* Square Photo Preview Box */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/60 border border-[#b89758]/40 shadow-inner flex items-center justify-center group">
                    {draft.offerPopup?.imageUrl ? (
                      <img
                        src={draft.offerPopup.imageUrl}
                        alt="Popup preview"
                        className="w-full h-full object-cover select-none"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-10 h-10 text-white/30 mx-auto mb-2" />
                        <span className="text-xs text-zinc-400">No square photo attached</span>
                      </div>
                    )}

                    {/* Overlay Upload Button */}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 cursor-pointer text-white">
                      <Upload className="w-6 h-6 text-[#fed488]" />
                      <span className="text-xs font-semibold">Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => {
                            setDraft({
                              ...draft,
                              offerPopup: {
                                ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                                imageUrl: url,
                              },
                            });
                          })
                        }
                      />
                    </label>
                  </div>

                  {/* Image URL Text Input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#fed488] uppercase tracking-wider mb-1.5">
                      Photo URL / Direct Path
                    </label>
                    <input
                      type="text"
                      value={draft.offerPopup?.imageUrl || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          offerPopup: {
                            ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                            imageUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="/portfolio/model-01.jpg or https://..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#fed488] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Quick Preset Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#dfc3c9] mb-1.5">
                      Or Choose from Portfolio Photos:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        '/portfolio/model-01.jpg',
                        '/portfolio/model2-01.jpeg',
                        '/portfolio/model3-01.jpg',
                        '/portfolio/model4-01.jpg',
                      ].map((presetUrl, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setDraft({
                              ...draft,
                              offerPopup: {
                                ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                                imageUrl: presetUrl,
                              },
                            });
                          }}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            draft.offerPopup?.imageUrl === presetUrl
                              ? 'border-[#fed488] scale-105 shadow-md'
                              : 'border-white/20 hover:border-white/60 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={presetUrl}
                            alt={`Preset ${pIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Text & CTA Settings */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Top Touched Text Section */}
                  <div className="p-6 rounded-2xl bg-[#1d0e15] border border-[#b89758]/40 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <Tag className="w-4 h-4 text-[#fed488]" />
                      <h4 className="text-sm font-semibold text-white">
                        Top Touched Text (Overlapping Top Rim)
                      </h4>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#fed488] mb-1.5">
                        Top Announcement Badge
                      </label>
                      <input
                        type="text"
                        value={draft.offerPopup?.topBadgeText || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            offerPopup: {
                              ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                              topBadgeText: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Limited Festive Offer, Special Announcement"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#fed488] focus:outline-none transition-colors"
                      />
                      <span className="text-[10px] text-[#dfc3c9]/60 mt-1 block">
                        Renders in an elegant luxury plum &amp; gold pill resting directly on the top rim.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#fed488] mb-1.5">
                        Popup Title (Internal / Alt text)
                      </label>
                      <input
                        type="text"
                        value={draft.offerPopup?.topTitle || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            offerPopup: {
                              ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                              topTitle: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Special Bridal Booking Privilege"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#fed488] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Bottom Touched Text & CTA Section */}
                  <div className="p-6 rounded-2xl bg-[#1d0e15] border border-[#b89758]/40 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <Sparkles className="w-4 h-4 text-[#fed488]" />
                      <h4 className="text-sm font-semibold text-white">
                        Bottom Touched Card (Overlapping Lower Rim)
                      </h4>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#fed488] mb-1.5">
                        Offer Headline / Main Highlight
                      </label>
                      <input
                        type="text"
                        value={draft.offerPopup?.bottomHighlight || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            offerPopup: {
                              ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                              bottomHighlight: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Flat 15% Off On Full Bridal Packages"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#fed488] focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#fed488] mb-1.5">
                        Offer Details / Subtext
                      </label>
                      <textarea
                        rows={2}
                        value={draft.offerPopup?.bottomText || ''}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            offerPopup: {
                              ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                              bottomText: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g. Book before slots fill up • Includes complimentary pre-wedding skin consultation"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#fed488] focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#fed488] mb-1.5">
                          Action Button Label
                        </label>
                        <input
                          type="text"
                          value={draft.offerPopup?.ctaButtonText || ''}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              offerPopup: {
                                ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                                ctaButtonText: e.target.value,
                              },
                            })
                          }
                          placeholder="e.g. Reserve Your Date Now"
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#fed488] focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#fed488] mb-1.5">
                          Button Target Anchor / Link
                        </label>
                        <input
                          type="text"
                          value={draft.offerPopup?.ctaButtonLink || ''}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              offerPopup: {
                                ...(draft.offerPopup || DEFAULT_OFFER_POPUP),
                                ctaButtonLink: e.target.value,
                              },
                            })
                          }
                          placeholder="#booking-form or URL"
                          className="w-full px-3.5 py-2 text-xs rounded-xl bg-black/50 border border-white/10 text-white focus:border-[#fed488] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 1: PORTFOLIO & MODELS ══════════ */}
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                  Portfolio Categories &amp; Models
                </h3>
                <p className="text-xs text-[#dfc3c9] mt-1">
                  Change model names (e.g. Pushpanjali, Khushboo), replace cover thumbnails, and add/remove gallery photos in each category.
                </p>
              </div>

              {draft.portfolioCategories.map((category, catIdx) => (
                <div key={category.id} className="p-5 rounded-2xl bg-[#1d0e15] border border-[#b89758]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#fed488] font-bold">
                          Category #{catIdx + 1}
                        </span>
                        <h4 className="font-['Playfair_Display'] text-xl text-white">
                          {category.label}
                        </h4>
                      </div>
                      <SlideToggle
                        checked={category.hidden !== true}
                        onChange={(val) => {
                          const nextCats = [...draft.portfolioCategories];
                          nextCats[catIdx].hidden = !val;
                          setDraft({ ...draft, portfolioCategories: nextCats });
                        }}
                        label={category.hidden ? 'Hidden' : 'Visible'}
                        size="sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={category.tagline}
                        onChange={(e) => {
                          const nextCats = [...draft.portfolioCategories];
                          nextCats[catIdx].tagline = e.target.value;
                          setDraft({ ...draft, portfolioCategories: nextCats });
                        }}
                        placeholder="Tagline..."
                        className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Models list */}
                  <div className="space-y-4">
                    {category.models.map((model, modelIdx) => (
                      <div key={model.id} className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {/* Thumbnail preview */}
                            <div className="w-14 h-18 rounded-lg overflow-hidden border border-[#b89758]/40 bg-black shrink-0 relative group">
                              <img src={model.thumbnail} alt={model.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                                Model Name
                              </label>
                              <input
                                type="text"
                                value={model.name}
                                onChange={(e) => {
                                  const nextCats = [...draft.portfolioCategories];
                                  nextCats[catIdx].models[modelIdx].name = e.target.value;
                                  setDraft({ ...draft, portfolioCategories: nextCats });
                                }}
                                className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-sm font-medium text-white focus:border-[#fed488] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <SlideToggle
                              checked={model.hidden !== true}
                              onChange={(val) => {
                                const nextCats = [...draft.portfolioCategories];
                                nextCats[catIdx].models[modelIdx].hidden = !val;
                                setDraft({ ...draft, portfolioCategories: nextCats });
                              }}
                              label={model.hidden ? 'Hidden' : 'Visible'}
                              size="sm"
                            />

                            <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 cursor-pointer flex items-center gap-1.5 transition-colors">
                              <ImageIcon className="w-3.5 h-3.5 text-[#fed488]" />
                              Change Cover
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, (url) => {
                                    const nextCats = [...draft.portfolioCategories];
                                    nextCats[catIdx].models[modelIdx].thumbnail = url;
                                    setDraft({ ...draft, portfolioCategories: nextCats });
                                  })
                                }
                              />
                            </label>

                            <button
                              onClick={() => {
                                if (window.confirm(`Delete model ${model.name}?`)) {
                                  const nextCats = [...draft.portfolioCategories];
                                  nextCats[catIdx].models.splice(modelIdx, 1);
                                  setDraft({ ...draft, portfolioCategories: nextCats });
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/60 transition-colors"
                              title="Delete Model"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Gallery Images Strip */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] text-[#dfc3c9] font-medium">
                              Gallery Photos ({model.galleryImages.length} / 20 images)
                              {model.galleryImages.length >= 20 && (
                                <span className="ml-2 text-amber-400 font-semibold">Max 20 reached</span>
                              )}
                            </span>
                            {model.galleryImages.length < 20 && (
                              <label className="text-[11px] text-[#fed488] hover:underline flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 transition-colors">
                                <Plus className="w-3.5 h-3.5 text-[#fed488]" />
                                Add Photo{model.galleryImages.length > 0 ? 's' : ''} to {model.name}
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleMultipleGalleryUpload(e, catIdx, modelIdx)}
                                />
                              </label>
                            )}
                          </div>

                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {model.galleryImages.map((imgSrc, imgIdx) => (
                              <div key={imgIdx} className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border border-white/20 group">
                                <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => {
                                    const nextCats = [...draft.portfolioCategories];
                                    nextCats[catIdx].models[modelIdx].galleryImages.splice(imgIdx, 1);
                                    setDraft({ ...draft, portfolioCategories: nextCats });
                                  }}
                                  className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add new model to this category */}
                    <button
                      onClick={() => {
                        const nextCats = [...draft.portfolioCategories];
                        const newModel: PortfolioModel = {
                          id: `${category.id}-model-${Date.now()}`,
                          name: 'New Model',
                          thumbnail: '/portfolio/model-01.jpg',
                          galleryImages: ['/portfolio/model-01.jpg'],
                        };
                        nextCats[catIdx].models.push(newModel);
                        setDraft({ ...draft, portfolioCategories: nextCats });
                      }}
                      className="w-full py-2.5 rounded-xl border border-dashed border-[#b89758]/40 hover:border-[#fed488] text-xs text-[#fed488] flex items-center justify-center gap-2 hover:bg-[#b89758]/10 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Model to {category.label}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══════════ TAB: BEFORE & AFTER SLIDER ══════════ */}
          {activeTab === 'beforeAfter' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                      Before &amp; After Glam Slider
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6c2e3e] text-[#fed488] border border-[#b89758]/40">
                      {(draft.beforeAfterGallery || []).length} Looks
                    </span>
                  </div>
                  <p className="text-xs text-[#dfc3c9] mt-1 max-w-2xl">
                    Manage the interactive split-screen comparison slider on your website. Show prospective brides raw skin prep vs royal HD bridal finish to build instant booking trust.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddBeforeAfter((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#8d3a4f] text-white text-xs font-semibold border border-[#fed488]/40 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#fed488]" />
                  {showAddBeforeAfter ? 'Cancel' : 'Add Transformation'}
                </button>
              </div>

              {/* Add New Before/After Drawer */}
              {showAddBeforeAfter && (
                <form onSubmit={handleAddBeforeAfter} className="p-5 rounded-2xl bg-black/50 border border-[#fed488]/40 space-y-4">
                  <h4 className="font-['Playfair_Display'] text-lg text-white font-medium flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-[#fed488]" />
                    New Transformation Look
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Look Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Signature Bihari Bridal Glow"
                        value={newBeforeAfter.title || ''}
                        onChange={(e) => setNewBeforeAfter({ ...newBeforeAfter, title: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Subtitle / Technique
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Waterproof HD Base & Kohl Eyes"
                        value={newBeforeAfter.subtitle || ''}
                        onChange={(e) => setNewBeforeAfter({ ...newBeforeAfter, subtitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold">
                          Before Photo (Raw Skin) *
                        </label>
                        <label className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white border border-white/20 cursor-pointer flex items-center gap-1 transition-colors">
                          <ImageIcon className="w-3 h-3 text-[#fed488]" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => {
                                setNewBeforeAfter((prev) => ({ ...prev, beforeImageUrl: url }));
                              })
                            }
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="https://... or click Upload File above"
                        value={newBeforeAfter.beforeImageUrl || ''}
                        onChange={(e) => setNewBeforeAfter({ ...newBeforeAfter, beforeImageUrl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488]"
                      />
                      {newBeforeAfter.beforeImageUrl && (
                        <div className="mt-2 w-16 h-20 rounded-lg overflow-hidden border border-white/20">
                          <img src={newBeforeAfter.beforeImageUrl} alt="Preview Before" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold">
                          After Photo (Bridal Glam) *
                        </label>
                        <label className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white border border-white/20 cursor-pointer flex items-center gap-1 transition-colors">
                          <ImageIcon className="w-3 h-3 text-[#fed488]" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => {
                                setNewBeforeAfter((prev) => ({ ...prev, afterImageUrl: url }));
                              })
                            }
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="https://... or click Upload File above"
                        value={newBeforeAfter.afterImageUrl || ''}
                        onChange={(e) => setNewBeforeAfter({ ...newBeforeAfter, afterImageUrl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488]"
                      />
                      {newBeforeAfter.afterImageUrl && (
                        <div className="mt-2 w-16 h-20 rounded-lg overflow-hidden border border-[#fed488]/40">
                          <img src={newBeforeAfter.afterImageUrl} alt="Preview After" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Artistry Notes / Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Skin prep, primer, foundation shade, eyeshadow tones used..."
                      value={newBeforeAfter.description || ''}
                      onChange={(e) => setNewBeforeAfter({ ...newBeforeAfter, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488] resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBeforeAfter(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity cursor-pointer border border-[#fed488]/40"
                    >
                      Save to Slider
                    </button>
                  </div>
                </form>
              )}

              {/* List of Existing Before & After Transformations with Photo Change Controls */}
              <div className="space-y-4">
                {(draft.beforeAfterGallery || []).map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl bg-black/40 border border-white/15 hover:border-[#fed488]/40 transition-colors space-y-4">
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateBeforeAfter(item.id, { title: e.target.value })}
                          className="font-['Playfair_Display'] text-base text-white font-medium bg-transparent border-b border-white/15 focus:border-[#fed488] focus:outline-none w-full sm:w-auto"
                          placeholder="Transformation Title"
                        />
                        <input
                          type="text"
                          value={item.subtitle}
                          onChange={(e) => handleUpdateBeforeAfter(item.id, { subtitle: e.target.value })}
                          className="text-xs text-[#fed488] uppercase tracking-wider font-semibold bg-transparent border-b border-white/15 focus:border-[#fed488] focus:outline-none block mt-1 w-full sm:w-auto"
                          placeholder="Subtitle / Technique"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete transformation look "${item.title}"?`)) {
                            handleRemoveBeforeAfter(item.id);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900 border border-rose-800/40 text-xs transition-colors cursor-pointer self-start sm:self-auto"
                        title="Delete transformation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Look</span>
                      </button>
                    </div>

                    {/* Dual Photo Editors (Before Photo & After Photo) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Before Photo Card */}
                      <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#dfc3c9] uppercase tracking-wider font-bold">
                            Before Photo (Raw Skin)
                          </span>
                          <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white border border-white/20 cursor-pointer flex items-center gap-1.5 transition-colors">
                            <Upload className="w-3.5 h-3.5 text-[#fed488]" />
                            <span>Change Before Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) => {
                                  handleUpdateBeforeAfter(item.id, { beforeImageUrl: url });
                                })
                              }
                            />
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-16 h-20 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-black">
                            <img src={item.beforeImageUrl} alt="Before" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[10px] text-[#fed488] uppercase tracking-wider block mb-1">
                              Or Paste Image URL:
                            </label>
                            <input
                              type="text"
                              value={item.beforeImageUrl}
                              onChange={(e) => handleUpdateBeforeAfter(item.id, { beforeImageUrl: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* After Photo Card */}
                      <div className="p-3.5 rounded-xl bg-black/50 border border-[#fed488]/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#fed488] uppercase tracking-wider font-bold">
                            After Photo (Bridal Glam)
                          </span>
                          <label className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6c2e3e] to-[#b89758] hover:opacity-90 text-xs text-white border border-[#fed488]/40 cursor-pointer flex items-center gap-1.5 transition-opacity shadow-sm">
                            <Upload className="w-3.5 h-3.5 text-[#fed488]" />
                            <span>Change After Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) => {
                                  handleUpdateBeforeAfter(item.id, { afterImageUrl: url });
                                })
                              }
                            />
                          </label>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-16 h-20 rounded-xl overflow-hidden border border-[#fed488]/40 shrink-0 bg-black">
                            <img src={item.afterImageUrl} alt="After" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <label className="text-[10px] text-[#fed488] uppercase tracking-wider block mb-1">
                              Or Paste Image URL:
                            </label>
                            <input
                              type="text"
                              value={item.afterImageUrl}
                              onChange={(e) => handleUpdateBeforeAfter(item.id, { afterImageUrl: e.target.value })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-[#fed488]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description Notes */}
                    <div>
                      <label className="text-[10px] text-[#dfc3c9] uppercase tracking-wider block mb-1">
                        Artistry &amp; Skin Prep Notes:
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleUpdateBeforeAfter(item.id, { description: e.target.value })}
                        placeholder="e.g. Color corrected under-eyes, HD silicone primer, waterproof Bihari base..."
                        className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#fed488]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB: TESTIMONIALS & REVIEWS ══════════ */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                      Bride Reviews &amp; Testimonials
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6c2e3e] text-[#fed488] border border-[#b89758]/40">
                      {(draft.testimonials || []).filter((t) => !t.hidden).length} Active
                    </span>
                  </div>
                  <p className="text-xs text-[#dfc3c9] mt-1 max-w-2xl">
                    Showcase glowing words from your real brides. Add photos, ceremony names, star ratings, and testimonials that display on your public website and portfolio spotlight.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddTestimonial((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#8d3a4f] text-white text-xs font-semibold border border-[#fed488]/40 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#fed488]" />
                  {showAddTestimonial ? 'Cancel' : 'Add New Review'}
                </button>
              </div>

              {/* Option C: Pending Public Bride Reviews Queue */}
              {((draft.pendingReviews || []).filter((r) => r.status === 'pending').length > 0) && (
                <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h4 className="font-['Playfair_Display'] text-lg text-amber-200 font-medium">
                        Pending Bride Submissions ({(draft.pendingReviews || []).filter((r) => r.status === 'pending').length})
                      </h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 w-fit">
                      Requires 1-Click Verification
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/80">
                    These reviews were submitted by brides directly from your live website. Review their feedback and approve them to display on your public testimonials lookbook.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(draft.pendingReviews || [])
                      .filter((r) => r.status === 'pending')
                      .map((rev) => (
                        <div key={rev.id} className="p-4 rounded-xl bg-black/60 border border-amber-500/30 flex flex-col justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {rev.photoUrl ? (
                              <img src={rev.photoUrl} alt={rev.clientName} className="w-14 h-14 rounded-xl object-cover border border-amber-500/40 shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                                <Star className="w-6 h-6 fill-current" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <strong className="text-sm text-white truncate">{rev.clientName}</strong>
                                <div className="flex items-center text-amber-400">
                                  {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <span className="text-[11px] text-[#fed488] block">{rev.ceremony} • {rev.eventDate}</span>
                              <p className="text-xs text-[#dfc3c9] mt-1 line-clamp-3 italic">"{rev.reviewText}"</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                            <button
                              type="button"
                              onClick={() => handleDeclineReview(rev.id)}
                              className="px-3 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-950/50 border border-rose-800/40 transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveReview(rev.id)}
                              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black bg-gradient-to-r from-amber-400 to-[#fed488] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-md"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Approve &amp; Publish</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Add New Testimonial Form Drawer */}
              {showAddTestimonial && (
                <div className="p-5 rounded-2xl bg-black/50 border border-[#fed488]/40 space-y-4">
                  <h4 className="font-['Playfair_Display'] text-lg text-white font-medium flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#fed488]" />
                    New Bride Testimonial
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Bride's Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ananya Roy"
                        value={newTestimonial.clientName || ''}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, clientName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Ceremony / Look
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Royal Bridal Makeup &amp; Styling"
                        value={newTestimonial.ceremony || ''}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, ceremony: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Star Rating (1 - 5)
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (newTestimonial.rating || 5)
                                  ? 'fill-[#fed488] text-[#fed488]'
                                  : 'text-white/20'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Bride Photo (Upload or URL)
                      </label>
                      <div className="flex items-center gap-3">
                        {newTestimonial.photoUrl && (
                          <img
                            src={newTestimonial.photoUrl}
                            alt="Bride Preview"
                            className="w-10 h-10 rounded-full object-cover border border-[#fed488]/50"
                          />
                        )}
                        <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer border border-white/20">
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => setNewTestimonial({ ...newTestimonial, photoUrl: url }))
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Review / Testimonial Quote
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Khushi made me feel like royalty on my wedding day. The makeup lasted 14 hours flawlessly!"
                      value={newTestimonial.quote || ''}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Video Proof URL (YouTube Short or MP4)
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/shorts/... (Client speaking her review)"
                      value={newTestimonial.videoUrl || ''}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, videoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white font-mono focus:outline-none focus:border-[#fed488]"
                    />
                    <span className="text-[10px] text-[#dfc3c9]/70 mt-1 block">
                      Attach a YouTube Short of the bride speaking this review. Clicking her photo on the site will play this proof video.
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (!newTestimonial.clientName?.trim() || !newTestimonial.quote?.trim()) {
                        showNotice('error', 'Please enter bride name and review quote.');
                        return;
                      }
                      const item: TestimonialItem = {
                        id: 'testi-' + Date.now(),
                        clientName: newTestimonial.clientName.trim(),
                        ceremony: newTestimonial.ceremony?.trim() || 'Bridal Makeup',
                        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                        rating: newTestimonial.rating || 5,
                        reviewText: newTestimonial.quote.trim(),
                        quote: newTestimonial.quote.trim(),
                        videoUrl: newTestimonial.videoUrl?.trim() || '',
                        photoUrl: newTestimonial.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
                        verified: true,
                        hidden: false,
                      };
                      setDraft({
                        ...draft,
                        testimonials: [item, ...(draft.testimonials || [])],
                      });
                      setShowAddTestimonial(false);
                      setNewTestimonial({
                        clientName: '',
                        ceremony: 'Bridal Makeup & Styling',
                        rating: 5,
                        quote: '',
                        videoUrl: '',
                        photoUrl: '',
                        verified: true,
                        hidden: false,
                      });
                      showNotice('success', 'Review added! Click "Save & Publish Live" to publish.');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Add to Showcase
                  </button>
                </div>
              )}

              {/* Existing Testimonials List */}
              <div className="space-y-4">
                {(draft.testimonials || []).map((t, idx) => (
                  <div
                    key={t.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      t.hidden
                        ? 'bg-black/20 border-white/10 opacity-60'
                        : 'bg-black/40 border-white/15 hover:border-[#fed488]/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="relative group shrink-0">
                          <img
                            src={t.photoUrl}
                            alt={t.clientName}
                            className="w-14 h-14 rounded-full object-cover border border-[#fed488]/50"
                          />
                          <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload className="w-4 h-4 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) => {
                                  const updated = [...(draft.testimonials || [])];
                                  updated[idx] = { ...updated[idx], photoUrl: url };
                                  setDraft({ ...draft, testimonials: updated });
                                })
                              }
                            />
                          </label>
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-['Playfair_Display'] text-base text-white font-medium">
                              {t.clientName}
                            </span>
                            {t.verified && (
                              <span className="text-[10px] text-[#fed488] font-bold uppercase tracking-wider bg-[#fed488]/15 px-2 py-0.5 rounded-full border border-[#fed488]/30">
                                Verified Bride
                              </span>
                            )}
                            {t.hidden && (
                              <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/30">
                                Hidden
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#fed488] font-medium">{t.ceremony}</div>

                          <div className="flex items-center gap-1 text-[#fed488]">
                            {[...Array(t.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#fed488]" />
                            ))}
                          </div>

                          <p className="text-xs text-[#dfc3c9] italic pt-1">
                            "{t.reviewText || t.quote}"
                          </p>

                          {/* Video Proof URL Input & Test Link */}
                          <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                                Video Proof URL (YouTube Short or MP4)
                              </label>
                              {parseYouTubeId(t.videoUrl) ? (
                                <span className="text-[10px] text-red-400 font-medium flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                  <Youtube className="w-3 h-3 text-red-500" /> YouTube Short Proof Active
                                </span>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="https://www.youtube.com/shorts/... (Client speaking review)"
                                value={t.videoUrl || ''}
                                onChange={(e) => {
                                  const updated = [...(draft.testimonials || [])];
                                  updated[idx] = { ...updated[idx], videoUrl: e.target.value };
                                  setDraft({ ...draft, testimonials: updated });
                                }}
                                className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white font-mono placeholder:text-white/30"
                              />
                              {t.videoUrl && (
                                <a
                                  href={t.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 shrink-0"
                                  title="Test / Open Link"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Test</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                        <button
                          onClick={() => {
                            const updated = [...(draft.testimonials || [])];
                            updated[idx] = { ...updated[idx], hidden: !updated[idx].hidden };
                            setDraft({ ...draft, testimonials: updated });
                          }}
                          className={`p-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                            t.hidden
                              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                              : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20'
                          }`}
                          title={t.hidden ? 'Show on website' : 'Hide from website'}
                        >
                          {t.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Remove review from ${t.clientName}?`)) {
                              setDraft({
                                ...draft,
                                testimonials: (draft.testimonials || []).filter((_, i) => i !== idx),
                              });
                              showNotice('success', 'Testimonial removed.');
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                          title="Delete Testimonial"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB: BOOKED DATES & CALENDAR ══════════ */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                      Booked Dates Manager
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6c2e3e] text-[#fed488] border border-[#b89758]/40">
                      {(draft.calendarAvailability || []).filter((d) => d.status === 'booked').length} Dates Booked
                    </span>
                  </div>
                  <p className="text-xs text-[#dfc3c9] mt-1 max-w-2xl">
                    Add dates that are confirmed for bridal bookings. On your public website, these dates remain welcoming and clickable; when a prospective bride attempts to select a booked date, the site displays a high-converting advisory prompting her to enquire on WhatsApp or call to check if a morning or evening muhurat slot is available!
                  </p>
                </div>
              </div>

              {/* Add Booked Date Form */}
              <form onSubmit={handleAddCalendarDate} className="p-5 rounded-2xl bg-black/50 border border-[#fed488]/40 space-y-4">
                <h4 className="font-['Playfair_Display'] text-lg text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#fed488]" />
                  Add Booked Wedding Date
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Select Wedding Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={newCalendarDate.date}
                      onChange={(e) => setNewCalendarDate({ ...newCalendarDate, date: e.target.value, status: 'booked' })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Status
                    </label>
                    <select
                      value={newCalendarDate.status}
                      onChange={(e) => setNewCalendarDate({ ...newCalendarDate, status: e.target.value as AvailabilityStatus })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488] cursor-pointer"
                    >
                      <option value="booked" className="bg-[#1d0e15] text-rose-300">🔴 Booked (Prompts slot inquiry)</option>
                      <option value="limited" className="bg-[#1d0e15] text-amber-300">🟡 Limited (1 Slot Remaining)</option>
                      <option value="available" className="bg-[#1d0e15] text-emerald-300">🟢 Open (Normal Booking)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Booking Note / Ceremony (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Evening Mandap Booked / Full Day"
                      value={newCalendarDate.note}
                      onChange={(e) => setNewCalendarDate({ ...newCalendarDate, note: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:opacity-95 transition-opacity cursor-pointer border border-[#fed488]/40 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Booked Date</span>
                  </button>
                </div>
              </form>

              {/* Configured Dates List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#fed488] uppercase tracking-wider">
                  Configured Booked Dates ({(draft.calendarAvailability || []).length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(draft.calendarAvailability || []).map((item) => (
                    <div
                      key={item.date}
                      className="p-3.5 rounded-xl border bg-black/40 border-white/15 hover:border-[#fed488]/30 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-semibold text-white">
                            {new Date(item.date + 'T00:00:00').toLocaleDateString('default', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </strong>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                              item.status === 'booked'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        {item.note && <span className="text-[10px] text-[#dfc3c9] block mt-0.5">{item.note}</span>}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCalendarDate(item.date)}
                        className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/80 transition-colors cursor-pointer"
                        title="Remove / Free Up date"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 2: BRAND & CONTACT ══════════ */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                  Brand Identity &amp; Contact
                </h3>
                <p className="text-xs text-[#dfc3c9] mt-1">
                  Changes here immediately update the website header, footer, WhatsApp direct-book links, and social channels.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Business / Studio Name
                  </label>
                  <input
                    type="text"
                    value={draft.brand.name}
                    onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, name: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Founder / Lead Artist Name
                  </label>
                  <input
                    type="text"
                    value={draft.brand.founder}
                    onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, founder: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Phone / WhatsApp Number (Digits only, e.g. 9162143273)
                  </label>
                  <input
                    type="text"
                    value={draft.brand.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      const clean = val.replace(/[^0-9]/g, '');
                      const fullPhone = clean.startsWith('91') && clean.length > 10 ? clean : `91${clean}`;
                      setDraft({
                        ...draft,
                        brand: {
                          ...draft.brand,
                          phone: val,
                          phoneDisplay: clean.length >= 10 ? `+91 ${clean.slice(-10)}` : val,
                          phoneHref: `tel:+${fullPhone}`,
                          whatsappUrl: `https://wa.me/${fullPhone}?text=${encodeURIComponent(`Hello ${draft.brand.founder || 'there'}! ✨ I would like to enquire about booking a makeup session.`)}`,
                        },
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Instagram Handle (e.g. @khushimakeuparts)
                  </label>
                  <input
                    type="text"
                    value={draft.brand.instagram}
                    onChange={(e) => {
                      const val = e.target.value;
                      const clean = val.replace(/^@/, '').trim();
                      setDraft({
                        ...draft,
                        brand: {
                          ...draft.brand,
                          instagram: val,
                          instagramProfileUrl: `https://instagram.com/${clean}`,
                          instagramDmUrl: `https://ig.me/m/${clean}`,
                        },
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Direct WhatsApp Chat Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://wa.me/91XXXXXXXXXX?text=..."
                    value={draft.brand.whatsappUrl}
                    onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, whatsappUrl: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Direct Instagram Message (DM) Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://ig.me/m/your_handle"
                    value={draft.brand.instagramDmUrl}
                    onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, instagramDmUrl: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Instagram Profile URL (Header &amp; Footer Link)
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/your_handle"
                    value={draft.brand.instagramProfileUrl}
                    onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, instagramProfileUrl: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Location &amp; Primary City
                  </label>
                  <input
                    type="text"
                    value={draft.brand.location}
                    onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, location: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Tagline (Shown in Hero)
                  </label>
                  <input
                    type="text"
                    value={draft.brand.tagline}
                    onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, tagline: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Google Maps Studio / Direction Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://maps.google.com/?q=..."
                    value={draft.brand.googleMapsUrl || ''}
                    onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, googleMapsUrl: e.target.value } })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                  />
                  <span className="text-[11px] text-[#dfc3c9]/60 block mt-1">
                    Adds a direct "View Map" link in your footer for brides navigating to your salon.
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                  Home Service Notice
                </label>
                <textarea
                  rows={2}
                  value={draft.brand.homeServiceNotice}
                  onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, homeServiceNotice: e.target.value } })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                />
              </div>

              {/* Top Festive Announcement Bar Settings */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#fed488]" />
                    <h4 className="text-sm font-semibold text-white">Top Festive Announcement Bar</h4>
                  </div>
                  <SlideToggle
                    checked={draft.announcementBar?.enabled !== false}
                    onChange={(val) =>
                      setDraft({
                        ...draft,
                        announcementBar: { ...draft.announcementBar!, enabled: val },
                      })
                    }
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Badge Text (e.g. Special Offer, Festive Deal)
                    </label>
                    <input
                      type="text"
                      value={draft.announcementBar?.badge || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          announcementBar: { ...draft.announcementBar!, badge: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Action Link Text (e.g. Claim Offer, Book Now)
                    </label>
                    <input
                      type="text"
                      value={draft.announcementBar?.linkText || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          announcementBar: { ...draft.announcementBar!, linkText: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Announcement Message
                  </label>
                  <input
                    type="text"
                    value={draft.announcementBar?.text || ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        announcementBar: { ...draft.announcementBar!, text: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Action Link Destination (e.g. #booking-concierge or https://...)
                  </label>
                  <input
                    type="text"
                    value={draft.announcementBar?.linkUrl || ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        announcementBar: { ...draft.announcementBar!, linkUrl: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-xs text-white"
                  />
                </div>
              </div>

              {/* Photos & Logo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-white/15">
                  <img src={draft.brand.logoUrl} alt="Logo" className="w-14 h-14 rounded-full object-cover border border-[#b89758]" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Studio Logo</span>
                    <label className="text-xs text-[#fed488] hover:underline cursor-pointer">
                      Upload New Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => setDraft({ ...draft, brand: { ...draft.brand, logoUrl: url } }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-white/15">
                  <img src={draft.brand.artistPhotoUrl} alt="Artist" className="w-14 h-18 rounded-xl object-cover border border-[#b89758]" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Artist Portrait Photo</span>
                    <label className="text-xs text-[#fed488] hover:underline cursor-pointer">
                      Upload New Portrait
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => setDraft({ ...draft, brand: { ...draft.brand, artistPhotoUrl: url, heroPhotoUrl: url } }))
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 3: ABOUT & PHILOSOPHY ══════════ */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                  Atelier Story &amp; Philosophy
                </h3>
                <p className="text-xs text-[#dfc3c9] mt-1">
                  Customize the biographical section, experience stats, and studio creed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Years of Experience (e.g. 2+, 5+)
                  </label>
                  <input
                    type="text"
                    value={draft.brand.aboutStory?.yearsExperience || '2+'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        brand: {
                          ...draft.brand,
                          aboutStory: { ...draft.brand.aboutStory!, yearsExperience: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Happy Brides / Clients Count (e.g. 50+, 200+)
                  </label>
                  <input
                    type="text"
                    value={draft.brand.aboutStory?.happyClients || '50+'}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        brand: {
                          ...draft.brand,
                          aboutStory: { ...draft.brand.aboutStory!, happyClients: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                  Studio Philosophy Quote
                </label>
                <input
                  type="text"
                  value={draft.brand.philosophy?.quote || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      brand: {
                        ...draft.brand,
                        philosophy: { ...draft.brand.philosophy!, quote: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                  Philosophy Description
                </label>
                <textarea
                  rows={3}
                  value={draft.brand.philosophy?.description || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      brand: {
                        ...draft.brand,
                        philosophy: { ...draft.brand.philosophy!, description: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                  Atelier Story Narrative (Paragraph 1)
                </label>
                <textarea
                  rows={3}
                  value={draft.brand.aboutStory?.paragraph1 || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      brand: {
                        ...draft.brand,
                        aboutStory: { ...draft.brand.aboutStory!, paragraph1: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                  Atelier Story Narrative (Paragraph 2)
                </label>
                <textarea
                  rows={3}
                  value={draft.brand.aboutStory?.paragraph2 || ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      brand: {
                        ...draft.brand,
                        aboutStory: { ...draft.brand.aboutStory!, paragraph2: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white"
                />
              </div>

              {/* Why Choose Us Benefits */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div>
                  <h4 className="font-['Playfair_Display'] text-lg text-white font-medium">
                    Why Choose Us (Signature Highlights)
                  </h4>
                  <p className="text-xs text-[#dfc3c9] mt-0.5">
                    Toggle visibility or customize each of the trust badges shown in the Why Choose Us section.
                  </p>
                </div>

                <div className="space-y-3">
                  {draft.benefits?.map((benefit, idx) => (
                    <div key={benefit.id} className="p-3.5 rounded-xl bg-[#1d0e15] border border-[#b89758]/30 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                        <SlideToggle
                          checked={benefit.hidden !== true}
                          onChange={(visible) => {
                            const list = [...(draft.benefits || [])];
                            list[idx] = { ...list[idx], hidden: !visible };
                            setDraft({ ...draft, benefits: list });
                          }}
                          label={`Benefit #${idx + 1}: ${benefit.title || 'Untitled'}`}
                          sublabel={benefit.hidden ? 'Hidden from public website' : 'Visible to public'}
                          size="sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={benefit.title}
                          onChange={(e) => {
                            const list = [...(draft.benefits || [])];
                            list[idx].title = e.target.value;
                            setDraft({ ...draft, benefits: list });
                          }}
                          placeholder="Benefit Title"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={benefit.description}
                          onChange={(e) => {
                            const list = [...(draft.benefits || [])];
                            list[idx].description = e.target.value;
                            setDraft({ ...draft, benefits: list });
                          }}
                          placeholder="Benefit Description"
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 4: SERVICES & PRICING ══════════ */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                    Bespoke Services &amp; Menu
                  </h3>
                  <p className="text-xs text-[#dfc3c9] mt-1">
                    Edit service titles, prices (e.g. ₹10,000), duration, and package inclusions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newS: ServiceItem = {
                      id: `srv-${Date.now()}`,
                      title: 'New Service',
                      tagline: 'Refined glamour for your celebration',
                      description: 'Customized luxury look for your special day.',
                      price: '₹6,000',
                      priceNum: 6000,
                      duration: '2 Hours',
                      category: 'bridal',
                      iconName: 'sparkles',
                      imageUrl: '',
                      inclusions: ['Skin preparation', 'Hairstyling', 'Draping'],
                    };
                    setDraft({ ...draft, services: [...draft.services, newS] });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6c2e3e] hover:bg-[#7a3b4d] text-white text-xs font-semibold border border-[#b89758]/40 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#fed488]" />
                  Add Service
                </button>
              </div>

              <div className="space-y-4">
                {draft.services.map((service, idx) => (
                  <div key={service.id} className="p-4 rounded-2xl bg-[#1d0e15] border border-[#b89758]/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
                      <SlideToggle
                        checked={service.hidden !== true}
                        onChange={(visible) => {
                          const list = [...draft.services];
                          list[idx] = { ...list[idx], hidden: !visible };
                          setDraft({ ...draft, services: list });
                        }}
                        label={`Service #${idx + 1}: ${service.title || 'Untitled'}`}
                        sublabel={service.hidden ? 'Hidden from public website' : 'Visible to public'}
                        size="sm"
                      />
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${service.title}?`)) {
                            const list = [...draft.services];
                            list.splice(idx, 1);
                            setDraft({ ...draft, services: list });
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/60 self-start sm:self-center transition-colors cursor-pointer"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                          Service Title
                        </label>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => {
                            const list = [...draft.services];
                            list[idx].title = e.target.value;
                            setDraft({ ...draft, services: list });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                          Price Display (e.g. ₹10,000)
                        </label>
                        <input
                          type="text"
                          value={service.price}
                          onChange={(e) => {
                            const list = [...draft.services];
                            list[idx].price = e.target.value;
                            setDraft({ ...draft, services: list });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={service.duration}
                          onChange={(e) => {
                            const list = [...draft.services];
                            list[idx].duration = e.target.value;
                            setDraft({ ...draft, services: list });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                        Short Tagline
                      </label>
                      <input
                        type="text"
                        value={service.tagline}
                        onChange={(e) => {
                          const list = [...draft.services];
                          list[idx].tagline = e.target.value;
                          setDraft({ ...draft, services: list });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                      />
                    </div>

                    {/* Service Icon / Photo Thumbnail & Uploader */}
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#b89758]/50 bg-[#140b0f] flex items-center justify-center relative shadow-inner">
                          {service.imageUrl ? (
                            <img
                              src={service.imageUrl}
                              alt={service.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Sparkles className="w-6 h-6 text-[#fed488]/40" />
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-0.5">
                            Service Photo / Icon
                          </label>
                          <p className="text-[11px] text-[#dfc3c9]/70 leading-tight">
                            Upload a photo (PNG/JPG) or paste an image link to show in menus and booking popups.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <input
                          type="text"
                          placeholder="Paste image link (https://...)"
                          value={service.imageUrl || ''}
                          onChange={(e) => {
                            const list = [...draft.services];
                            list[idx].imageUrl = e.target.value;
                            setDraft({ ...draft, services: list });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/20 text-xs text-white placeholder-zinc-500 w-full sm:w-56"
                        />
                        <label className="px-3 py-1.5 rounded-lg bg-[#b89758]/20 hover:bg-[#b89758]/35 text-[#fed488] border border-[#b89758]/40 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => {
                                const list = [...draft.services];
                                list[idx].imageUrl = url;
                                setDraft({ ...draft, services: list });
                              })
                            }
                          />
                        </label>
                        {service.imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...draft.services];
                              list[idx].imageUrl = '';
                              setDraft({ ...draft, services: list });
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-white/10 text-xs transition-colors shrink-0"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div>
                      <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Inclusions (comma or line separated)
                      </label>
                      <textarea
                        rows={2}
                        value={service.inclusions.join('\n')}
                        onChange={(e) => {
                          const list = [...draft.services];
                          list[idx].inclusions = e.target.value.split('\n').filter((x) => x.trim().length > 0);
                          setDraft({ ...draft, services: list });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB 5: BRIDAL PACKAGES ══════════ */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                  Bridal Packages (Tiers)
                </h3>
                <p className="text-xs text-[#dfc3c9] mt-1">
                  Customize the 3 signature packages (Basic, Recommended Premium, and Luxury Couture).
                </p>
              </div>

              <div className="space-y-4">
                {draft.bridalPackages.map((pkg, idx) => (
                  <div key={pkg.id} className="p-4 rounded-2xl bg-[#1d0e15] border border-[#b89758]/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <SlideToggle
                        checked={pkg.hidden !== true}
                        onChange={(visible) => {
                          const list = [...draft.bridalPackages];
                          list[idx] = { ...list[idx], hidden: !visible };
                          setDraft({ ...draft, bridalPackages: list });
                        }}
                        label={`Tier #${idx + 1}: ${pkg.name || 'Untitled'}`}
                        sublabel={pkg.hidden ? 'Hidden from public website' : 'Visible to public'}
                        size="sm"
                      />
                      {pkg.popular && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fed488]/20 text-[#fed488] border border-[#fed488]/40">
                          Recommended Suite
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                          Package Name
                        </label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => {
                            const list = [...draft.bridalPackages];
                            list[idx].name = e.target.value;
                            setDraft({ ...draft, bridalPackages: list });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                          Tier Label
                        </label>
                        <input
                          type="text"
                          value={pkg.tier}
                          onChange={(e) => {
                            const list = [...draft.bridalPackages];
                            list[idx].tier = e.target.value;
                            setDraft({ ...draft, bridalPackages: list });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                        Features (one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={pkg.features.join('\n')}
                        onChange={(e) => {
                          const list = [...draft.bridalPackages];
                          list[idx].features = e.target.value.split('\n').filter((x) => x.trim().length > 0);
                          setDraft({ ...draft, bridalPackages: list });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB 6: VIDEOS ══════════ */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                      Transformation Video Links
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#fed488]/20 border border-[#fed488]/40 text-[#fed488] text-xs font-mono font-medium">
                      {draft.videos.length} / 20 Videos
                    </span>
                  </div>
                  <p className="text-xs text-[#dfc3c9] mt-1 max-w-xl">
                    Add up to 20 transformation videos. The site automatically selects 8 random videos on every page visit in two stylish tiers (4 + 4), and visitors can shuffle them anytime.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={draft.videos.length >= 20}
                  onClick={() => {
                    if (draft.videos.length >= 20) return;
                    const newVid: VideoShowcaseItem = {
                      id: `video-${Date.now()}`,
                      title: `Transformation Look #${draft.videos.length + 1}`,
                      subtitle: 'Bridal & Party Artistry',
                      tag: 'YouTube Short',
                      duration: '0:35',
                      posterUrl: '',
                      videoUrl: '',
                      description: 'Authentic makeover transformation captured live in Siwan.',
                      hidden: false,
                    };
                    setDraft({ ...draft, videos: [...draft.videos, newVid] });
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all shrink-0 ${
                    draft.videos.length >= 20
                      ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/5'
                      : 'bg-gradient-to-r from-[#fed488] to-[#b89758] text-[#3d2314] font-semibold hover:shadow-lg hover:brightness-110 cursor-pointer active:scale-95'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{draft.videos.length >= 20 ? 'Max 20 Limit Reached' : 'Add New Video'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {draft.videos.map((vid, idx) => (
                  <div key={vid.id} className="p-4 rounded-2xl bg-[#1d0e15] border border-[#b89758]/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <SlideToggle
                        checked={vid.hidden !== true}
                        onChange={(visible) => {
                          const list = [...draft.videos];
                          list[idx] = { ...list[idx], hidden: !visible };
                          setDraft({ ...draft, videos: list });
                        }}
                        label={`Video #${idx + 1}: ${vid.title || 'Untitled'}`}
                        sublabel={vid.hidden ? 'Hidden from public website' : 'Visible to public'}
                        size="sm"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${vid.title || `Video #${idx + 1}`}"?`)) {
                            const list = draft.videos.filter((_, i) => i !== idx);
                            setDraft({ ...draft, videos: list });
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer border border-red-500/20 flex items-center gap-1.5 text-xs font-medium"
                        title="Delete this video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                          Title
                        </label>
                        <input
                          type="text"
                          value={vid.title}
                          onChange={(e) => {
                            const list = [...draft.videos];
                            list[idx].title = e.target.value;
                            setDraft({ ...draft, videos: list });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                          Tag / Subtitle
                        </label>
                        <input
                          type="text"
                          value={vid.subtitle}
                          onChange={(e) => {
                            const list = [...draft.videos];
                            list[idx].subtitle = e.target.value;
                            setDraft({ ...draft, videos: list });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                          Video URL (YouTube Short, YouTube Video, or MP4)
                        </label>
                        {parseYouTubeId(vid.videoUrl) ? (
                          <span className="text-[10px] text-red-400 font-medium flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            <Youtube className="w-3 h-3 text-red-500" /> YouTube Short Detected
                          </span>
                        ) : vid.videoUrl && /instagram\.com\/(?:reel|p|tv)/i.test(vid.videoUrl) ? (
                          <span className="text-[10px] text-pink-400 font-medium flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                            <Instagram className="w-3 h-3" /> Instagram Reel
                          </span>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={vid.videoUrl}
                          placeholder="https://www.youtube.com/shorts/... or https://.../video.mp4"
                          onChange={(e) => {
                            const list = [...draft.videos];
                            list[idx].videoUrl = e.target.value;
                            setDraft({ ...draft, videos: list });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white font-mono placeholder:text-white/30"
                        />
                        {vid.videoUrl && (
                          <a
                            href={vid.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 shrink-0"
                            title="Test / Open Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Test</span>
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-[#dfc3c9]/70 mt-1">
                        Paste any YouTube Short link (e.g. https://www.youtube.com/shorts/5qap5aO4i9A) for seamless automatic playback on your site.
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Cover / Poster Image URL (Optional — leave empty for automatic YouTube thumbnail)
                      </label>
                      <input
                        type="text"
                        value={vid.posterUrl || ''}
                        placeholder="Leave blank for automatic YouTube thumbnail, or paste custom image URL"
                        onChange={(e) => {
                          const list = [...draft.videos];
                          list[idx].posterUrl = e.target.value;
                          setDraft({ ...draft, videos: list });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white font-mono placeholder:text-white/30"
                      />

                      {/* Live Thumbnail Preview & Confirmation */}
                      <div className="flex items-center gap-2 mt-2 p-2 rounded-xl bg-black/30 border border-white/10 text-[11px]">
                        <img
                          src={resolvePosterImage(vid.posterUrl, vid.videoUrl)}
                          alt="Video thumbnail"
                          className="w-10 h-14 object-cover rounded-lg border border-[#b89758]/40 shrink-0"
                        />
                        <div className="flex flex-col text-left">
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {vid.posterUrl && (vid.posterUrl.includes('youtube.com') || vid.posterUrl.includes('youtu.be'))
                              ? 'YouTube link converted to image thumbnail!'
                              : vid.posterUrl && vid.posterUrl.trim()
                              ? 'Using custom cover photo'
                              : 'Automatic YouTube thumbnail active'}
                          </span>
                          <span className="text-[#dfc3c9]/70 text-[10px]">
                            {vid.posterUrl && (vid.posterUrl.includes('youtube.com') || vid.posterUrl.includes('youtu.be'))
                              ? 'You can leave this box empty — YouTube thumbnails are generated automatically!'
                              : 'No need to paste a link here unless you want a custom photo.'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB 7: FAQS ══════════ */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                    Client FAQ Questions &amp; Answers
                  </h3>
                  <p className="text-xs text-[#dfc3c9] mt-1">
                    Edit common questions asked by brides and wedding party clients.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newFaq: FAQItem = {
                      id: `faq-${Date.now()}`,
                      question: 'New Question?',
                      answer: 'Provide clear answer here.',
                    };
                    setDraft({ ...draft, faqs: [...draft.faqs, newFaq] });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6c2e3e] hover:bg-[#7a3b4d] text-white text-xs font-semibold border border-[#b89758]/40 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#fed488]" />
                  Add FAQ
                </button>
              </div>

              <div className="space-y-4">
                {draft.faqs.map((faq, idx) => (
                  <div key={faq.id} className="p-4 rounded-2xl bg-[#1d0e15] border border-[#b89758]/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <SlideToggle
                        checked={faq.hidden !== true}
                        onChange={(visible) => {
                          const list = [...draft.faqs];
                          list[idx] = { ...list[idx], hidden: !visible };
                          setDraft({ ...draft, faqs: list });
                        }}
                        label={`FAQ Question #${idx + 1}`}
                        sublabel={faq.hidden ? 'Hidden from public website' : 'Visible to public'}
                        size="sm"
                      />
                      <button
                        onClick={() => {
                          const list = [...draft.faqs];
                          list.splice(idx, 1);
                          setDraft({ ...draft, faqs: list });
                        }}
                        className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/60 transition-colors cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const list = [...draft.faqs];
                          list[idx].question = e.target.value;
                          setDraft({ ...draft, faqs: list });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block">
                        Answer
                      </label>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => {
                          const list = [...draft.faqs];
                          list[idx].answer = e.target.value;
                          setDraft({ ...draft, faqs: list });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ TAB: SEO & TRACKING ANALYTICS ══════════ */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                    SEO &amp; Tracking Analytics
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#6c2e3e] text-[#fed488] border border-[#b89758]/40">
                    Search &amp; Social
                  </span>
                </div>
                <p className="text-xs text-[#dfc3c9] mt-1 max-w-2xl">
                  Configure Google search rankings, WhatsApp preview link metadata, Google Analytics (GA4), and Meta (Facebook/Instagram) Pixel.
                </p>
              </div>

              {/* Search & WhatsApp Live Preview Card */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/15 space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#fed488] block">
                  WhatsApp &amp; Google Social Preview
                </span>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-md space-y-2">
                  {draft.seo?.ogImageUrl && (
                    <img
                      src={draft.seo.ogImageUrl}
                      alt="OG Preview"
                      className="w-full h-36 object-cover rounded-lg border border-white/10"
                    />
                  )}
                  <div className="text-sm font-semibold text-white truncate">
                    {draft.seo?.siteTitle || draft.brand.name}
                  </div>
                  <div className="text-xs text-[#dfc3c9] line-clamp-2">
                    {draft.seo?.metaDescription || draft.brand.tagline}
                  </div>
                  <div className="text-[10px] text-[#fed488] uppercase tracking-wider">
                    {window.location.hostname}
                  </div>
                </div>
              </div>

              {/* SEO Fields */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/30 border border-white/15">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#fed488]" />
                  Search Engine Optimization (SEO)
                </h4>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Website Title (Browser Tab &amp; Google)
                  </label>
                  <input
                    type="text"
                    value={draft.seo?.siteTitle || ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        seo: { ...draft.seo!, siteTitle: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Meta Description (Shown in Google results &amp; WhatsApp share cards)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.seo?.metaDescription || ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        seo: { ...draft.seo!, metaDescription: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Meta Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={draft.seo?.keywords || ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        seo: { ...draft.seo!, keywords: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                    Social Share Banner Image URL (WhatsApp / Facebook Thumbnail)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={draft.seo?.ogImageUrl || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          seo: { ...draft.seo!, ogImageUrl: e.target.value },
                        })
                      }
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer border border-white/20 shrink-0">
                      Upload Banner
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            setDraft({ ...draft, seo: { ...draft.seo!, ogImageUrl: url } })
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Analytics & Pixel Tracking */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/30 border border-white/15">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#fed488]" />
                  Visitor Tracking &amp; Analytics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Google Analytics 4 (Measurement ID)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. G-XXXXXXXXXX"
                      value={draft.analytics?.googleAnalyticsId || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          analytics: { ...draft.analytics!, googleAnalyticsId: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                    />
                    <span className="text-[11px] text-[#dfc3c9]/60 block mt-1">
                      Enter your Google Analytics G- ID to automatically track visitors.
                    </span>
                  </div>

                  <div>
                    <label className="text-xs text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Meta (Facebook / Instagram) Pixel ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789012345"
                      value={draft.analytics?.metaPixelId || ''}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          analytics: { ...draft.analytics!, metaPixelId: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488]"
                    />
                    <span className="text-[11px] text-[#dfc3c9]/60 block mt-1">
                      Tracks ad conversions and retargets brides on Instagram &amp; Facebook.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 8: CLONE & EXPORT ══════════ */}
          {activeTab === 'export' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium">
                    Turnkey Client Clone &amp; Admin Package Generator
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#fed488]/20 text-[#fed488] border border-[#fed488]/40">
                    Developer Master Tool
                  </span>
                </div>
                <p className="text-xs text-[#dfc3c9] mt-1.5 leading-relaxed">
                  Generate a complete client website and restricted client admin panel in 2 clicks.
                  The client gets full access to edit their salon's photos, prices, services, and slide-toggles, but is strictly locked out of cloning, JSON export/import, and developer tools.
                </p>
              </div>

              {/* Generator Wizard Form */}
              <div className="p-6 rounded-2xl bg-[#1d0e15] border border-[#fed488]/40 space-y-5 shadow-xl">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <Sparkles className="w-5 h-5 text-[#fed488]" />
                  <div>
                    <h4 className="font-['Playfair_Display'] text-base text-white font-semibold">
                      Step 1: Enter New Client Details
                    </h4>
                    <p className="text-[11px] text-[#dfc3c9]">
                      Fill in the new client's salon information and their chosen admin login.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Salon / Studio Brand Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pooja Bridal Makeovers"
                      value={newClientData.salonName}
                      onChange={(e) => setNewClientData({ ...newClientData, salonName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/30 focus:border-[#fed488] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Artist / Founder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pooja Sharma"
                      value={newClientData.founderName}
                      onChange={(e) => setNewClientData({ ...newClientData, founderName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/30 focus:border-[#fed488] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      City / Service Area
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patna, Bihar"
                      value={newClientData.location}
                      onChange={(e) => setNewClientData({ ...newClientData, location: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/30 focus:border-[#fed488] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={newClientData.phone}
                      onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/30 focus:border-[#fed488] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. @pooja_makeovers"
                      value={newClientData.instagram}
                      onChange={(e) => setNewClientData({ ...newClientData, instagram: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/30 focus:border-[#fed488] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Client Admin Login Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. pooja@poojamakeovers.com"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/30 focus:border-[#fed488] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1">
                      Client Admin Login Password
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. pooja2026"
                      value={newClientData.password}
                      onChange={(e) => setNewClientData({ ...newClientData, password: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white placeholder-white/30 focus:border-[#fed488] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Actions & Code Generation */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownloadClientCloneJson}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer border border-[#fed488]/40"
                  >
                    <Download className="w-4 h-4 text-[#fed488]" />
                    Download {newClientData.salonName.trim() || 'Client'}_siteContent.json
                  </button>
                </div>

                {/* Step 2: Copy adminCredentials.ts snippet */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-['Playfair_Display'] text-sm text-white font-medium">
                        Step 2: Copy Role-Restricted Credentials for src/config/adminCredentials.ts
                      </h4>
                      <p className="text-[11px] text-[#dfc3c9]">
                        Client has role: &apos;client&apos; (editing only). Developer master access is preserved.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCredentialsSnippet);
                        setCopiedCredentials(true);
                        setTimeout(() => setCopiedCredentials(false), 3000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 cursor-pointer"
                    >
                      {copiedCredentials ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#fed488]" />
                          <span>Copy Credentials</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-[#fed488] overflow-x-auto max-h-44">
                    {generatedCredentialsSnippet}
                  </pre>
                </div>

                {/* Step 3: Quick Deployment Instructions */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#fed488]">
                    Step 3: 100% Pure Client Deployment (Zero Clone Code)
                  </span>
                  <div className="space-y-2 text-[#dfc3c9]">
                    <p className="font-semibold text-white">Choose either Option A or Option B:</p>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-emerald-500/30">
                      <span className="text-emerald-300 font-bold block mb-1">Option A (Automated 1-Command Clone):</span>
                      <p>Run in terminal: <code className="text-white font-mono bg-black/60 px-1 py-0.5 rounded">npm run clone-client</code></p>
                      <p className="text-[11px] text-[#dfc3c9]/80 mt-1">This creates a clean client folder, automatically removes all developer tools, and configures the client credentials with 0 bytes of cloning code.</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/20">
                      <span className="text-[#fed488] font-bold block mb-1">Option B (Manual Folder Copy):</span>
                      <ol className="list-decimal list-inside space-y-1 text-[11px]">
                        <li>Copy this project folder for your client.</li>
                        <li>In the copied folder, run: <code className="text-white font-mono bg-black/60 px-1 py-0.5 rounded">npm run make-client</code> (instantly strips all clone &amp; export code).</li>
                        <li>Paste client credentials into <code className="text-white font-mono bg-black/60 px-1 py-0.5 rounded">src/config/adminCredentials.ts</code>.</li>
                      </ol>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-300 mt-2">
                    ✓ <strong>Security Verified</strong>: In both methods, the client's codebase and built files will have <strong>ZERO</strong> cloning, export, or reset code!
                  </p>
                </div>
              </div>

              {/* Standard Backup & Restore Tools */}
              <div className="pt-4">
                <h4 className="font-['Playfair_Display'] text-lg text-white font-medium mb-3">
                  Current Site Backup &amp; Restore
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-[#1d0e15] border border-[#b89758]/30 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-[#6c2e3e] flex items-center justify-center text-[#fed488] mb-3">
                        <Download className="w-5 h-5" />
                      </div>
                      <h4 className="font-['Playfair_Display'] text-lg text-white font-medium">
                        Export Current Site Configuration
                      </h4>
                      <p className="text-xs text-[#dfc3c9] leading-relaxed">
                        Downloads all customized names, prices, photo links, section visibility toggles, WhatsApp credentials, and FAQ items as a single file.
                      </p>
                    </div>
                    <button
                      onClick={downloadConfigJson}
                      className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md cursor-pointer border border-[#fed488]/40"
                    >
                      <Download className="w-4 h-4 text-[#fed488]" />
                      Download site_config.json
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#1d0e15] border border-[#b89758]/30 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-[#6c2e3e] flex items-center justify-center text-[#fed488] mb-3">
                        <Upload className="w-5 h-5" />
                      </div>
                      <h4 className="font-['Playfair_Display'] text-lg text-white font-medium">
                        Import Configuration for New Client
                      </h4>
                      <p className="text-xs text-[#dfc3c9] leading-relaxed">
                        Upload a previously exported config JSON to immediately transform this website for another salon or beauty artisan.
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={jsonImportRef}
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleJsonImport}
                      />
                      <button
                        onClick={() => jsonImportRef.current?.click()}
                        className="mt-6 w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20"
                      >
                        <Upload className="w-4 h-4 text-[#fed488]" />
                        Import site_config.json
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Floating Quick Save Button in bottom-right */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer border shadow-2xl hover:scale-105 active:scale-95 ${
              justSaved
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/50'
                : 'bg-gradient-to-r from-[#6c2e3e] via-[#8e384e] to-[#b89758] text-white border-[#fed488]/50 shadow-[#6c2e3e]/60 hover:border-[#fed488]'
            }`}
            title="Save changes to live site"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Saved &amp; Published! ✓</span>
              </>
            ) : isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#fed488]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* ══════════ MODAL: ADD NEW CLIENT WEBSITE ══════════ */}
        {showAddClientModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#1d0e15] border border-[#fed488]/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-[#fcecee] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center text-[#fed488] shadow-md">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-['Playfair_Display'] text-xl text-white font-medium">
                      Provision New Client Website
                    </h3>
                    <p className="text-xs text-[#dfc3c9]">
                      Instantly generates a live branded website using your unified engine.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewClient} className="space-y-4">
                {/* Archetype Blueprint Preset Selection */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#fed488] mb-1.5">
                    Business Archetype Blueprint *
                  </label>
                  <select
                    value={newClientForm.archetype}
                    onChange={(e) => setNewClientForm({ ...newClientForm, archetype: e.target.value as BusinessArchetype })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#140b0f] border border-[#fed488]/50 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="solo_mua" className="bg-[#190c13] text-white">
                      1. Solo Makeup Artist (Bridal Focus, Muhurat Dates, Doorstep Vanity)
                    </option>
                    <option value="hair_salon" className="bg-[#190c13] text-white">
                      2. Hair &amp; Beauty Salon (Haircuts, Stylists, Time-Slot Engine)
                    </option>
                    <option value="beauty_parlour" className="bg-[#190c13] text-white">
                      3. Beauty Parlour &amp; Aesthetics (Facials, Skin Treatments, Shifts)
                    </option>
                    <option value="hybrid_atelier" className="bg-[#190c13] text-white">
                      4. Hybrid Luxury Atelier &amp; Salon (All-in-One Bridal + Salon Suites)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#fed488] mb-1.5">
                      Salon / Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pooja Makeovers & Academy"
                      value={newClientForm.name}
                      onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140b0f] border border-white/20 focus:border-[#b89758] text-xs text-white placeholder-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#fed488] mb-1.5">
                      Founder / Lead Artist *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pooja Sharma"
                      value={newClientForm.founder}
                      onChange={(e) => setNewClientForm({ ...newClientForm, founder: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140b0f] border border-white/20 focus:border-[#b89758] text-xs text-white placeholder-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#fed488] mb-1.5">
                      City &amp; Region *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Patna, Bihar"
                      value={newClientForm.city}
                      onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140b0f] border border-white/20 focus:border-[#b89758] text-xs text-white placeholder-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#fed488] mb-1.5">
                      WhatsApp Phone *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={newClientForm.phone}
                      onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140b0f] border border-white/20 focus:border-[#b89758] text-xs text-white placeholder-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#fed488] mb-1.5">
                      Instagram Handle *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. @pooja_makeovers"
                      value={newClientForm.instagram}
                      onChange={(e) => setNewClientForm({ ...newClientForm, instagram: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140b0f] border border-white/20 focus:border-[#b89758] text-xs text-white placeholder-white/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#fed488] mb-1.5">
                      Custom Domain (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. poojamakeovers.com"
                      value={newClientForm.customDomain}
                      onChange={(e) => setNewClientForm({ ...newClientForm, customDomain: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140b0f] border border-white/20 focus:border-[#b89758] text-xs text-white placeholder-white/30 outline-none"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#140b0f] border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#fed488] shrink-0 mt-0.5" />
                  <p>
                    <strong>Instant Live Setup:</strong> Creates an isolated tenant document in Firestore <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">clients/{newClientForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'slug'}</code> and provides an instant live URL <code className="text-white bg-black/40 px-1 py-0.5 rounded font-mono">?client=&lt;slug&gt;</code> without any code rebuilds.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddClientModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingClient}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] hover:opacity-95 active:scale-95 text-white text-xs font-semibold uppercase tracking-wider border border-[#fed488]/50 shadow-lg shadow-[#6c2e3e]/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingClient ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Website...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-[#fed488]" />
                        <span>Create Live Website Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════ MODAL: BROADCAST / SYNC TO ALL CLIENT WEBSITES ══════════ */}
        {showSyncModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#1d0e15] border border-[#fed488]/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 text-[#fcecee] animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-900 to-[#b89758] flex items-center justify-center text-[#fed488] shadow-md">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-['Playfair_Display'] text-xl text-white font-medium">
                      Sync Main Site Updates to All Clients
                    </h3>
                    <p className="text-xs text-[#dfc3c9]">
                      Broadcast your latest design, pricing, and content changes to {clientsList.filter(c => c.id !== 'khushi').length} client website(s).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Protected Identity Notice */}
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Client Identity Guarantee:</strong> Each client's unique Salon Name, Founder, Location, Phone, WhatsApp, and Instagram links are <strong>100% protected</strong> and will NOT be overwritten.
                </p>
              </div>

              {/* Client Pricing Protection Guard */}
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-between gap-3 shadow-inner">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#fed488] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Preserve Client Custom Pricing (Active by Default)
                  </span>
                  <p className="text-[11px] text-[#dfc3c9] leading-relaxed">
                    Protects each salon's customized makeup charges. When enabled, service titles, descriptions, and inclusions are updated, but their existing prices remain untouched.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={syncModules.preserveClientPricing}
                    onChange={(e) => setSyncModules({ ...syncModules, preserveClientPricing: e.target.checked })}
                    className="w-5 h-5 rounded accent-[#b89758] cursor-pointer"
                  />
                </label>
              </div>

              {/* Modules to Sync Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#fed488]">
                    Choose Modules to Synchronize:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const moduleKeys: (keyof typeof syncModules)[] = [
                        'services',
                        'bridalPackages',
                        'portfolio',
                        'videos',
                        'faqs',
                        'sectionsVisibility',
                        'announcementBar',
                        'benefits',
                        'testimonials',
                      ];
                      const allTrue = moduleKeys.every((k) => syncModules[k]);
                      setSyncModules({
                        ...syncModules,
                        services: !allTrue,
                        bridalPackages: !allTrue,
                        portfolio: !allTrue,
                        videos: !allTrue,
                        faqs: !allTrue,
                        sectionsVisibility: !allTrue,
                        announcementBar: !allTrue,
                        benefits: !allTrue,
                        testimonials: !allTrue,
                      });
                    }}
                    className="text-[11px] text-[#fed488] hover:underline cursor-pointer"
                  >
                    {[
                      'services',
                      'bridalPackages',
                      'portfolio',
                      'videos',
                      'faqs',
                      'sectionsVisibility',
                      'announcementBar',
                      'benefits',
                      'testimonials',
                    ].every((k) => (syncModules as any)[k])
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  <label className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={syncModules.services}
                        onChange={(e) => setSyncModules({ ...syncModules, services: e.target.checked })}
                        className="rounded accent-[#b89758]"
                      />
                      <span>Services &amp; Bespoke Pricing</span>
                    </div>
                    {syncModules.preserveClientPricing && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-medium whitespace-nowrap">
                        Rates Kept 🛡️
                      </span>
                    )}
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={syncModules.bridalPackages}
                      onChange={(e) => setSyncModules({ ...syncModules, bridalPackages: e.target.checked })}
                      className="rounded accent-[#b89758]"
                    />
                    <span>Bridal Packages</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={syncModules.portfolio}
                      onChange={(e) => setSyncModules({ ...syncModules, portfolio: e.target.checked })}
                      className="rounded accent-[#b89758]"
                    />
                    <span>Portfolio Galleries &amp; Photos</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={syncModules.videos}
                      onChange={(e) => setSyncModules({ ...syncModules, videos: e.target.checked })}
                      className="rounded accent-[#b89758]"
                    />
                    <span>Transformation Videos</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={syncModules.faqs}
                      onChange={(e) => setSyncModules({ ...syncModules, faqs: e.target.checked })}
                      className="rounded accent-[#b89758]"
                    />
                    <span>Client FAQs</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={syncModules.sectionsVisibility}
                      onChange={(e) => setSyncModules({ ...syncModules, sectionsVisibility: e.target.checked })}
                      className="rounded accent-[#b89758]"
                    />
                    <span>Page Sections Visibility Toggles</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={syncModules.announcementBar}
                      onChange={(e) => setSyncModules({ ...syncModules, announcementBar: e.target.checked })}
                      className="rounded accent-[#b89758]"
                    />
                    <span>Announcement / Offer Bar</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={syncModules.benefits}
                      onChange={(e) => setSyncModules({ ...syncModules, benefits: e.target.checked })}
                      className="rounded accent-[#b89758]"
                    />
                    <span>Why Choose Us Benefits</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#140b0f] border border-white/10 hover:border-[#b89758]/40 cursor-pointer transition-colors text-xs">
                    <input
                      type="checkbox"
                      checked={syncModules.testimonials}
                      onChange={(e) => setSyncModules({ ...syncModules, testimonials: e.target.checked })}
                      className="rounded accent-[#b89758]"
                    />
                    <span>Bride Reviews &amp; Testimonials</span>
                  </label>
                </div>
              </div>

              {/* Target Clients List */}
              <div className="p-3 rounded-xl bg-[#140b0f] border border-white/10 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#dfc3c9]">
                  Target Client Websites ({clientsList.filter(c => c.id !== 'khushi').length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {clientsList.filter(c => c.id !== 'khushi').map(c => (
                    <span key={c.id} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium">
                      {c.name} ({c.city})
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleSyncToAllClients}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 via-[#6c2e3e] to-[#b89758] hover:opacity-95 text-white text-xs font-semibold uppercase tracking-wider border border-[#fed488]/50 shadow-lg shadow-purple-900/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Syncing Across All Sites...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#fed488]" />
                      <span>Sync to All {clientsList.filter(c => c.id !== 'khushi').length} Sites Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Interactive Preview for Announcement / Offer Popup */}
      <OfferPopupModal
        isOpenOverride={showPopupPreview}
        onCloseOverride={() => setShowPopupPreview(false)}
        config={draft.offerPopup || DEFAULT_OFFER_POPUP}
      />
    </div>
  );
};
