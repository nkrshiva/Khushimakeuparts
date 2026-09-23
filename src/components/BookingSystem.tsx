import React, { useState, useEffect, useMemo } from 'react';
import { useSiteContent } from '../context/ContentContext';
import { formatEnquiryMessage } from '../data/makeupData';
import { DEFAULT_BUSINESS_HOURS } from '../data/archetypePresets';
import { DayOfWeek, BusySlotItem } from '../types';
import {
  Instagram,
  Check,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  User,
  X,
  ExternalLink,
  ShieldCheck,
  Phone,
  Scissors,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

export interface BookingSelection {
  type: 'service' | 'package';
  id: string;
  initialDate?: string;
}

interface BookingSystemProps {
  selection?: BookingSelection | null;
}

export const BookingSystem: React.FC<BookingSystemProps> = ({ selection }) => {
  const { content, addEnquiry, addAppointment, isModuleEnabled, busySlots, activeClientId } = useSiteContent();
  const { brand } = content;
  const SERVICES = content.services || [];
  const BRIDAL_PACKAGES = content.bridalPackages || [];

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
        category: s.category || 'Bespoke Services',
      });
    });

    // Packages (only if bridalPackages module is enabled)
    if (isModuleEnabled('bridalPackages')) {
      BRIDAL_PACKAGES.forEach((pkg) => {
        list.push({
          key: `package-${pkg.id}`,
          label: `${pkg.name} — ${pkg.tier}`,
          type: 'package',
          id: pkg.id,
          category: 'Bridal Packages',
        });
      });
    }

    return list;
  }, [SERVICES, BRIDAL_PACKAGES, isModuleEnabled]);

  // Form State
  const [selectedKey, setSelectedKey] = useState<string>(() => {
    return serviceOptions[0]?.key || 'service-bridal';
  });
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:00 AM');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventTime, setEventTime] = useState<string>('Evening Wedding Ceremony');
  const [locationType, setLocationType] = useState<string>('Siwan (Home Service)');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Modals & Feedback State
  const [showInstagramModal, setShowInstagramModal] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmittedToast, setShowSubmittedToast] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Sync prop changes (e.g. user clicked "Book Service" or picked a date from calendar)
  useEffect(() => {
    if (selection) {
      const match = serviceOptions.find((opt) => opt.type === selection.type && opt.id === selection.id);
      if (match) {
        setSelectedKey(match.key);
      }
      if (selection.initialDate) {
        setEventDate(selection.initialDate);
      }
    }
  }, [selection, serviceOptions]);

  // Clear booking error when user changes slot, date, staff, or service
  useEffect(() => {
    setBookingError(null);
  }, [eventDate, selectedTimeSlot, selectedStaffId, selectedKey]);

  // Derive active item details
  const activeOption = useMemo(() => {
    return serviceOptions.find((opt) => opt.key === selectedKey) || serviceOptions[0];
  }, [selectedKey, serviceOptions]);

  const activeService = useMemo(() => {
    if (activeOption?.type === 'service') {
      return SERVICES.find((s) => s.id === activeOption.id);
    }
    return null;
  }, [activeOption, SERVICES]);

  const activePackage = useMemo(() => {
    if (activeOption?.type === 'package') {
      return BRIDAL_PACKAGES.find((pkg) => pkg.id === activeOption.id);
    }
    return null;
  }, [activeOption, BRIDAL_PACKAGES]);

  // Reset or pick initial variant when activeService changes
  useEffect(() => {
    if (activeService?.priceVariants && activeService.priceVariants.length > 0) {
      setSelectedVariantId(activeService.priceVariants[0].id);
    } else {
      setSelectedVariantId('');
    }
    setSelectedAddOnIds([]);
  }, [activeService]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedAddOns = useMemo(() => {
    if (!activeService?.addOns) return [];
    return activeService.addOns.filter((ao) => selectedAddOnIds.includes(ao.id));
  }, [activeService, selectedAddOnIds]);

  const baseDurationMinutes = useMemo(() => {
    if (activeService?.durationMinutes) return activeService.durationMinutes;
    return 45;
  }, [activeService]);

  const totalDurationMinutes = useMemo(() => {
    const addOnsDuration = selectedAddOns.reduce((sum, ao) => sum + (ao.durationMinutes || 0), 0);
    return baseDurationMinutes + addOnsDuration;
  }, [baseDurationMinutes, selectedAddOns]);

  const activeVariant = useMemo(() => {
    return activeService?.priceVariants?.find((v) => v.id === selectedVariantId) || null;
  }, [activeService, selectedVariantId]);

  const effectivePrice = useMemo(() => {
    let basePriceNum = 0;
    let basePriceStr = '';

    if (activeVariant) {
      basePriceNum = activeVariant.priceNum || parseInt(activeVariant.price.replace(/[^0-9]/g, ''), 10) || 0;
      basePriceStr = activeVariant.price;
    } else if (activeService) {
      basePriceNum = activeService.priceNum || parseInt(activeService.price.replace(/[^0-9]/g, ''), 10) || 0;
      basePriceStr = activeService.price;
    } else if (activePackage) {
      return activePackage.tier;
    } else {
      return '₹10,000';
    }

    const addOnsPriceNum = selectedAddOns.reduce((sum, ao) => {
      return sum + (ao.priceNum || parseInt(ao.price.replace(/[^0-9]/g, ''), 10) || 0);
    }, 0);

    if (addOnsPriceNum > 0) {
      const total = basePriceNum + addOnsPriceNum;
      return `₹${total.toLocaleString('en-IN')}`;
    }
    return basePriceStr || `₹${basePriceNum.toLocaleString('en-IN')}`;
  }, [activeVariant, activeService, activePackage, selectedAddOns]);

  // Detect whether this booking requires hourly time slots vs wedding date
  const isTimeslotBooking = useMemo(() => {
    if (activeService?.bookingMode === 'timeslot') return true;
    if (activeService?.bookingMode === 'wedding') return false;
    // Fallback: if timeSlotBooking module is on and muhurat calendar is off
    return isModuleEnabled('timeSlotBooking') && !isModuleEnabled('muaMuhuratCalendar');
  }, [activeService, isModuleEnabled]);

  const dayOfWeek = useMemo<DayOfWeek | null>(() => {
    if (!eventDate) return null;
    try {
      const dateObj = new Date(`${eventDate}T00:00:00`);
      const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return dayNames[dateObj.getDay()];
    } catch {
      return null;
    }
  }, [eventDate]);

  // Eligible Staff for active service
  const eligibleStaff = useMemo(() => {
    if (!isModuleEnabled('staffManagement') || !content.staff || content.staff.length === 0) return [];
    return content.staff.filter((st) => {
      if (st.active === false) return false;
      if (activeService?.eligibleStaffIds && activeService.eligibleStaffIds.length > 0) {
        return activeService.eligibleStaffIds.includes(st.id);
      }
      if (st.assignedServiceIds && st.assignedServiceIds.length > 0 && activeService) {
        return st.assignedServiceIds.includes(activeService.id);
      }
      return true;
    });
  }, [isModuleEnabled, content.staff, activeService]);

  const staffOnDuty = useMemo(() => {
    if (!dayOfWeek) return eligibleStaff;
    return eligibleStaff.filter((st) => st.workingDays.includes(dayOfWeek));
  }, [eligibleStaff, dayOfWeek]);

  const selectedStaff = useMemo(() => {
    return eligibleStaff.find((st) => st.id === selectedStaffId) || null;
  }, [eligibleStaff, selectedStaffId]);

  // Check if chosen date is already marked as booked on Muhurat Calendar
  const bookedDateInfo = useMemo(() => {
    if (!eventDate || isTimeslotBooking) return null;
    const match = (content.calendarAvailability || []).find((c) => c.date === eventDate);
    return match?.status === 'booked' ? match : null;
  }, [eventDate, isTimeslotBooking, content.calendarAvailability]);

  // Dynamic slot calculations with normalized minutes, buffer time, and interval overlap
  const slotCalculation = useMemo(() => {
    if (!isTimeslotBooking || !eventDate || !dayOfWeek) {
      return { isClosed: false, slots: [] as { slot: string; startMinute: number; endMinute: number; isBooked: boolean }[] };
    }

    try {
      const businessHours = content.businessHours || DEFAULT_BUSINESS_HOURS;
      const daySchedule = businessHours.schedule.find((s) => s.day === dayOfWeek);

      if (!daySchedule || !daySchedule.isOpen) {
        return { isClosed: true, slots: [] };
      }

      const interval = businessHours.slotIntervalMinutes || 30;
      const buffer = businessHours.bufferMinutes || 0;
      const [openH, openM] = daySchedule.openTime.split(':').map(Number);
      const [closeH, closeM] = daySchedule.closeTime.split(':').map(Number);
      const startMins = openH * 60 + (openM || 0);
      const endMins = closeH * 60 + (closeM || 0);

      let breakStartMins = -1;
      let breakEndMins = -1;
      if (daySchedule.breakStart && daySchedule.breakEnd) {
        const [bsh, bsm] = daySchedule.breakStart.split(':').map(Number);
        const [beh, bem] = daySchedule.breakEnd.split(':').map(Number);
        breakStartMins = bsh * 60 + (bsm || 0);
        breakEndMins = beh * 60 + (bem || 0);
      }

      const dateBusySlots = (busySlots || []).filter((b) => b.date === eventDate);
      const reqDuration = totalDurationMinutes;

      const list: { slot: string; startMinute: number; endMinute: number; isBooked: boolean }[] = [];

      for (let sMin = startMins; sMin + reqDuration <= endMins; sMin += interval) {
        const eMin = sMin + reqDuration;

        // Skip if candidate interval overlaps with lunch / break
        if (breakStartMins >= 0 && breakEndMins >= 0) {
          if (Math.max(sMin, breakStartMins) < Math.min(eMin, breakEndMins)) {
            continue;
          }
        }

        const h24 = Math.floor(sMin / 60);
        const mins = sMin % 60;
        const ampm = h24 >= 12 ? 'PM' : 'AM';
        const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
        const slotString = `${h12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;

        // Interval overlap collision check:
        // Candidate [sMin, eMin) collides with [b.startMinute, b.endMinute + buffer)
        // iff max(sMin, b.startMinute) < min(eMin, b.endMinute + buffer)
        const isSlotColliding = (b: BusySlotItem) => {
          return Math.max(sMin, b.startMinute) < Math.min(eMin, b.endMinute + buffer);
        };

        let isBooked = false;

        if (selectedStaffId) {
          // Specific staff member selected
          if (!selectedStaff?.workingDays.includes(dayOfWeek)) {
            isBooked = true;
          } else {
            const hasCollision = dateBusySlots.some(
              (b) => (!b.staffId || b.staffId === selectedStaffId) && isSlotColliding(b)
            );
            isBooked = hasCollision;
          }
        } else {
          // "Any Specialist"
          if (isModuleEnabled('staffManagement') && content.staff && content.staff.length > 0) {
            if (staffOnDuty.length === 0) {
              isBooked = true;
            } else {
              const freeStaff = staffOnDuty.filter((st) => {
                const staffBusy = dateBusySlots.some((b) => b.staffId === st.id && isSlotColliding(b));
                return !staffBusy;
              });
              const unassignedCount = dateBusySlots.filter((b) => !b.staffId && isSlotColliding(b)).length;
              isBooked = freeStaff.length <= unassignedCount;
            }
          } else {
            const hasCollision = dateBusySlots.some((b) => isSlotColliding(b));
            isBooked = hasCollision;
          }
        }

        list.push({ slot: slotString, startMinute: sMin, endMinute: eMin, isBooked });
      }

      return { isClosed: false, slots: list };
    } catch {
      return { isClosed: false, slots: [] };
    }
  }, [
    isTimeslotBooking,
    eventDate,
    dayOfWeek,
    content.businessHours,
    busySlots,
    totalDurationMinutes,
    selectedStaffId,
    selectedStaff,
    staffOnDuty,
    isModuleEnabled,
    content.staff
  ]);

  // Auto-select first available slot if currently selected slot is invalid/booked
  useEffect(() => {
    if (isTimeslotBooking && slotCalculation.slots.length > 0) {
      const available = slotCalculation.slots.filter((s) => !s.isBooked);
      const currentValid = available.some((s) => s.slot === selectedTimeSlot);
      if (!currentValid && available.length > 0) {
        setSelectedTimeSlot(available[0].slot);
      }
    }
  }, [isTimeslotBooking, slotCalculation.slots, selectedTimeSlot]);

  // Helper to determine which staff gets assigned under "Any Specialist"
  const getAssignedStaffForSlot = (sMin: number, eMin: number) => {
    if (selectedStaff) return selectedStaff;
    if (!staffOnDuty || staffOnDuty.length === 0) return null;
    const buffer = content.businessHours?.bufferMinutes || 0;
    const dateBusySlots = (busySlots || []).filter((b) => b.date === eventDate);
    return staffOnDuty.find((st) => {
      const busy = dateBusySlots.some(
        (b) => b.staffId === st.id && Math.max(sMin, b.startMinute) < Math.min(eMin, b.endMinute + buffer)
      );
      return !busy;
    }) || staffOnDuty[0];
  };

  // Resolved final location for wedding enquiries
  const resolvedLocation = useMemo(() => {
    if (locationType === 'Custom Address / Outside Siwan') {
      return customLocation.trim() ? customLocation.trim() : 'Outside Siwan / Custom Venue';
    }
    return locationType;
  }, [locationType, customLocation]);

  // Build the complete formatted message with full details
  const completeEnquiryMessage = useMemo(() => {
    if (isTimeslotBooking) {
      const parts = [
        `✨ *SALON APPOINTMENT RESERVATION* ✨`,
        `📍 Business: ${brand.name}`,
        `💇 Service: ${activeService?.title || 'Salon Service'}`,
        activeVariant ? `📏 Option / Tier: ${activeVariant.label}` : '',
        selectedAddOns.length > 0 ? `✨ Add-ons: ${selectedAddOns.map((a) => a.name).join(', ')}` : '',
        `⏱ Total Duration: ${totalDurationMinutes} mins`,
        `💵 Total Price: ${effectivePrice}`,
        `📅 Date: ${eventDate || 'Preferred Date'}`,
        `⏰ Time Slot: ${selectedTimeSlot}`,
        selectedStaff ? `👤 Requested Specialist: ${selectedStaff.name} (${selectedStaff.role})` : '👤 Specialist: Any Specialist',
        `👤 Client Name: ${clientName.trim() || 'Guest'}`,
        `📱 Contact Phone: ${clientPhone.trim() || 'Provided on WhatsApp'}`,
        specialNotes.trim() ? `📝 Special Note: ${specialNotes.trim()}` : '',
        `\nPlease confirm availability for this appointment! Thank you.`
      ];
      return parts.filter(Boolean).join('\n');
    }

    if (activeService) {
      return formatEnquiryMessage({
        serviceTitle: activeService.title,
        categoryOrTier: activeService.badge || 'Signature',
        price: effectivePrice,
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
      specialNotes: [clientPhone ? `Contact Phone: ${clientPhone}` : '', specialNotes].filter(Boolean).join(' | '),
    });
  }, [
    isTimeslotBooking,
    brand.name,
    activeService,
    activePackage,
    activeVariant,
    selectedAddOns,
    totalDurationMinutes,
    effectivePrice,
    eventDate,
    selectedTimeSlot,
    selectedStaff,
    clientName,
    clientPhone,
    specialNotes,
    eventTime,
    resolvedLocation
  ]);

  // Record Lead or Appointment to Database atomically
  const recordLead = async (): Promise<boolean> => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    setBookingError(null);

    try {
      if (isTimeslotBooking) {
        const matchedSlot = slotCalculation.slots.find((s) => s.slot === selectedTimeSlot);
        const startMinute = matchedSlot?.startMinute ?? 660;
        const endMinute = matchedSlot?.endMinute ?? (startMinute + totalDurationMinutes);
        const assigned = getAssignedStaffForSlot(startMinute, endMinute);

        const endH24 = Math.floor(endMinute / 60);
        const endM = endMinute % 60;
        const endAmpm = endH24 >= 12 ? 'PM' : 'AM';
        const endH12 = endH24 % 12 === 0 ? 12 : endH24 % 12;
        const calculatedEndTime = `${endH12.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')} ${endAmpm}`;

        const result = await addAppointment({
          clientId: activeClientId || 'khushi',
          customerName: clientName.trim() || 'Walk-in / Online Guest',
          customerPhone: clientPhone.trim() || 'WhatsApp Contact',
          serviceId: activeService?.id || 'salon-service',
          serviceTitle: activeService?.title || 'Salon Service',
          variantId: activeVariant?.id,
          variantLabel: activeVariant?.label,
          selectedAddOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
          staffId: assigned?.id,
          staffName: assigned?.name,
          date: eventDate || new Date().toISOString().split('T')[0],
          timeSlot: selectedTimeSlot,
          endTime: calculatedEndTime,
          startMinute,
          endMinute,
          durationMinutes: totalDurationMinutes,
          price: effectivePrice,
          notes: specialNotes.trim() || undefined,
          source: 'website',
        });

        if (!result.success) {
          setIsSubmitting(false);
          if (result.error === 'SLOT_TAKEN') {
            setBookingError('Sorry! This appointment slot was just booked by another customer. Please choose another time slot.');
          } else if (result.error === 'CLOSED') {
            setBookingError('No staff specialists are scheduled on duty on this day.');
          } else {
            setBookingError('Unable to reserve this slot. Please select another time or date.');
          }
          return false;
        }

        setShowSubmittedToast(true);
        setTimeout(() => setIsSubmitting(false), 4000);
        setTimeout(() => setShowSubmittedToast(false), 5000);
        return true;
      } else {
        const isPkg = activeOption?.type === 'package';
        const svcId = isPkg ? (activePackage?.id || 'bridal-package') : (activeService?.id || 'bridal');
        const ceremonyTitle = isPkg ? (activePackage?.name || 'Bridal Package') : (activeService?.title || 'Bridal Makeup');

        await addEnquiry({
          clientName: clientName.trim() || 'Bride / Guest',
          phone: clientPhone.trim(),
          serviceId: svcId,
          ceremonyType: ceremonyTitle,
          eventDate: eventDate ? `${eventDate} (${eventTime})` : 'Flexible Date',
          location: resolvedLocation,
          notes: specialNotes.trim(),
        });

        setShowSubmittedToast(true);
        setTimeout(() => setIsSubmitting(false), 4000);
        setTimeout(() => setShowSubmittedToast(false), 5000);
        return true;
      }
    } catch (err) {
      console.warn('Could not record booking:', err);
      setIsSubmitting(false);
      setBookingError('An unexpected network error occurred. Please try again.');
      return false;
    }
  };

  // WhatsApp dynamic URL using current brand phone
  const whatsAppUrl = useMemo(() => {
    const rawPhone = brand.phone || '9162143273';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(completeEnquiryMessage)}`;
  }, [completeEnquiryMessage, brand.phone]);

  // WhatsApp button click handler
  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const ok = await recordLead();
    if (ok) {
      window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Instagram click handler
  const handleInstagramClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const ok = await recordLead();
    if (ok) {
      try {
        await navigator.clipboard.writeText(completeEnquiryMessage);
        setCopiedSuccess(true);
      } catch {}
      setShowInstagramModal(true);
    }
  };

  const handleOpenInstagramDirectly = () => {
    window.open(brand.instagramDmUrl, '_blank', 'noopener,noreferrer');
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
            {isTimeslotBooking ? 'Salon Appointments' : 'Concierge Booking'}
          </span>
          <span className="h-[1px] w-6 bg-[#fed488]/50" />
        </div>

        {/* Heading */}
        <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-white font-normal tracking-tight text-center">
          {isTimeslotBooking ? 'Book Your Appointment' : 'Book Your Session'}
        </h2>

        <div className="my-2.5">
          <SketchWavyLine className="w-40 sm:w-56 h-2 text-[#fed488]/60" />
        </div>

        {/* Subtitle */}
        <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#fddfe5] dark:text-[#eed2d9] max-w-xl text-center leading-relaxed mb-8">
          {isTimeslotBooking
            ? `Select your service, choose a convenient time slot, and reserve with ${brand.name || 'us'} in just a few taps.`
            : `Select your look and ceremony details below. When you tap WhatsApp or Instagram, your complete enquiry details will be sent directly to ${brand.founder || 'our team'}.`}
        </p>

        {/* Form Container */}
        <div className="relative group w-full">
          {/* Dual rotated accent frames on hover / focus */}
          <div className="absolute -inset-2 sm:-inset-3 rounded-3xl sm:rounded-[2rem] border border-[#fed488]/50 rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:scale-102 group-hover:rotate-1.5 transition-all duration-500 pointer-events-none" />
          <div className="absolute -inset-2 sm:-inset-3 rounded-3xl sm:rounded-[2rem] border border-[#dca8b5]/40 -rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:scale-103 group-hover:-rotate-1.5 transition-all duration-500 pointer-events-none" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#fed488]/15 via-[#dca8b5]/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative w-full rounded-3xl bg-white/10 dark:bg-black/40 border border-[#fed488]/30 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Service Selection Dropdown */}
            <div>
              <label htmlFor="service-select" className="block text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                {isTimeslotBooking ? 'Select Treatment / Service *' : 'Select Service / Bridal Package *'}
              </label>
              <div className="relative">
                <select
                  id="service-select"
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#562230] dark:bg-[#25131b] border border-[#fed488]/40 text-white font-['Plus_Jakarta_Sans'] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#fed488] transition-all cursor-pointer appearance-none"
                >
                  <optgroup label="Available Services" className="bg-[#562230] text-white">
                    {serviceOptions
                      .filter((opt) => opt.type === 'service')
                      .map((opt) => (
                        <option key={opt.key} value={opt.key} className="bg-[#562230] text-white">
                          {opt.label}
                        </option>
                      ))}
                  </optgroup>
                  {isModuleEnabled('bridalPackages') && (
                    <optgroup label="Bridal Package Suites" className="bg-[#562230] text-white">
                      {serviceOptions
                        .filter((opt) => opt.type === 'package')
                        .map((opt) => (
                          <option key={opt.key} value={opt.key} className="bg-[#562230] text-white">
                            {opt.label}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#fed488]">
                  ▼
                </div>
              </div>
            </div>

            {/* Price Variants (e.g. Short / Medium / Long hair or Tier) */}
            {activeService?.priceVariants && activeService.priceVariants.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-black/20 border border-[#fed488]/20 space-y-2">
                <span className="block text-[10px] uppercase tracking-wider text-[#fed488] font-semibold">
                  Choose Length / Variant:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeService.priceVariants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;
                    return (
                      <button
                        type="button"
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#fed488] text-[#562230] border-[#fed488] shadow-md font-semibold'
                            : 'bg-white/5 text-white/90 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="text-[11px] leading-tight">{variant.label}</div>
                        <div className={`text-xs mt-1 font-bold ${isSelected ? 'text-[#562230]' : 'text-[#fed488]'}`}>
                          {variant.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                      {effectivePrice}
                    </span>
                    <span className="flex items-center gap-1 text-[#fddfe5]/80 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-[#fed488]" />
                      {totalDurationMinutes} mins {selectedAddOnIds.length > 0 ? '(incl. add-ons)' : ''}
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

            {/* Service Add-Ons (if available on active service) */}
            {activeService?.addOns && activeService.addOns.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-black/20 border border-[#fed488]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] uppercase tracking-wider text-[#fed488] font-semibold">
                    Customize with Add-ons &amp; Upgrades:
                  </span>
                  {selectedAddOnIds.length > 0 && (
                    <span className="text-[10px] text-[#fed488] font-medium bg-[#fed488]/10 px-2 py-0.5 rounded-full border border-[#fed488]/20">
                      {selectedAddOnIds.length} added (+{totalDurationMinutes - baseDurationMinutes} min)
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeService.addOns.map((addOn) => {
                    const isChecked = selectedAddOnIds.includes(addOn.id);
                    return (
                      <button
                        type="button"
                        key={addOn.id}
                        onClick={() => toggleAddOn(addOn.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-[#fed488]/20 border-[#fed488] text-white shadow-sm'
                            : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked
                                ? 'bg-[#fed488] border-[#fed488] text-[#562230]'
                                : 'border-white/30 bg-white/5'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-medium truncate">{addOn.name}</div>
                            {addOn.durationMinutes && (
                              <div className="text-[10px] text-[#fddfe5]/70">+{addOn.durationMinutes} mins</div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#fed488] shrink-0">
                          +{addOn.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
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

            {/* Staff / Stylist Selector (if staff management enabled and staff exists) */}
            {isTimeslotBooking && eligibleStaff.length > 0 && (
              <div>
                <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                  <Scissors className="w-3.5 h-3.5 text-[#fed488]" />
                  <span>Choose Preferred Stylist / Specialist</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStaffId('')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedStaffId === ''
                        ? 'bg-[#fed488]/20 border-[#fed488] text-white font-medium'
                        : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
                    }`}
                  >
                    <div className="text-xs font-semibold">✨ Any Specialist</div>
                    <div className="text-[10px] text-[#fddfe5]/70">Fastest confirmation</div>
                  </button>
                  {eligibleStaff.map((st) => {
                    const isSelected = selectedStaffId === st.id;
                    return (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => setSelectedStaffId(st.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#fed488] text-[#562230] border-[#fed488] font-semibold shadow-md'
                            : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 border flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'border-[#562230]/40 bg-[#562230]/10 text-[#562230]'
                            : 'border-[#fed488]/40 bg-[#fed488]/10 text-[#fed488]'
                        }`}>
                          {st.avatarUrl ? (
                            <img
                              src={st.avatarUrl}
                              alt={st.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            st.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{st.name}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-[#562230]/80' : 'text-[#fed488]'}`}>
                            {st.role}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Fields: Name, Phone & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="client-name" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#fed488]" />
                  <span>Your Name *</span>
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
                <label htmlFor="client-phone" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#fed488]" />
                  <span>WhatsApp / Phone *</span>
                </label>
                <input
                  id="client-phone"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 dark:bg-[#25131b] border border-white/20 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488]"
                />
              </div>

              <div>
                <label htmlFor="event-date" className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#fed488]" />
                  <span>{isTimeslotBooking ? 'Appointment Date *' : 'Ceremony Date'}</span>
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

            {/* Auspicious Muhurat Warning (for Wedding MUA mode) */}
            {bookedDateInfo && (
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-[11px] text-amber-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#fed488] shrink-0 mt-0.5" />
                <span>
                  <strong>Notice:</strong> This date has a confirmed booking{bookedDateInfo.note ? ` (${bookedDateInfo.note})` : ''}. Submit this enquiry to check if an afternoon/evening slot or vanity is open!
                </span>
              </div>
            )}

            {/* Time Slot Picker (for Salon / Parlour mode) */}
            {isTimeslotBooking && (
              <div>
                <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#fed488] font-semibold mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#fed488]" />
                  <span>Select Time Slot *</span>
                </label>

                {!eventDate ? (
                  <p className="text-xs text-[#fddfe5]/70 italic py-2">
                    Please pick a date above to view available salon time slots.
                  </p>
                ) : slotCalculation.isClosed ? (
                  <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>The salon/studio is closed on this day. Please select another date.</span>
                  </div>
                ) : slotCalculation.slots.length === 0 ? (
                  <p className="text-xs text-[#fddfe5]/70 italic py-2">
                    No open appointment slots remaining on this day.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                    {slotCalculation.slots.map(({ slot, isBooked }) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          disabled={isBooked}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2 px-1 text-center rounded-xl border text-xs transition-all cursor-pointer ${
                            isBooked
                              ? 'bg-zinc-800/50 border-white/5 text-zinc-500 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#fed488] text-[#562230] font-bold border-[#fed488] shadow-md scale-102'
                              : 'bg-white/5 border-white/15 text-white hover:border-[#fed488]/60 hover:bg-white/10'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Wedding Mode: Ceremony Time & Location */}
            {!isTimeslotBooking && (
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
                      <option value="Siwan (Home Service)" className="bg-[#562230]">{brand.location || 'Local'} (Doorstep Vanity)</option>
                      <option value="Venue in Siwan" className="bg-[#562230]">Venue / Hotel</option>
                      <option value="Custom Address / Outside Siwan" className="bg-[#562230]">Travel required (Outstation)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#fed488] text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isTimeslotBooking && locationType === 'Custom Address / Outside Siwan' && (
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
                placeholder={isTimeslotBooking ? "e.g. Need hair wash first, allergic to certain hair dyes..." : "e.g. Need floral bun hairstyle, saree draping, or makeup for 2 family members..."}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 dark:bg-[#25131b] border border-white/20 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#fed488] resize-none"
              />
            </div>

            {/* Booking conflict / error alert */}
            {bookingError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-3 shadow-xl">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="space-y-0.5 text-left">
                  <p className="font-semibold text-rose-100">Reservation Notice</p>
                  <p className="text-rose-200/90">{bookingError}</p>
                </div>
              </div>
            )}

            {/* Submission feedback toast */}
            {showSubmittedToast && (
              <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-center gap-2 shadow-lg animate-pulse">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isTimeslotBooking ? 'Appointment logged successfully! Opening WhatsApp...' : 'Your booking details are logged! Opening conversation concierge...'}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row gap-4">
              {/* Direct WhatsApp button */}
              <button
                type="button"
                onClick={handleWhatsAppClick}
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 rounded-2xl bg-[#25d366] hover:bg-[#20bd5a] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 text-white font-['Plus_Jakarta_Sans'] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#25d366]/30 border border-white/20 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.853L.054 23.625a.75.75 0 00.921.921l5.772-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.506-5.23-1.388l-.374-.22-3.876.993.993-3.875-.22-.374A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                <span>{isTimeslotBooking ? 'Book via WhatsApp' : 'Send Enquiry via WhatsApp'}</span>
              </button>

              {/* Instagram DM Button */}
              <button
                type="button"
                onClick={handleInstagramClick}
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#fd1d1d]/25 text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Enquire on Instagram</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#fddfe5]/70 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#fed488]" />
              <span>
                {isTimeslotBooking
                  ? `Instant appointment logging & verified confirmation with ${brand.name}`
                  : `Sends complete service details, pricing, inclusions & your date directly to ${brand.founder}`}
              </span>
            </div>
          </div>
        </div>

        {/* Trust note */}
        <div className="mt-6 flex items-center gap-2 font-['Caveat'] text-sm sm:text-base text-[#fed488]/80 text-center">
          <SketchStar className="w-4 h-4" />
          <span>
            {isTimeslotBooking
              ? `Air-conditioned salon studio floor · Prior booking ensures zero wait-time`
              : `Home service available across ${brand.location || 'Siwan'} · Travel arranged upon request`}
          </span>
          <SketchStar className="w-4 h-4" />
        </div>
      </div>

      {/* Instagram Complete Detail Modal */}
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
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shrink-0">
                <Instagram className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-['Playfair_Display'] text-lg text-white font-medium">
                  Booking Details Ready!
                </h3>
                <span className="text-[11px] text-[#52e283] flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  Complete details copied to your clipboard
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#dfc3c9] space-y-2 leading-relaxed">
              <p>
                Your booking details (service, variant, date, time slot, and price) have been automatically copied to your clipboard.
              </p>
              <p className="text-[#fed488] font-medium">
                👉 Step: Click below to open Instagram DM, then simply <strong>Paste</strong> into your chat to send!
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
