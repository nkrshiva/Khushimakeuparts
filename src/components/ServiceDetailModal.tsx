import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Clock, Calendar, Sparkles } from 'lucide-react';
import { ServiceItem } from '../types';
import { SketchStar, SketchBrush } from './HandDrawnIllustrations';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookService,
}) => {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [service?.id, service?.imageUrl]);

  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!service) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [service, onClose]);

  if (!service || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
    >
      <div
        className="relative w-full max-w-lg my-auto bg-white dark:bg-[#1a0e14] rounded-3xl border-2 border-[#c48496] dark:border-[#b89758]/60 shadow-2xl p-5 sm:p-7 max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col overflow-hidden transition-all duration-300 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Sketch Accent */}
        <div className="absolute top-2 right-12 opacity-15 dark:opacity-25 text-[#8c5f1b] dark:text-[#fed488] pointer-events-none animate-gentle-pulse">
          <SketchBrush className="w-16 h-16" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-10 p-2 rounded-full text-[#6c2e3e] dark:text-[#f8d7df] hover:bg-[#faeaed] dark:hover:bg-[#2c1722] hover:rotate-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8c5f1b] cursor-pointer"
          aria-label="Close service details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="shrink-0 flex flex-col border-b border-[#c48496]/40 dark:border-[#b89758]/35 pb-3 sm:pb-4 mb-3 sm:mb-4 pr-8">
          {/* Icon + Meta row */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 shadow-xs border border-[#c48496]/40 dark:border-[#b89758]/25 bg-[#faeaed] dark:bg-[#281520]/50 flex items-center justify-center">
              {!imgError ? (
                <img
                  src={service.imageUrl || `/${service.id}-icon.jpg`}
                  alt={`${service.title} icon`}
                  className="w-full h-full object-cover image-soft-edge"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Sparkles className="w-6 h-6 text-[#8c5f1b] dark:text-[#fed488]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.2em] font-bold">
                  Bespoke Service
                </span>
                {service.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#fed488] text-[#5d4201] font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-wider font-semibold">
                    {service.badge}
                  </span>
                )}
              </div>
              <h3
                id="service-modal-title"
                className="font-['Playfair_Display'] text-xl sm:text-2xl lg:text-3xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal leading-tight"
              >
                {service.title}
              </h3>
            </div>
          </div>
          <p className="font-['Playfair_Display'] text-xs sm:text-sm text-[#8c5f1b] dark:text-[#fed488] italic mt-0.5">
            "{service.tagline}"
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain modal-scrollbar pr-1.5 sm:pr-2 space-y-3.5 sm:space-y-4 font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#25181c] dark:text-[#fcecee]">
          {/* Price and Duration strip */}
          <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#faeaed] dark:bg-[#25141d] border border-[#c48496]/40 dark:border-[#b89758]/40">
            <div>
              <span className="text-[10px] uppercase text-[#382229] dark:text-[#dfc3c9] block font-medium">Price</span>
              <span className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#6c2e3e] dark:text-[#fed488] font-medium">
                {service.price}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-[#382229] dark:text-[#dfc3c9] block font-medium">Session Duration</span>
              <span className="text-xs font-semibold text-[#8c5f1b] dark:text-[#fed488] flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
                {service.duration}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#382229] dark:text-[#dfc3c9] leading-relaxed">
            {service.description}
          </p>

          {/* Inclusions */}
          <div>
            <h4 className="font-['Playfair_Display'] text-sm text-[#6c2e3e] dark:text-[#f8d7df] font-medium mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8c5f1b] dark:text-[#fed488]" />
              What is included:
            </h4>
            <ul className="space-y-2">
              {service.inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[#25181c] dark:text-[#dfc3c9]">
                  <span className="w-4 h-4 rounded-full bg-[#faeaed] dark:bg-[#2c1722] text-[#6c2e3e] dark:text-[#fed488] flex items-center justify-center shrink-0 mt-0.5 border border-[#c48496]/40">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-[#faeaed] dark:bg-[#24131b] text-[#382229] dark:text-[#dfc3c9] text-[11px] leading-relaxed border border-[#c48496]/50 dark:border-[#b89758]/30">
            <strong>Note:</strong> Home-service is available across Siwan. Travel charges outside Siwan are arranged based on distance.
          </div>
        </div>

        {/* Modal Action CTA */}
        <div className="shrink-0 mt-4 pt-3.5 border-t border-[#c48496]/40 dark:border-[#b89758]/35 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              onBookService(service.id);
              onClose();
            }}
            className="flex-1 py-3 px-5 rounded-xl bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-semibold hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] hover:scale-102 active:scale-95 transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#fed488]" />
            Book This Service
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-[#faeaed] border border-[#c48496] dark:bg-[#28151f] text-[#6c2e3e] dark:text-[#f8d7df] font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-wider font-semibold hover:bg-[#edd4d9] dark:hover:bg-[#341b29] hover:scale-102 active:scale-95 transition-all duration-300 cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
