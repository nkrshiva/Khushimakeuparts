import React, { useEffect } from 'react';
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
  // ESC key listener & body scroll lock
  useEffect(() => {
    if (!service) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [service, onClose]);

  if (!service) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-[#fff9fa] dark:bg-[#1a0e14] rounded-3xl border-2 border-[#b89758]/50 dark:border-[#b89758]/60 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Sketch Accent */}
        <div className="absolute top-2 right-12 opacity-15 dark:opacity-25 text-[#b89758] dark:text-[#fed488] pointer-events-none">
          <SketchBrush className="w-16 h-16" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6c2e3e] dark:text-[#f8d7df] hover:bg-[#f3e2e5] dark:hover:bg-[#2c1722] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b89758]"
          aria-label="Close service details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col border-b border-[#b89758]/20 dark:border-[#b89758]/35 pb-4 mb-4 pr-8">
          {/* Icon + Meta row */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-md">
              <img
                src={`/${service.id}-icon.jpg`}
                alt={`${service.title} icon`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold">
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
                className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal"
              >
                {service.title}
              </h3>
            </div>
          </div>
          <p className="font-['Playfair_Display'] text-sm text-[#b89758] dark:text-[#fed488] italic mt-1">
            "{service.tagline}"
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#25181c] dark:text-[#fcecee]">
          {/* Price and Duration strip */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fdf4f5] dark:bg-[#25141d] border border-[#b89758]/30 dark:border-[#b89758]/40">
            <div>
              <span className="text-[10px] uppercase text-[#5a454b] dark:text-[#dfc3c9] block">Price</span>
              <span className="font-['Playfair_Display'] text-2xl text-[#6c2e3e] dark:text-[#fed488] font-medium">
                {service.price}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-[#5a454b] dark:text-[#dfc3c9] block">Session Duration</span>
              <span className="text-xs font-semibold text-[#b89758] dark:text-[#fed488] flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
                {service.duration}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#5a454b] dark:text-[#dfc3c9] leading-relaxed">
            {service.description}
          </p>

          {/* Inclusions */}
          <div>
            <h4 className="font-['Playfair_Display'] text-sm text-[#6c2e3e] dark:text-[#f8d7df] font-medium mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
              What is included:
            </h4>
            <ul className="space-y-2">
              {service.inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[#5a454b] dark:text-[#dfc3c9]">
                  <span className="w-4 h-4 rounded-full bg-[#f3e2e5] dark:bg-[#2c1722] text-[#6c2e3e] dark:text-[#fed488] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-[#f3e2e5]/80 dark:bg-[#24131b] text-[#5a454b] dark:text-[#dfc3c9] text-[11px] leading-relaxed border border-[#dfc3c9] dark:border-[#b89758]/30">
            <strong>Note:</strong> Home-service is available across Siwan. Travel charges outside Siwan are arranged based on distance.
          </div>
        </div>

        {/* Modal Action CTA */}
        <div className="mt-5 pt-4 border-t border-[#b89758]/25 dark:border-[#b89758]/35 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onBookService(service.id);
              onClose();
            }}
            className="flex-1 py-3 px-5 rounded-xl bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-semibold hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#fed488]" />
            Book This Service
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-[#f3e2e5] dark:bg-[#28151f] text-[#6c2e3e] dark:text-[#f8d7df] font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-wider font-medium hover:bg-[#edd4d9] dark:hover:bg-[#341b29] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
