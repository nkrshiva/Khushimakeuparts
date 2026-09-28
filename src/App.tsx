import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider, useTenant } from './context/TenantContext';
import { ContentProvider, useSiteContent } from './context/ContentContext';
import { authorizationService } from './services/auth/AuthorizationService';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IntroPhilosophy } from './components/IntroPhilosophy';
import { Services } from './components/Services';
import { Portfolio } from './components/Portfolio';
import { VideoShowcase } from './components/VideoShowcase';
import { WhyKhushi } from './components/WhyKhushi';
import { AboutKhushi } from './components/AboutKhushi';
import { BridalPackages } from './components/BridalPackages';
import { BookingSystem, BookingSelection } from './components/BookingSystem';
import { FAQ } from './components/FAQ';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Testimonials } from './components/Testimonials';
import { AdminPanel } from './components/AdminPanel';
import { MasterAdminPanel } from './components/MasterAdminPanel';

import { MovingBackground } from './components/MovingBackground';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { DateAvailabilityCalendar } from './components/DateAvailabilityCalendar';
import { OfferPopupModal } from './components/OfferPopupModal';
import { DEFAULT_SECTIONS_VISIBILITY } from './data/siteContent';
import { Instagram } from 'lucide-react';
import { UniversalPlatformLanding } from './components/platform/UniversalPlatformLanding';
import { TenantNotFound } from './components/tenant/TenantNotFound';
import { UniversalLoginModal } from './components/auth/UniversalLoginModal';
import { NoWorkspaceModal } from './components/auth/NoWorkspaceModal';
import { EmailVerificationModal } from './components/auth/EmailVerificationModal';
import { InvitationAcceptanceModal } from './components/auth/InvitationAcceptanceModal';
import { EmployeeWorkspaceModal } from './components/employee/EmployeeWorkspaceModal';
import type { IdentityResolutionResult, NoWorkspaceReason } from './domain/identity/types';

interface MainWebsiteProps {
  onOpenLogin: () => void;
  onOpenAdminPanel: () => void;
}

function MainWebsite({ onOpenLogin, onOpenAdminPanel }: MainWebsiteProps) {
  const { content, activeClientId, setActiveClientId, clientsList, isModuleEnabled } = useSiteContent();
  const { brand } = content;
  const sections = content.sectionsVisibility || DEFAULT_SECTIONS_VISIBILITY;
  const { user } = useAuth();
  const { role, isDeveloper } = useTenant();

  const currentTenantMeta = clientsList.find((c) => c.id === activeClientId);
  const isTenantDisabled = Boolean(
    currentTenantMeta && (currentTenantMeta.status === 'suspended' || currentTenantMeta.active === false)
  );

  const [bookingSelection, setBookingSelection] = useState<BookingSelection | null>({
    type: 'service',
    id: 'bridal',
  });


  // Dynamic SEO & Meta tags
  useEffect(() => {
    if (content.seo?.siteTitle) {
      document.title = content.seo.siteTitle;
    } else if (brand.name) {
      document.title = `${brand.name} | Luxury Bridal Makeup & Occasion Styling`;
    }
    const updateMeta = (name: string, contentVal: string, isProperty = false) => {
      if (!contentVal) return;
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', contentVal);
    };

    if (content.seo?.metaDescription) {
      updateMeta('description', content.seo.metaDescription);
      updateMeta('og:description', content.seo.metaDescription, true);
    }
    if (content.seo?.siteTitle) {
      updateMeta('og:title', content.seo.siteTitle, true);
    }
    if (content.seo?.ogImageUrl) {
      updateMeta('og:image', content.seo.ogImageUrl, true);
    }
    if (content.seo?.keywords) {
      updateMeta('keywords', content.seo.keywords);
    }
  }, [content.seo]);

  // Analytics Injection (Google Analytics & Meta Pixel)
  useEffect(() => {
    const gaId = content.analytics?.googleAnalyticsId?.trim();
    if (gaId && !document.getElementById('ga-script')) {
      const script1 = document.createElement('script');
      script1.id = 'ga-script';
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.id = 'ga-init';
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);
    }

    const pixelId = content.analytics?.metaPixelId?.trim();
    if (pixelId && !document.getElementById('fb-pixel')) {
      const script = document.createElement('script');
      script.id = 'fb-pixel';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }
  }, [content.analytics]);

  const handleOpenAdminPortal = () => {
    if (authorizationService.canAccessAdminPanel(role)) {
      onOpenAdminPanel();
    } else {
      onOpenLogin();
    }
  };

  const scrollToSection = (id: string) => {
    if (id === 'root') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookService = (serviceId: string) => {
    setBookingSelection({ type: 'service', id: serviceId });
    scrollToSection('booking-concierge');
  };

  const handleAskPackage = (packageId: string) => {
    setBookingSelection({ type: 'package', id: packageId });
    scrollToSection('booking-concierge');
  };

  const handleGeneralBook = () => {
    setBookingSelection({ type: 'service', id: 'bridal' });
    scrollToSection('booking-concierge');
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isTenantDisabled && !authorizationService.canAccessAdminPanel(role)) {
    return (
      <div className="min-h-screen bg-[#12090d] text-[#fcecee] flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans'] relative overflow-hidden">
        <MovingBackground veilOpacity={0.85} />
        <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-[#1d0e15]/90 border border-[#b89758]/40 shadow-2xl backdrop-blur-md space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center text-white shadow-lg shadow-[#6c2e3e]/50">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="font-['Playfair_Display'] text-2xl text-white font-medium">
            {brand.name || 'Salon Studio'}
          </h1>
          <p className="text-xs text-[#dfc3c9] leading-relaxed">
            This salon website is currently offline or undergoing scheduled maintenance. Please reach out to the salon directly for enquiries and bookings.
          </p>
          {brand.phone && (
            <div className="pt-2">
              <a
                href={brand.whatsappUrl || `tel:${brand.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:opacity-95 transition-opacity"
              >
                Contact on WhatsApp ({brand.phoneDisplay || brand.phone})
              </a>
            </div>
          )}
          <div className="pt-4 border-t border-white/10 text-[10px] text-zinc-500">
            Powered by Atelier Beauty SaaS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7ecee] dark:bg-[#12090d] text-[#25181c] dark:text-[#fcecee] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#6c2e3e] selection:text-white transition-colors duration-300 relative">
      {/* Inactive Client Website Admin Preview Notice */}
      {isTenantDisabled && (
        <div className="relative z-30 bg-amber-950/95 text-amber-200 border-b border-amber-500/50 px-4 py-2.5 text-xs flex items-center justify-center gap-2 text-center">
          <span>⚠️ <strong>Admin Preview Notice:</strong> This client website ({currentTenantMeta?.name}) is currently set to INACTIVE in the SaaS Manager. Public visitors see an offline maintenance notice.</span>
        </div>
      )}

      {/* Moving Luxury Background (Silk Waves + Floating Golden Dust + Bokeh) */}
      <MovingBackground veilOpacity={0.80} />

      {/* Top Announcement Bar (Festival / Seasonal Offers) */}
      <div className="relative z-10">
        <AnnouncementBar />
      </div>

      {/* Navigation Header */}
      <div className="relative z-20">
        <Header
          onBookClick={handleGeneralBook}
          onNavigateToBooking={handleGeneralBook}
          onNavigate={scrollToSection}
        />
      </div>

      <main className="flex-1 w-full flex flex-col relative z-10">
        {/* Section 1: Hero */}
        {sections.hero !== false && (
          <Hero
            onBookClick={handleGeneralBook}
            onPortfolioClick={() => scrollToSection('lookbook-portfolio')}
          />
        )}

        {/* Section 2: Intro & Philosophy */}
        {sections.philosophy !== false && <IntroPhilosophy />}

        {/* Section 3: Curated Asymmetric Editorial Portfolio & Lightbox */}
        {sections.portfolio !== false && isModuleEnabled('bridalPortfolio') && <Portfolio />}

        {/* Section 3.5: Interactive Before & After Glam Slider */}
        {sections.beforeAfter !== false && isModuleEnabled('beforeAfterGallery') && <BeforeAfterSlider />}

        {/* Section 4: Video Showcase ("See the Transformation") */}
        {sections.videos !== false && isModuleEnabled('videoShowcase') && <VideoShowcase />}

        {/* Section 5: Real Brides Testimonials & Reviews */}
        {sections.testimonials !== false && isModuleEnabled('reviewsModeration') && <Testimonials />}

        {/* Section 6: Philosophy In Practice / Why Choose Khushi */}
        {sections.whyChooseUs !== false && <WhyKhushi />}

        {/* Section 7: Bespoke Services & Pricing (Artisanal Menu) */}
        {sections.services !== false && <Services onBookService={handleBookService} />}

        {/* Section 8: About Story */}
        {sections.aboutStory !== false && <AboutKhushi />}

        {/* Section 9: Bridal Packages */}
        {sections.bridalPackages !== false && isModuleEnabled('bridalPackages') && <BridalPackages onAskPackage={handleAskPackage} />}

        {/* Section 9.5: Live Wedding Date Availability Calendar */}
        {sections.dateAvailabilityCalendar !== false && isModuleEnabled('muaMuhuratCalendar') && (
          <DateAvailabilityCalendar
            onSelectDate={(dateStr) => {
              setBookingSelection({
                type: 'service',
                id: 'bridal',
                initialDate: dateStr,
              });
              scrollToSection('booking-concierge');
            }}
          />
        )}

        {/* Section 10: Contact / Booking — WhatsApp & Instagram DM */}
        {sections.bookingForm !== false && <BookingSystem selection={bookingSelection} />}

        {/* Section 11: Animated FAQ Accordion */}
        {sections.faqs !== false && <FAQ />}

        {/* Section 12: Final Call-to-Action */}
        {sections.finalCta !== false && <FinalCta onEnquireClick={handleGeneralBook} />}
      </main>

      {/* Production Footer */}
      <Footer
        onScrollToTop={handleScrollToTop}
        onNavigateSection={scrollToSection}
      />

      {/* Floating Quick Contact Bar — mobile only */}
      {sections.quickContactBar !== false && (
        <aside
          aria-label="Quick contact options"
          className="fixed bottom-4 right-4 z-40 flex flex-col gap-2.5 items-end sm:hidden"
        >
          <a
            href={brand.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#25d366] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.853L.054 23.625a.75.75 0 00.921.921l5.772-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.506-5.23-1.388l-.374-.22-3.876.993.993-3.875-.22-.374A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </a>
          <a
            href={brand.instagramDmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-lg border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Instagram DM"
          >
            <Instagram className="w-5 h-5 text-white" />
          </a>
        </aside>
      )}

      {/* Ongoing Offer & Announcement Popup Modal */}
      {sections.offerPopup !== false && isModuleEnabled('offerPopup') && content.offerPopup?.enabled !== false && (
        <OfferPopupModal
          config={content.offerPopup}
          onNavigateToBooking={handleGeneralBook}
        />
      )}

    </div>
  );
}

function AppShell() {
  const { user } = useAuth();
  const { role, isDeveloper, identity, refreshTenant } = useTenant();
  const { activeClientId, setActiveClientId, isUnknownTenant, tenantResolution } = useSiteContent();

  // Active view: 'platform' | 'storefront'
  const [currentView, setCurrentView] = useState<'platform' | 'storefront'>(() => {
    if (typeof window === 'undefined') return 'storefront';
    if (tenantResolution?.isPlatform) return 'platform';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (path === '/platform' || hash === '#platform' || hash === '#portal' || search.includes('view=platform')) {
      return 'platform';
    }
    return 'storefront';
  });

  // Admin & Universal Authentication State
  const [isUniversalLoginOpen, setIsUniversalLoginOpen] = useState(false);
  const [isMasterAdminOpen, setIsMasterAdminOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isEmployeeWorkspaceOpen, setIsEmployeeWorkspaceOpen] = useState(false);
  const [employeeWorkspaceData, setEmployeeWorkspaceData] = useState<{
    tenantId: string;
    employeeId?: string;
    permissions?: string[];
  }>({ tenantId: '' });

  const [isNoWorkspaceOpen, setIsNoWorkspaceOpen] = useState(false);
  const [noWorkspaceData, setNoWorkspaceData] = useState<{
    reason: NoWorkspaceReason;
    tenantId?: string | null;
    userEmail?: string | null;
  }>({ reason: 'UNASSIGNED' });

  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [emailVerificationEmail, setEmailVerificationEmail] = useState('');

  // Tenant Onboarding Invitation State
  const [invitationData, setInvitationData] = useState<{
    invitationId: string;
    token: string;
    clientIdHint?: string;
  } | null>(null);

  // Check URL query parameters on mount and history changes for ?inviteId=...&token=...
  useEffect(() => {
    const handleCheckInvitationParams = () => {
      try {
        const search = window.location.search;
        if (!search) return;
        const params = new URLSearchParams(search);
        const inviteId = params.get('inviteId');
        const token = params.get('token');
        const clientHint = params.get('client') || undefined;

        if (inviteId && token) {
          setInvitationData({
            invitationId: inviteId.trim(),
            token: token.trim(),
            clientIdHint: clientHint?.trim(),
          });
        }
      } catch (e) {
        console.warn('Error reading invitation params:', e);
      }
    };

    handleCheckInvitationParams();
    window.addEventListener('popstate', handleCheckInvitationParams);
    return () => window.removeEventListener('popstate', handleCheckInvitationParams);
  }, []);

  const handleInvitationAccepted = async (tenantId: string) => {
    setInvitationData(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('inviteId');
      url.searchParams.delete('token');
      if (tenantResolution?.source === 'development' || tenantResolution?.isPlatform) {
        url.searchParams.set('client', tenantId);
      } else {
        url.searchParams.delete('client');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {}

    // Await authoritative tenant context resolution from /users/{uid}
    try {
      const resolved = await refreshTenant();
      console.log(`[Invitation Flow] Tenant state refreshed for tenant: ${tenantId}, assignedClientId: ${resolved.assignedClientId}, role: ${resolved.role}`);
    } catch (err) {
      console.warn('[Invitation Flow] Error refreshing tenant state post-acceptance:', err);
    }

    setActiveClientId(tenantId);
    setIsAdminPanelOpen(true);
  };

  const cleanAdminHash = () => {
    const hash = window.location.hash.toLowerCase();
    if (
      hash === '#masteradmin' ||
      hash === '#myadminpanel' ||
      hash === '#admin' ||
      hash === '#employee' ||
      hash === '#no-workspace' ||
      hash === '#verify-email'
    ) {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {}
    }
  };

  const handleUniversalLoginSuccess = (resolution: IdentityResolutionResult) => {
    setIsUniversalLoginOpen(false);
    const { identity: resIdentity, destination } = resolution;
    switch (destination) {
      case 'MASTER_ADMIN':
        setIsMasterAdminOpen(true);
        break;
      case 'TENANT_ADMIN':
        if (resIdentity.type === 'TENANT_OWNER' && resIdentity.tenantId) {
          setActiveClientId(resIdentity.tenantId);
        }
        setIsAdminPanelOpen(true);
        break;
      case 'EMPLOYEE_WORKSPACE':
        if (resIdentity.type === 'TENANT_EMPLOYEE') {
          setEmployeeWorkspaceData({
            tenantId: resIdentity.tenantId || activeClientId,
            employeeId: resIdentity.employeeId,
            permissions: resIdentity.permissions,
          });
        }
        setIsEmployeeWorkspaceOpen(true);
        break;
      case 'NO_WORKSPACE':
        if (resIdentity.type === 'NO_WORKSPACE') {
          setNoWorkspaceData({
            reason: resIdentity.reason || 'UNASSIGNED',
            tenantId: resIdentity.tenantId,
            userEmail: resIdentity.email,
          });
        } else {
          setNoWorkspaceData({
            reason: 'UNASSIGNED',
            userEmail: user?.email,
          });
        }
        setIsNoWorkspaceOpen(true);
        break;
      case 'EMAIL_VERIFICATION':
        setEmailVerificationEmail(('email' in resIdentity && resIdentity.email) || user?.email || '');
        setIsEmailVerificationOpen(true);
        break;
      default:
        setIsAdminPanelOpen(true);
        break;
    }
  };

  // Route handling for #masteradmin, #admin / #myadminpanel, #employee, #no-workspace, #verify-email
  useEffect(() => {
    const handleCheckAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#masteradmin') {
        if (authorizationService.canAccessMasterAdmin(role, user?.email)) {
          setIsMasterAdminOpen(true);
        } else {
          setIsUniversalLoginOpen(true);
        }
      } else if (hash === '#myadminpanel' || hash === '#admin') {
        if (authorizationService.canAccessAdminPanel(role)) {
          setIsAdminPanelOpen(true);
        } else {
          setIsUniversalLoginOpen(true);
        }
      } else if (hash === '#employee') {
        if (authorizationService.canAccessEmployeeWorkspace(role, identity.type)) {
          if (identity.type === 'TENANT_EMPLOYEE') {
            setEmployeeWorkspaceData({
              tenantId: identity.tenantId || activeClientId,
              employeeId: identity.employeeId,
              permissions: identity.permissions,
            });
          } else if (role === 'developer' || role === 'client') {
            setEmployeeWorkspaceData({
              tenantId: activeClientId,
              employeeId: user?.uid,
              permissions: ['admin_all', 'view_schedule', 'manage_appointments', 'view_customer_pii'],
            });
          }
          setIsEmployeeWorkspaceOpen(true);
        } else {
          setIsUniversalLoginOpen(true);
        }
      } else if (hash === '#no-workspace') {
        if (identity.type === 'NO_WORKSPACE') {
          setNoWorkspaceData({
            reason: identity.reason || 'UNASSIGNED',
            tenantId: identity.tenantId,
            userEmail: identity.email,
          });
          setIsNoWorkspaceOpen(true);
        }
      } else if (hash === '#verify-email') {
        if (user && !user.emailVerified) {
          setEmailVerificationEmail(user.email || '');
          setIsEmailVerificationOpen(true);
        }
      }
    };

    handleCheckAdminRoute();
    window.addEventListener('hashchange', handleCheckAdminRoute);
    return () => window.removeEventListener('hashchange', handleCheckAdminRoute);
  }, [user, isDeveloper, role, identity, activeClientId]);

  // Keyboard shortcut: Ctrl + Alt + A to open admin (strictly for authorized tenant owners or developer)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (authorizationService.canAccessAdminPanel(role)) {
          setIsAdminPanelOpen((prev) => !prev);
        } else {
          setIsUniversalLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [role]);

  // Route listener for Platform View vs Storefront View
  useEffect(() => {
    const handleLocationChange = () => {
      if (tenantResolution?.isPlatform) {
        setCurrentView('platform');
        return;
      }
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path === '/platform' || hash === '#platform' || hash === '#portal' || search.includes('view=platform')) {
        setCurrentView('platform');
      } else if (hash === '#storefront' || hash === '' || path === '/') {
        if (hash !== '#masteradmin' && hash !== '#myadminpanel' && hash !== '#admin') {
          setCurrentView('storefront');
        }
      }
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [tenantResolution?.isPlatform]);

  const navigateToStorefront = () => {
    try {
      if (window.location.hash === '#platform' || window.location.hash === '#portal') {
        history.replaceState(null, '', window.location.pathname + window.location.search.replace('view=platform', ''));
      }
    } catch {}
    setCurrentView('storefront');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isUnknownTenant && currentView !== 'platform' ? (
        <TenantNotFound
          hostname={typeof window !== 'undefined' ? window.location.hostname : ''}
          onOpenPlatform={() => setCurrentView('platform')}
          onOpenLogin={() => setIsUniversalLoginOpen(true)}
        />
      ) : currentView === 'platform' || Boolean(invitationData) || tenantResolution?.source === 'invitation' ? (
        <UniversalPlatformLanding
          onOpenLogin={() => setIsUniversalLoginOpen(true)}
          onNavigateToStorefront={navigateToStorefront}
        />
      ) : (
        <MainWebsite
          onOpenLogin={() => setIsUniversalLoginOpen(true)}
          onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        />
      )}

      {/* Universal Authentication Modal */}
      <UniversalLoginModal
        isOpen={isUniversalLoginOpen}
        onClose={() => {
          setIsUniversalLoginOpen(false);
          cleanAdminHash();
        }}
        onLoginSuccess={handleUniversalLoginSuccess}
      />

      {/* Master Developer Cockpit (Developer Only) */}
      <MasterAdminPanel
        isOpen={isMasterAdminOpen}
        onClose={() => {
          setIsMasterAdminOpen(false);
          cleanAdminHash();
        }}
        onEnterTenantAdmin={(tenantId) => {
          setActiveClientId(tenantId);
          setIsMasterAdminOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Scoped Tenant CMS Admin Panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => {
          setIsAdminPanelOpen(false);
          cleanAdminHash();
        }}
      />

      {/* Staff Employee Workspace Modal */}
      <EmployeeWorkspaceModal
        isOpen={isEmployeeWorkspaceOpen}
        onClose={() => setIsEmployeeWorkspaceOpen(false)}
        tenantId={employeeWorkspaceData.tenantId}
        employeeId={employeeWorkspaceData.employeeId}
        permissions={employeeWorkspaceData.permissions}
      />

      {/* No Workspace Checkpoint Modal */}
      <NoWorkspaceModal
        isOpen={isNoWorkspaceOpen}
        onClose={() => setIsNoWorkspaceOpen(false)}
        reason={noWorkspaceData.reason}
        tenantId={noWorkspaceData.tenantId}
        userEmail={noWorkspaceData.userEmail}
      />

      {/* Email Verification Checkpoint Modal */}
      <EmailVerificationModal
        isOpen={isEmailVerificationOpen}
        onClose={() => setIsEmailVerificationOpen(false)}
        userEmail={emailVerificationEmail}
        onVerified={() => {
          setIsEmailVerificationOpen(false);
          setIsUniversalLoginOpen(true);
        }}
      />

      {/* Tenant Invitation Acceptance Modal */}
      {invitationData && (
        <InvitationAcceptanceModal
          isOpen={Boolean(invitationData)}
          onClose={() => {
            setInvitationData(null);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('inviteId');
              url.searchParams.delete('token');
              window.history.replaceState({}, '', url.toString());
            } catch {}
          }}
          invitationId={invitationData.invitationId}
          token={invitationData.token}
          clientIdHint={invitationData.clientIdHint}
          onAccepted={handleInvitationAccepted}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TenantProvider>
          <ContentProvider>
            <AppShell />
          </ContentProvider>
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

