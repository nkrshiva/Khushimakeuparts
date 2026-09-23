import React, { useState } from 'react';
import { useSiteContent } from '../context/ContentContext';
import { ServiceItem } from '../types';
import { ServiceDetailModal } from './ServiceDetailModal';
import { Calendar, Clock, Info, Sparkles } from 'lucide-react';
import { SketchBrush, SketchWavyLine } from './HandDrawnIllustrations';

interface ServicesProps {
  onBookService: (serviceId: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onBookService }) => {
  const { content } = useSiteContent();
  const SERVICES = (content.services || []).filter((s) => s.hidden !== true);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  return (
    <section
      id="services"
      className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#f7ecee]/40 dark:bg-[#180e13]/40 backdrop-blur-xs border-y border-[#c48496]/60 dark:border-[#b89758]/35 transition-colors duration-300 relative scroll-mt-20"
    >
      {/* Anchor for backward compatibility with #pricing links */}
      <div id="pricing" className="absolute -top-24 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header (Matching Artisanal Menu - Bespoke Services & Pricing) */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.2em] font-bold">
              Artisanal Menu
            </span>
            <SketchBrush className="w-6 h-6 text-[#6c2e3e] dark:text-[#fed488]" />
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Our Services &amp; Pricing
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-40 sm:w-56 h-2 text-[#8c5f1b]/40 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] mt-1 max-w-xl leading-relaxed">
            Transparent couture pricing with clear inclusions. Every rate reflects personalized care, hygienic tool kits, and dedicated time on your auspicious day.
          </p>
        </div>

        {/* 6 Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SERVICES.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedService(item)}
              className="relative group p-5 rounded-3xl bg-white dark:bg-[#1f1217] shadow-xs hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between border border-[#c48496] dark:border-[#b89758]/45 cursor-pointer"
            >
              {/* Blooming decorative outline frames on hover / active / click */}
              <div className="absolute -inset-1.5 rounded-3xl border border-[#c48496]/80 dark:border-[#b89758]/60 rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-102 group-hover:rotate-2 transition-all duration-500 pointer-events-none" />
              <div className="absolute -inset-1.5 rounded-3xl border border-[#b89758]/50 dark:border-[#fed488]/40 -rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-103 group-hover:-rotate-2 transition-all duration-500 pointer-events-none" />
              {/* Ambient radial aura glow on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#6c2e3e]/15 via-[#dca8b5]/15 to-[#b89758]/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              {/* Corner celestial sparkle stars */}
              <div className="absolute -top-2.5 -right-2.5 text-[#6c2e3e] dark:text-[#fed488] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 pointer-events-none z-20">
                <svg className="w-5 h-5 drop-shadow-[0_0_6px_rgba(254,212,136,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                </svg>
              </div>
              <div className="absolute -bottom-2 -left-2 text-[#c48496] dark:text-[#b89758] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 group-hover:-rotate-45 transition-all duration-500 pointer-events-none z-20">
                <svg className="w-4 h-4 drop-shadow-[0_0_6px_rgba(254,212,136,0.3)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Service Icon Photo with soft blended edges */}
                    <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden shrink-0 shadow-xs border border-[#c48496]/50 dark:border-[#b89758]/25 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 relative bg-[#faeaed] dark:bg-[#281520]/50 flex items-center justify-center">
                      <img
                        src={item.imageUrl || `/${item.id}-icon.jpg`}
                        alt={`${item.title} icon`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 image-soft-edge relative z-10"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <Sparkles className="w-5 h-5 text-[#8c5f1b] dark:text-[#fed488] absolute z-0 opacity-60 pointer-events-none" />
                    </div>
                    <div className="min-w-0">
                      {item.badge && (
                        <span className="inline-block px-2 py-0.5 mb-1 rounded-full bg-[#fed488] text-[#5d4201] font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-wider font-semibold">
                          {item.badge}
                        </span>
                      )}
                      <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-[#6c2e3e] dark:text-[#f8d7df] font-medium group-hover:text-[#7a3b4d] dark:group-hover:text-[#fed488] transition-colors duration-300 truncate">
                        {item.title}
                      </h3>
                      <p className="font-['Playfair_Display'] text-xs text-[#8c5f1b] dark:text-[#fed488] italic mt-0.5 truncate">
                        “{item.tagline}”
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#6c2e3e] dark:text-[#fed488] font-semibold group-hover:scale-105 transition-transform duration-300 origin-right">
                      {item.price}
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8c5f1b] dark:text-[#dfc3c9] flex items-center gap-1 mt-0.5 font-medium">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </span>
                  </div>
                </div>

                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#382229] dark:text-[#dfc3c9] mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="relative z-10 mt-5 pt-3 border-t border-[#c48496]/30 dark:border-[#b89758]/35 flex items-center justify-between">
                <span className="font-['Caveat'] text-sm text-[#8c5f1b] dark:text-[#fed488] font-semibold group-hover:underline">
                  Siwan Doorstep Vanity
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookService(item.id);
                  }}
                  className="py-2 px-4 rounded-xl bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-[11px] uppercase tracking-wider font-semibold hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] hover:scale-105 active:scale-95 transition-all duration-300 shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3 h-3 text-[#fed488]" />
                  Enquire &amp; Book
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Travel Note (matching reference screenshot) */}
        <div className="relative group mt-6 p-4 rounded-2xl bg-white dark:bg-[#25141d] flex items-start gap-3 border border-[#c48496] dark:border-[#b89758]/45 max-w-2xl mx-auto shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
          <div className="absolute -inset-1 rounded-2xl border border-[#b89758]/40 rotate-0.5 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-101 transition-all duration-500 pointer-events-none" />
          <Info className="w-5 h-5 text-[#8c5f1b] dark:text-[#fed488] shrink-0 mt-0.5 relative z-10" />
          <div className="text-left font-['Plus_Jakarta_Sans'] text-xs text-[#382229] dark:text-[#dfc3c9] leading-relaxed relative z-10">
            <strong className="text-[#6c2e3e] dark:text-[#fed488]">Important Note:</strong> Travel charges are not included. Home-service makeup is available across Siwan. Travel outside Siwan can be arranged depending on booking requirements and distance.
          </div>
        </div>
      </div>

      {/* Service Detail Modal for full kit inclusions */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onBookService={onBookService}
      />
    </section>
  );
};
