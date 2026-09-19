import React, { useState } from 'react';
import { SERVICES } from '../data/makeupData';
import { ServiceItem } from '../types';
import { ServiceDetailModal } from './ServiceDetailModal';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Gem,
  Heart,
  PartyPopper,
  Sun,
  Flower2,
  FileText
} from 'lucide-react';
import {
  SketchBrush,
  SketchLipstick,
  SketchMirror,
  SketchCompact,
  SketchMascara,
  SketchPerfume,
  SketchStar,
  SketchWavyLine
} from './HandDrawnIllustrations';

interface ServicesProps {
  onBookService: (serviceId: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onBookService }) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const SERVICE_ICONS: Record<string, string> = {
    bridal: '/bridal-icon.jpg',
    engagement: '/engagement-icon.jpg',
    party: '/party-icon.jpg',
    haldi: '/haldi-icon.jpg',
    mehendi: '/mehendi-icon.jpg',
    occasion: '/occasion-icon.jpg',
  };

  const getServiceSketch = (service: ServiceItem, _index: number) => {
    const iconSrc = SERVICE_ICONS[service.id];
    if (iconSrc) {
      return (
        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-300">
          <img
            src={iconSrc}
            alt={`${service.title} icon`}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return <SketchBrush className="w-8 h-8 text-[#b89758]" />;
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'diamond':
        return <Gem className="w-4 h-4 text-[#b89758]" />;
      case 'favorite':
        return <Heart className="w-4 h-4 text-[#b89758]" />;
      case 'celebration':
        return <PartyPopper className="w-4 h-4 text-[#b89758]" />;
      case 'wb_sunny':
        return <Sun className="w-4 h-4 text-[#b89758]" />;
      case 'spa':
        return <Flower2 className="w-4 h-4 text-[#b89758]" />;
      default:
        return <FileText className="w-4 h-4 text-[#b89758]" />;
    }
  };

  return (
    <section id="services" className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#f7ecee] dark:bg-[#140b0f] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-[1px] w-6 bg-[#b89758]/50" />
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.25em] font-semibold">
              Artisanal Offerings
            </span>
            <span className="h-[1px] w-6 bg-[#b89758]/50" />
          </div>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight">
            Our Services
          </h2>

          <div className="my-2">
            <SketchWavyLine className="w-36 sm:w-48 h-2 text-[#b89758]/60 dark:text-[#fed488]/70" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] max-w-xl mx-auto leading-relaxed">
            Every look is sculpted around your face shape, natural skin undertone, and wedding wardrobe. Click on any service to explore detailed inclusions and reserve your date.
          </p>
        </div>

        {/* 6 Interactive Service Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="group relative p-6 rounded-3xl bg-[#fff9fa] dark:bg-[#1f1217] border border-[#b89758]/35 dark:border-[#b89758]/45 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedService(service);
                }
              }}
              aria-label={`View details for ${service.title}`}
            >
              {/* Subtle gold accent line at top that expands on hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#b89758]/30 group-hover:bg-[#b89758] transition-all duration-300" />

              {/* Background ambient star sparkle */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <SketchStar className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
              </div>

              <div>
                {/* Header row: Sketch icon + Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-2xl overflow-hidden">
                    {getServiceSketch(service, index)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#6c2e3e] dark:text-[#fed488] font-medium">
                      {service.price}
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#b89758] dark:text-[#dfc3c9] font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {service.duration}
                    </span>
                  </div>
                </div>

                {/* Service Title */}
                <div className="flex items-center gap-2 mb-1.5">
                  {getServiceIcon(service.iconName)}
                  <h3 className="font-['Playfair_Display'] text-xl text-[#6c2e3e] dark:text-[#fcecee] font-medium group-hover:text-[#7a3b4d] dark:group-hover:text-[#fed488] transition-colors">
                    {service.title}
                  </h3>
                </div>

                {/* Service Tagline from Prompt */}
                <p className="font-['Playfair_Display'] text-xs text-[#b89758] dark:text-[#fed488] italic mb-2.5">
                  “{service.tagline}”
                </p>

                {/* Service Short Description */}
                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#5a454b] dark:text-[#d3bcc2] leading-relaxed line-clamp-3">
                  {service.description}
                </p>
              </div>

              {/* Card Footer: Click hint */}
              <div className="mt-5 pt-3.5 border-t border-[#b89758]/20 dark:border-[#b89758]/30 flex items-center justify-between text-xs text-[#6c2e3e] dark:text-[#fed488] font-medium">
                <span className="font-['Caveat'] text-sm text-[#b89758] dark:text-[#fed488]">
                  Click to inspect &amp; book
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200 text-[#6c2e3e] dark:text-[#fed488] font-semibold text-[11px] uppercase tracking-wider">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onBookService={onBookService}
      />
    </section>
  );
};
