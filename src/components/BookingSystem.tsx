import React, { useState, useEffect, useMemo } from 'react';
import { BRAND, SERVICES, BRIDAL_PACKAGES, formatEnquiryMessage, getWhatsAppBookingUrl } from '../data/makeupData';
import { Instagram, Check, Calendar, Clock, MapPin, Sparkles, User, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

export interface BookingSelection {
  type: 'service' | 'package';
  id: string;
}

interface BookingSystemProps {
  selection?: BookingSelection | null;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({ selection }) => {
  // Available options
  const serviceOptions = useMemo(() => {
    const list: { key: string; label: string; type: 'service' | 'package'; id: string; price?: string; category?: string }[] = [];
    
    // Services
    SERVICES.forEach((s) => {
      list.push({
        key: `service-${s.id}`,
        label: `${s.title} (${s.price})`,
        type: 'service',
        id: s.id,
        price: s.price,
        category: 'Bespoke Services',
      });
    });

    // Packages
    BRIDAL_PACKAGES.forEach((pkg) => {
      list.push({
        key: `package-${pkg.id}`,
        label: `${pkg.name} — ${pkg.tier}`,
        type: 'package',
        id: pkg.id,
        category: 'Bridal Packages',
      });
    });

    return list;
  }, []);

  // Form State
  const [selectedKey, setSelectedKey] = useState<string>('service-bridal');
  const [clientName, setClientName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('Evening Wedding Ceremony');
  const [locationType, setLocationType] = useState<string>('Siwan (Home Service)');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Instagram Modal State
  const [showInstagramModal, setShowInstagramModal] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  // Sync prop changes (e.g. user clicked "Book Bridal Makeup" from cards)
  useEffect(() => {
    if (selection) {
      const match = serviceOptions.find((opt) => opt.type === selection.type && opt.id === selection.id);
      if (match) {
        setSelectedKey(match.key);
      }
    }
  }, [selection, serviceOptions]);

  // Derive active item details
  const activeOption = useMemo(() => {
    return serviceOptions.find((opt) => opt.key === selectedKey) || serviceOptions[0];
  }, [selectedKey, serviceOptions]);

  const activeService = useMemo(() => {
    if (activeOption.type === 'service') {
      return SERVICES.find((s) => s.id === activeOption.id);
    }
    return null;
  }, [activeOption]);

  const activePackage = useMemo(() => {
    if (activeOption.type === 'package') {
      return BRIDAL_PACKAGES.find((pkg) => pkg.id === activeOption.id);
    }
    return null;
  }, [activeOption]);

  // Resolved final location
  const resolvedLocation = useMemo(() => {
    if (locationType === 'Custom Address / Outside Siwan') {
      return customLocation.trim() ? customLocation.trim() : 'Outside Siwan / Custom Venue';
    }
    return locationType;
  }, [locationType, customLocation]);

  // Build the complete formatted message with full details
  const completeEnquiryMessage = useMemo(() => {
    if (activeService) {
      return formatEnquiryMessage({
        serviceTitle: activeService.title,
        categoryOrTier: activeService.badge || 'Signature',
        price: activeService.price,
        duration: activeService.duration,
        inclusions: activeService.inclusions,
        clientName,
        eventDate,
        eventTime,
        location: resolvedLocation,
        specialNotes,
      });
    }

    if (activePackage) {
      return formatEnquiryMessage({
        serviceTitle: activePackage.name,
        categoryOrTier: activePackage.tier,
        inclusions: activePackage.features,
        clientName,
        eventDate,
        eventTime,
        location: resolvedLocation,
        specialNotes,
      });
    }

    return formatEnquiryMessage({
      serviceTitle: 'Bridal Makeup',
      categoryOrTier: 'Signature',
      price: '₹10,000',
      duration: '3.5 – 4 Hours',
      clientName,
      eventDate,
      eventTime,
      location: resolvedLocation,
      specialNotes,
    });
  }, [activeService, activePackage, clientName, eventDate, eventTime, resolvedLocation, specialNotes]);

  // WhatsApp dynamic URL
  const whatsAppUrl = useMemo(() => {
    return getWhatsAppBookingUrl(completeEnquiryMessage);
  }, [completeEnquiryMessage]);

  // Instagram click handler
  const handleInstagramClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(completeEnquiryMessage);
      setCopiedSuccess(true);
    } catch {
      // Fallback
    }
    setShowInstagramModal(true);
  };

  const handleOpenInstagramDirectly = () => {
    window.open(BRAND.instagramDmUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="booking-concierge"
      className="w-full px-4 sm:px-6 py-14 sm:py-20 bg-[#6c2e3e] dark:bg-[#1a0a12] text-white border-t border-[#b89758]/30 relative overflow-hidden transition-colors duration-300"
    >
      {/* Decorative ambient sparkles */}
      <div className="absolute top-6 right-6 opacity-10 text-white pointer-events-none">
        <SketchStar className="w-48 h-48" />
      </div>
      <div className="absolute -bottom-10 -left-10 opacity-10 text-white pointer-events-none">
        <SketchStar className="w-64 h-64" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10 flex flex-col items-center">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-2">
          <span className="h-[1px] w-6 bg-[#fed488]/50" />
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#fed488] uppercase tracking-[0.28em] font-semibold">
            Concierge Booking
          </span>
          <span className="h-[1px] w-6 bg-[#fed488]/50" />
        </div>

        {/* Heading */}
        <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-white font-normal tracking-tight text-center">
          Book Your Session
        </h2>

        <div className="my-2.5">
          <SketchWavyLine className="w-40 sm:w-56 h-2 text-[#fed488]/60" />
        </div>

        {/* Subtitle */}
        <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#fddfe5] dark:text-[#eed2d9] max-w-xl text-center leading-relaxed mb-8">
          Select your look and ceremony details below. When you tap WhatsApp or Instagram, your complete enquiry details will be sent directly to Khushi.
        </p>

        {/* Form Container */}
        <div className="w-full rounded-3xl bg-white/10 dark:bg-black/40 border border-[#fed488]/30 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Service Selection Dropdown */}
          <div>
            <label htmlFor="service-select" className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
              Select Service / Bridal Package *
            </label>
            <div className="relative">
              <select
                id="service-select"
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#562230] dark:bg-[#25131b] border border-[#fed488]/40 text-white font-['Plus_Jakarta_Sans'] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#fed488] transition-all cursor-pointer appearance-none"
              >
                <optgroup label="Bespoke Services" className="bg-[#562230] text-white">
                  {serviceOptions
                    .filter((opt) => opt.type === 'service')
                    .map((opt) => (
                      <option key={opt.key} value={opt.key} className="bg-[#562230] text-white">
                        {opt.label}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Bridal Package Suites" className="bg-[#562230] text-white">
                  {serviceOptions
                    .filter((opt) => opt.type === 'package')
                    .map((opt) => (
                      <option key={opt.key} value={opt.key} className="bg-[#562230] text-white">
                        {opt.label}
                      </option>
                    ))}
                </optgroup>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#fed488]">
                ▼
              </div>
            </div>
          </div>

          {/* Active Service Summary Strip */}
          {activeService && (
            <div className="p-4 rounded-2xl bg-black/25 border border-[#fed488]/25 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-['Playfair_Display'] text-xl text-[#fed488] font-medium">
                    {activeService.title}
                  </span>
                  {activeService.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#fed488]/20 text-[#fed488] uppercase tracking-wider font-semibold">
                      {activeService.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-['Playfair_Display'] text-lg text-white font-bold">
                    {activeService.price}
                  </span>
                  <span className="flex items-center gap-1 text-[#fddfe5]/80 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#fed488]" />
                    {activeService.duration}
                  </span>
                </div>
              </div>
              {activeService.inclusions && activeService.inclusions.length > 0 && (
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5 text-[10px] text-[#fddfe5]/90">
                  {activeService.inclusions.slice(0, 4).map((inc, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15">
                      ✓ {inc.split(' ')[0]} {inc.split(' ')[1]} {inc.split(' ')[2] || ''}
                    </span>
                  ))}
                  {activeService.inclusions.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md bg-[#fed488]/15 text-[#fed488]">
                      +{activeService.inclusions.length - 4} more inclusions
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {activePackage && (
            <div className="p-4 rounded-2xl bg-black/25 border border-[#fed488]/25 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-['Playfair_Display'] text-lg text-[#fed488] font-medium">
                  {activePackage.name}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#fed488]/20 text-[#fed488] uppercase tracking-wider font-semibold">
                  {activePackage.tier}
                </span>
              </div>
              <p className="text-xs text-[#fddfe5]/80 leading-relaxed">
                {activePackage.description}
              </p>
            </div>
          )}

          {/* Form Fields: Name & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="client-name" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                <User className="w-3.5 h-3.5 text-[#fed488]" />
                <span>Your Name (Optional)</span>
              </label>
              <input
                id="client-name"
                type="text"
                placeholder="e.g. Pooja Sharma"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 dark:bg-[#25131b] border border-white/20 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488]"
              />
            </div>

            <div>
              <label htmlFor="event-date" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#fed488]" />
                <span>Ceremony / Event Date</span>
              </label>
              <input
                id="event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 dark:bg-[#25131b] border border-white/20 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488] [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Form Fields: Ceremony Time and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-time" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                <Clock className="w-3.5 h-3.5 text-[#fed488]" />
                <span>Ceremony Function / Time</span>
              </label>
              <div className="relative">
                <select
                  id="event-time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-4 pr-8 py-2.5 rounded-xl bg-[#562230] dark:bg-[#25131b] border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488] cursor-pointer appearance-none"
                >
                  <option value="Evening Wedding Ceremony" className="bg-[#562230]">Evening Wedding Ceremony</option>
                  <option value="Morning / Mandap Ritual" className="bg-[#562230]">Morning / Mandap Ritual</option>
                  <option value="Afternoon Haldi / Mehendi" className="bg-[#562230]">Afternoon Haldi / Mehendi</option>
                  <option value="Night Reception / Sangeet" className="bg-[#562230]">Night Reception / Sangeet</option>
                  <option value="Flexible / Full Day" className="bg-[#562230]">Flexible / Full Day</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#fed488] text-[10px]">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location-select" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#fed488]" />
                <span>Service Location</span>
              </label>
              <div className="relative">
                <select
                  id="location-select"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full px-4 pr-8 py-2.5 rounded-xl bg-[#562230] dark:bg-[#25131b] border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488] cursor-pointer appearance-none"
                >
                  <option value="Siwan (Home Service)" className="bg-[#562230]">Siwan (Home Service)</option>
                  <option value="Venue in Siwan" className="bg-[#562230]">Venue / Hotel in Siwan</option>
                  <option value="Custom Address / Outside Siwan" className="bg-[#562230]">Outside Siwan (Travel required)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#fed488] text-[10px]">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {locationType === 'Custom Address / Outside Siwan' && (
            <div>
              <input
                type="text"
                placeholder="Enter city / town name (e.g. Gopalganj, Chapra, Patna)"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-[#fed488]/40 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488]"
              />
            </div>
          )}

          {/* Special Requests / Notes */}
          <div>
            <label htmlFor="special-notes" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#fed488]" />
              <span>Special Requests or Notes (Optional)</span>
            </label>
            <textarea
              id="special-notes"
              rows={2}
              placeholder="e.g. Need floral bun hairstyle, saree draping, or makeup for 2 family members..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 dark:bg-[#25131b] border border-white/20 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488] resize-none"
            />
          </div>

          {/* Two Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            {/* Direct WhatsApp link with 100% full encoded details */}
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 px-6 rounded-2xl bg-[#25d366] hover:bg-[#20ba59] active:scale-98 transition-all shadow-lg text-white font-['Plus_Jakarta_Sans'] text-xs sm:text-sm uppercase tracking-wider font-semibold flex items-center justify-center gap-3 cursor-pointer"
              aria-label="Send Complete Enquiry on WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.853L.054 23.625a.75.75 0 00.921.921l5.772-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.506-5.23-1.388l-.374-.22-3.876.993.993-3.875-.22-.374A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              <span>Enquire on WhatsApp</span>
            </a>

            {/* Instagram DM Button */}
            <button
              onClick={handleInstagramClick}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 active:scale-98 transition-all shadow-md text-white font-['Plus_Jakarta_Sans'] text-xs sm:text-sm uppercase tracking-wider font-semibold flex items-center justify-center gap-3 cursor-pointer"
              aria-label="Send Complete Enquiry on Instagram"
            >
              <Instagram className="w-5 h-5 text-white shrink-0" />
              <span>Enquire on Instagram</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#fddfe5]/70 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#fed488]" />
            <span>Sends complete service details, pricing, inclusions &amp; your date directly to Khushi</span>
          </div>

        </div>

        {/* Contact info bar */}
        <p className="mt-6 font-['Plus_Jakarta_Sans'] text-xs text-[#fddfe5]/60 tracking-wider text-center">
          {BRAND.instagram} &nbsp;·&nbsp; {BRAND.phoneDisplay}
        </p>

        {/* Trust note */}
        <div className="mt-6 flex items-center gap-2 font-['Caveat'] text-sm sm:text-base text-[#fed488]/80 text-center">
          <SketchStar className="w-4 h-4" />
          <span>Home service available across Siwan · Travel arranged upon request</span>
          <SketchStar className="w-4 h-4" />
        </div>
      </div>

      {/* Instagram Complete Detail Modal / Guide */}
      {showInstagramModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity"
          onClick={() => setShowInstagramModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-[#1f1217] rounded-3xl border-2 border-[#b89758] p-6 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowInstagramModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shrink-0">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-['Playfair_Display'] text-lg text-white font-medium">
                  Enquiry Details Ready!
                </h3>
                <span className="text-[11px] text-[#52e283] flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  Complete details copied to your clipboard
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#dfc3c9] space-y-2 leading-relaxed">
              <p>
                Because Instagram chats don't support auto-filling from external links, your <strong>full enquiry details (service, price, duration, inclusions, date &amp; venue)</strong> are now on your clipboard.
              </p>
              <p className="text-[#fed488] font-medium">
                👉 Step: Click below to open Instagram DM, then simply <strong>Paste</strong> into your message box to send!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleOpenInstagramDirectly}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Open Instagram DM Now</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowInstagramModal(false)}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs uppercase tracking-wider font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
