import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  MessageSquare,
  X,
  AlertCircle,
  Clock,
  Heart,
  CalendarCheck
} from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { DateAvailabilityItem } from '../types';
import { SketchStar, SketchWavyLine, SketchBotanical, SketchPerfume } from './HandDrawnIllustrations';

interface DateAvailabilityCalendarProps {
  onSelectDate?: (dateStr: string) => void;
}

export const DateAvailabilityCalendar: React.FC<DateAvailabilityCalendarProps> = ({ onSelectDate }) => {
  const { content } = useSiteContent();
  const availabilityList = content.calendarAvailability || [];
  const brand = content.brand;

  // Track the currently viewed month
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookedModalDate, setBookedModalDate] = useState<{ date: string; note?: string } | null>(null);

  // Month metadata
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = useMemo(() => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  // Days in this month
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  // Day of week of 1st day (0 = Sunday)
  const firstDayIndex = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  // Availability lookup map: 'YYYY-MM-DD' => DateAvailabilityItem
  const availabilityMap = useMemo(() => {
    const map = new Map<string, DateAvailabilityItem>();
    availabilityList.forEach((item) => {
      map.set(item.date, item);
    });
    return map;
  }, [availabilityList]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dateStr: string, isBooked: boolean, note?: string) => {
    if (isBooked) {
      // When a user tries to select a booked date, show the advisory prompt to enquire if artist is available
      setBookedModalDate({ date: dateStr, note });
      return;
    }

    // Available date selected: update state to display the selected date banner and proceed action
    setSelectedDate(dateStr);
  };

  // Format date helper
  const formatDateFriendly = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('default', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // WhatsApp enquiry link generator for booked date
  const getWhatsAppEnquiryUrl = (dateStr: string) => {
    const formatted = formatDateFriendly(dateStr);
    const cleanPhone = (brand.phone || '9162143273').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
    const text = `Hello ${brand.founder || 'Khushi'}! ✨ I am checking for bridal booking availability on ${formatted} in ${brand.primaryServiceArea || 'Siwan'}. I know this is a busy date, but wanted to inquire if any morning or evening slot/vanity is available?`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  };

  // Day cells
  const dayCells = useMemo(() => {
    const cells = [];
    // Padding before 1st day
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`pad-${i}`} className="h-12 sm:h-14 rounded-2xl opacity-0 pointer-events-none" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthPadded = String(month + 1).padStart(2, '0');
      const dayPadded = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthPadded}-${dayPadded}`;
      const item = availabilityMap.get(dateStr);
      const isBooked = item?.status === 'booked';
      const isSelected = selectedDate === dateStr;

      // Clean, elegant luxury calendar cell:
      // Note: We deliberately do NOT mark dates with discouraging blunt "Booked" text or disabled states.
      // All dates appear welcoming, auspicious, and clickable in both Light & Dark modes.
      let cellStyles = 'bg-white dark:bg-[#180b12]/50 text-[#25181c] dark:text-[#fcecee] border-[#c48496] dark:border-white/10 hover:border-[#b89758] hover:bg-[#faeaed] dark:hover:bg-[#6c2e3e]/30 cursor-pointer hover:scale-105 shadow-2xs';

      if (isSelected) {
        cellStyles = 'ring-2 ring-[#fed488] shadow-lg shadow-[#b89758]/30 scale-105 bg-[#6c2e3e] text-white border-[#fed488]';
      }

      cells.push(
        <button
          key={dateStr}
          type="button"
          onClick={() => handleDateClick(dateStr, isBooked, item?.note)}
          className={`relative h-12 sm:h-14 rounded-2xl border flex flex-col items-center justify-center p-1 transition-all duration-300 group cursor-pointer ${cellStyles}`}
        >
          <span className="text-xs sm:text-sm font-bold">{d}</span>
          
          {/* Subtle auspicious star dot */}
          <span className="w-1 h-1 rounded-full bg-[#8c5f1b]/50 dark:bg-[#fed488]/40 group-hover:bg-[#8c5f1b] dark:group-hover:bg-[#fed488] transition-colors mt-0.5" />
        </button>
      );
    }
    return cells;
  }, [daysInMonth, firstDayIndex, year, month, availabilityMap, selectedDate]);

  return (
    <section id="wedding-calendar" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-transparent">
      {/* ─── FLOATING THEME SHAPES & STARS (BACKGROUND) ─── */}
      
      {/* 1. Ambient Golden Botanical Watermarks */}
      <div className="absolute -top-10 -right-12 w-64 h-64 opacity-15 pointer-events-none text-[#b89758] hidden sm:block">
        <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 100 100">
          <path d="M50 90 C30 70, 20 40, 45 10 C55 35, 75 45, 50 90 Z" />
          <path d="M48 90 Q65 60 85 50" />
          <path d="M47 70 Q30 55 15 50" />
          <circle cx="85" cy="50" fill="currentColor" r="2.5" />
          <circle cx="15" cy="50" fill="currentColor" r="2.5" />
        </svg>
      </div>

      <div className="absolute bottom-10 -left-16 w-60 h-60 opacity-15 pointer-events-none text-[#b89758] hidden sm:block">
        <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" strokeDasharray="3 5" />
          <path d="M25 45 Q50 20 75 45 Q50 80 25 45" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
        </svg>
      </div>

      {/* 2. Ambient Glowing Luxury Light Spheres */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#6c2e3e]/25 via-[#b89758]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#b89758]/20 via-[#6c2e3e]/15 to-transparent blur-3xl pointer-events-none" />

      {/* 3. Floating Celestial Stars */}
      <div className="absolute top-16 left-8 sm:left-16 text-[#8c5f1b] dark:text-[#fed488] pointer-events-none animate-subtle-float">
        <SketchStar className="w-5 h-5 text-[#8c5f1b] dark:text-[#fed488]" />
      </div>
      <div className="absolute top-24 right-10 sm:right-24 text-[#8c5f1b]/80 dark:text-[#fed488]/80 pointer-events-none animate-gentle-pulse">
        <SketchStar className="w-4 h-4 text-[#8c5f1b] dark:text-[#fed488]" />
      </div>
      <div className="absolute bottom-20 left-12 sm:left-28 text-[#8c5f1b]/70 dark:text-[#fed488]/70 pointer-events-none animate-gentle-pulse">
        <SketchStar className="w-6 h-6 text-[#8c5f1b] dark:text-[#fed488]" />
      </div>
      <div className="absolute bottom-28 right-8 sm:right-20 text-[#8c5f1b] dark:text-[#fed488] pointer-events-none animate-subtle-float">
        <SketchStar className="w-4 h-4 text-[#8c5f1b] dark:text-[#fed488]" />
      </div>

      {/* 4. Subtle Botanical Sprig Decoration */}
      <div className="absolute top-1/3 -right-6 opacity-20 pointer-events-none hidden lg:block rotate-12">
        <SketchBotanical className="w-20 h-20 text-[#8c5f1b]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#b89758]/15 border border-[#c48496] dark:border-[#b89758]/35 text-[#8c5f1b] dark:text-[#fed488] text-[11px] font-bold uppercase tracking-[0.2em] mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#8c5f1b] dark:text-[#fed488]" />
            <span>Auspicious Dates &amp; Muhurat</span>
          </div>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl text-[#6c2e3e] dark:text-white font-medium mb-2">
            Book Your Special Date Now
          </h2>

          {/* Hand-Drawn Wavy Underline Flourish */}
          <div className="flex justify-center my-2">
            <SketchWavyLine className="w-40 sm:w-56 h-2.5 text-[#8c5f1b]/40 dark:text-[#fed488]/80" />
          </div>

          <p className="text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] leading-relaxed mt-2 font-medium">
            Select your auspicious wedding or ceremony date below. Check real-time studio availability to secure your bridal reservation with {brand.founder || 'Khushi'}.
          </p>
        </div>

        {/* Calendar Card with Surrounding Decorative Luxury Frames */}
        <div className="relative group">
          {/* Decorative Offset Frame 1 (-1deg rotation) */}
          <div className="absolute inset-0 rounded-3xl border border-[#c48496]/70 dark:border-[#b89758]/30 -rotate-1 scale-101 pointer-events-none transition-transform duration-700 group-hover:-rotate-2" />
          
          {/* Decorative Offset Frame 2 (+1deg rotation) */}
          <div className="absolute inset-0 rounded-3xl border border-[#b89758]/50 dark:border-[#b89758]/20 rotate-1 scale-102 pointer-events-none transition-transform duration-700 group-hover:rotate-2" />

          {/* Corner Sparkle Stars */}
          <div className="absolute -top-3 -right-3 text-[#8c5f1b] dark:text-[#fed488] z-20 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-45">
            <SketchStar className="w-6 h-6 text-[#8c5f1b] dark:text-[#fed488]" />
          </div>
          <div className="absolute -bottom-3 -left-3 text-[#8c5f1b]/80 dark:text-[#fed488]/80 z-20 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-45">
            <SketchStar className="w-5 h-5 text-[#8c5f1b] dark:text-[#fed488]" />
          </div>

          {/* Main Calendar Card Body */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1d0e15]/95 border border-[#c48496] dark:border-[#b89758]/40 shadow-2xl backdrop-blur-md transition-colors duration-300">
            {/* Calendar Top Month Navigation */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#c48496]/40 dark:border-white/10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2.5 rounded-xl bg-[#faeaed] dark:bg-white/5 hover:bg-[#6c2e3e] hover:text-white dark:hover:bg-white/15 text-[#6c2e3e] dark:text-[#dfc3c9] dark:hover:text-white transition-colors cursor-pointer border border-[#c48496] dark:border-white/10 shadow-2xs"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#6c2e3e] dark:text-white font-medium tracking-wide">
                  {monthName}
                </h3>
                <span className="text-[10px] text-[#8c5f1b] dark:text-[#fed488] tracking-widest uppercase font-bold block mt-0.5">
                  Wedding Booking Season
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2.5 rounded-xl bg-[#faeaed] dark:bg-white/5 hover:bg-[#6c2e3e] hover:text-white dark:hover:bg-white/15 text-[#6c2e3e] dark:text-[#dfc3c9] dark:hover:text-white transition-colors cursor-pointer border border-[#c48496] dark:border-white/10 shadow-2xs"
                aria-label="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Auspicious Guidance Banner */}
            <div className="flex items-center justify-center gap-2 mb-6 p-2.5 rounded-xl bg-[#faeaed] dark:bg-[#6c2e3e]/30 border border-[#c48496] dark:border-[#b89758]/25 text-center text-xs text-[#382229] dark:text-[#dfc3c9] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#8c5f1b] dark:text-[#fed488] shrink-0" />
              <span>Click any wedding date to verify availability &amp; secure your doorstep vanity reservation.</span>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] sm:text-xs font-bold text-[#6c2e3e] dark:text-[#fed488] uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {dayCells}
            </div>

            {/* Selected Date Confirmation Banner */}
            {selectedDate && (
              <div className="mt-6 pt-5 border-t border-[#c48496]/40 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#fff8f9] dark:bg-[#12080d] border border-[#c48496] dark:border-[#b89758]/50 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center text-white shrink-0 shadow-md">
                    <CalendarCheck className="w-5 h-5 text-[#fed488]" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-[#6c2e3e] dark:text-[#fed488] uppercase tracking-wider font-semibold block">
                      Date Selected for Booking
                    </span>
                    <strong className="text-sm text-[#25181c] dark:text-white font-medium">
                      {formatDateFriendly(selectedDate)}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectDate && selectedDate) {
                      onSelectDate(selectedDate);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:opacity-95 hover:scale-105 active:scale-95 transition-all duration-300 text-center flex items-center justify-center gap-2 border border-[#fed488]/40 cursor-pointer"
                >
                  <span>Proceed to Reservation Form</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── BOOKED DATE INQUIRY MODAL / POPUP ─── */}
      {bookedModalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#1d0e15] border border-[#c48496] dark:border-[#fed488]/50 shadow-2xl p-6 sm:p-7 text-[#25181c] dark:text-[#fcecee] space-y-4">
            {/* Close Button */}
            <button
              onClick={() => setBookedModalDate(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#6c2e3e]/10 hover:bg-[#6c2e3e]/20 text-[#6c2e3e] dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center text-[#fed488] shadow-lg shrink-0">
                <Sparkles className="w-6 h-6 text-[#fed488]" />
              </div>
              <div>
                <span className="text-[10px] text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.2em] font-bold block">
                  Auspicious Wedding Date
                </span>
                <h3 className="font-['Playfair_Display'] text-xl text-[#6c2e3e] dark:text-white font-medium">
                  {formatDateFriendly(bookedModalDate.date)}
                </h3>
              </div>
            </div>

            {/* High-Converting Advisory Notice */}
            <div className="p-4 rounded-2xl bg-[#faeaed] dark:bg-[#2a131e] border border-[#c48496] dark:border-[#b89758]/30 space-y-2">
              <div className="flex items-center gap-2 text-[#6c2e3e] dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-[#8c5f1b] dark:text-[#fed488]" />
                <span>Confirmed Booking on this Date</span>
              </div>
              <p className="text-xs text-[#382229] dark:text-[#dfc3c9] leading-relaxed">
                This auspicious date already has a confirmed bridal event with our studio.
                {bookedModalDate.note && <span className="block mt-1 text-[#6c2e3e] dark:text-[#fed488] font-semibold">Note: {bookedModalDate.note}</span>}
              </p>
              <p className="text-xs text-[#25181c] dark:text-white/90 leading-relaxed font-medium pt-1 border-t border-[#c48496]/50 dark:border-white/10">
                ✨ However, depending on your ceremony timings (<span className="text-[#6c2e3e] dark:text-[#fed488] font-bold">morning vs. evening muhurat</span>) or venue location in {brand.primaryServiceArea || 'Siwan'}, {brand.founder || 'Khushi'} or our senior vanity team may still be able to accommodate you!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <a
                href={getWhatsAppEnquiryUrl(bookedModalDate.date)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25d366] hover:bg-[#20bd5a] text-white text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Enquire on WhatsApp for this Date</span>
              </a>

              {brand.phone && (
                <a
                  href={brand.phoneHref || `tel:${brand.phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#6c2e3e]/10 hover:bg-[#6c2e3e]/20 text-[#6c2e3e] dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-semibold uppercase tracking-wider border border-[#c48496] dark:border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#8c5f1b] dark:text-[#fed488]" />
                  <span>Call {brand.founder || 'Studio'} Directly ({brand.phoneDisplay || brand.phone})</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setBookedModalDate(null)}
                className="w-full py-2 text-center text-xs text-[#382229]/80 dark:text-[#dfc3c9]/70 hover:text-[#6c2e3e] dark:hover:text-white transition-colors cursor-pointer font-medium"
              >
                Choose Another Wedding Date
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
