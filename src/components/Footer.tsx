import React from 'react';
import { useSiteContent } from '../context/ContentContext';
import { Phone, MapPin, Instagram, Heart, ArrowUp } from 'lucide-react';
import { SketchStar, SketchBotanical } from './HandDrawnIllustrations';

interface FooterProps {
  onScrollToTop: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onScrollToTop,
  onNavigateSection,
}) => {
  const { content, isModuleEnabled } = useSiteContent();
  const { brand } = content;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1b1215] dark:bg-[#0e070a] text-[#f5e8eb] pt-12 pb-8 px-4 sm:px-6 border-t border-[#b89758]/30 dark:border-[#b89758]/40 relative overflow-hidden transition-colors duration-300">
      {/* Delicate background watermark */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 text-[#b89758] pointer-events-none">
        <svg fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10 items-start">
          {/* Brand Info & Monogram */}
          <div className="md:col-span-5 flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#b89758]/50 bg-black p-0.5 shadow-sm shrink-0">
                <img
                  src={brand.logoUrl}
                  alt="Khushi Makeup Arts Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-['Playfair_Display'] text-xl text-white font-medium block">
                  {brand.name}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#fed488] uppercase tracking-[0.2em] font-semibold">
                  {brand.subtitle}
                </span>
              </div>
            </div>

            <p className="font-['Playfair_Display'] text-sm text-[#fed488]/90 italic max-w-sm mb-3">
              “{brand.tagline}”
            </p>

            <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#dfc3c9] max-w-sm leading-relaxed">
              Enhancing natural feminine grace with long-lasting HD formulations, personalized bone structure contouring, and doorstep luxury.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3 flex flex-col items-start text-left font-['Plus_Jakarta_Sans'] text-xs">
            <span className="font-['Plus_Jakarta_Sans'] text-[11px] uppercase tracking-widest text-[#fed488] font-semibold mb-3">
              Explore Atelier
            </span>
            <ul className="space-y-2 text-[#dfc3c9]">
              {content.sectionsVisibility?.services !== false && (
                <li>
                  <button
                    onClick={() => onNavigateSection('services')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Bespoke Services
                  </button>
                </li>
              )}
              {content.sectionsVisibility?.portfolio !== false && isModuleEnabled('bridalPortfolio') && (
                <li>
                  <button
                    onClick={() => onNavigateSection('lookbook-portfolio')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Curated Portfolio
                  </button>
                </li>
              )}
              {content.sectionsVisibility?.aboutStory !== false && (
                <li>
                  <button
                    onClick={() => onNavigateSection('about-khushi')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    About {brand.founder || 'Khushi'}
                  </button>
                </li>
              )}
              {content.sectionsVisibility?.pricing !== false && (
                <li>
                  <button
                    onClick={() => onNavigateSection('pricing')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Service Pricing
                  </button>
                </li>
              )}
              {content.sectionsVisibility?.bridalPackages !== false && isModuleEnabled('bridalPackages') && (
                <li>
                  <button
                    onClick={() => onNavigateSection('bridal-packages')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Bridal Packages
                  </button>
                </li>
              )}
              {content.sectionsVisibility?.testimonials !== false && isModuleEnabled('reviewsModeration') && (
                <li>
                  <button
                    onClick={() => onNavigateSection('bride-testimonials')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Bride Reviews
                  </button>
                </li>
              )}
              {content.sectionsVisibility?.faqs !== false && (
                <li>
                  <button
                    onClick={() => onNavigateSection('faq')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Client FAQ
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact & Location Details */}
          <div className="md:col-span-4 flex flex-col items-start text-left font-['Plus_Jakarta_Sans'] text-xs">
            <span className="font-['Plus_Jakarta_Sans'] text-[11px] uppercase tracking-widest text-[#fed488] font-semibold mb-3">
              Contact &amp; Studio
            </span>
            <ul className="space-y-3 text-[#dfc3c9]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#fed488] shrink-0 mt-0.5" />
                {brand.googleMapsUrl ? (
                  <a
                    href={brand.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors underline decoration-[#fed488]/40 hover:decoration-white flex items-center gap-1.5"
                  >
                    <span>{brand.location}</span>
                    <span className="text-[10px] text-[#fed488] font-semibold">(View Map)</span>
                  </a>
                ) : (
                  <span>{brand.location}</span>
                )}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#fed488] shrink-0" />
                <a
                  href={brand.phoneHref}
                  className="hover:text-white transition-colors font-medium"
                >
                  {brand.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-[#fed488] shrink-0" />
                <a
                  href={brand.instagramProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-medium"
                >
                  {brand.instagram}
                </a>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between">
              <span className="font-['Caveat'] text-base text-[#fed488]">
                Doorstep vanity across Bihar
              </span>
              <button
                onClick={onScrollToTop}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                aria-label="Scroll back to top"
              >
                <span>Top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright & Hand-drawn Flourish */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#dfc3c9]/80 font-['Plus_Jakarta_Sans'] gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center gap-2">
            <SketchStar className="w-3 h-3 text-[#fed488]" />
            <span>
              &copy; {currentYear} {brand.name}. All rights reserved.
            </span>
            <span className="text-white/20">|</span>
            <a
              href="#platform"
              className="text-[#fed488]/80 hover:text-[#fed488] transition-colors underline decoration-[#fed488]/30 hover:decoration-[#fed488]"
              title="Atelier Platform Engine"
            >
              Atelier Platform
            </a>
          </div>

          <div className="flex items-center gap-1.5 font-['Caveat'] text-sm text-[#fed488]">
            <span>Crafted with passion for authentic beauty</span>
            <Heart className="w-3 h-3 fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
};
