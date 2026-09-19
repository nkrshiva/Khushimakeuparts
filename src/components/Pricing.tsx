import React from 'react';
import { SERVICES } from '../data/makeupData';
import { Calendar, Info, Clock, ArrowRight } from 'lucide-react';
import { SketchBrush, SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

interface PricingProps {
  onBookService: (serviceId: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onBookService }) => {
  return (
    <section id="pricing" className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#fdf4f5] dark:bg-[#180e13] border-y border-[#b89758]/20 dark:border-[#b89758]/35 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold">
              Artisanal Menu
            </span>
            <SketchBrush className="w-6 h-6 text-[#6c2e3e] dark:text-[#fed488]" />
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Bespoke Services &amp; Pricing
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-40 sm:w-56 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] mt-1 max-w-xl">
            Transparent couture pricing with clear inclusions. Every rate reflects personalized care, hygienic tool kits, and dedicated time on your auspicious day.
          </p>
        </div>

        {/* Pricing Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SERVICES.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-[#fff9fa] dark:bg-[#1f1217] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between border border-[#b89758]/35 dark:border-[#b89758]/45 group"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-[#6c2e3e] dark:text-[#f8d7df] font-medium">
                      {item.title}
                    </h3>
                    <p className="font-['Playfair_Display'] text-xs text-[#b89758] dark:text-[#fed488] italic">
                      “{item.tagline}”
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-3">
                    <span className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#6c2e3e] dark:text-[#fed488] font-semibold">
                      {item.price}
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#b89758] dark:text-[#dfc3c9] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </span>
                  </div>
                </div>

                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#5a454b] dark:text-[#dfc3c9] mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#b89758]/20 dark:border-[#b89758]/35 flex items-center justify-between">
                <span className="font-['Caveat'] text-sm text-[#b89758] dark:text-[#fed488]">
                  Siwan Doorstep Vanity
                </span>
                <button
                  onClick={() => onBookService(item.id)}
                  className="py-2 px-4 rounded-xl bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-[11px] uppercase tracking-wider font-semibold hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3 h-3 text-[#fed488]" />
                  Enquire &amp; Book
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Travel Note as required by prompt */}
        <div className="mt-6 p-4 rounded-2xl bg-[#f3e2e5] dark:bg-[#25141d] flex items-start gap-3 border border-[#b89758]/35 dark:border-[#b89758]/45 max-w-2xl mx-auto shadow-2xs">
          <Info className="w-5 h-5 text-[#b89758] dark:text-[#fed488] shrink-0 mt-0.5" />
          <div className="text-left font-['Plus_Jakarta_Sans'] text-xs text-[#5a454b] dark:text-[#dfc3c9] leading-relaxed">
            <strong className="text-[#6c2e3e] dark:text-[#fed488]">Important Note:</strong> Travel charges are not included. Home-service makeup is available across Siwan. Travel outside Siwan can be arranged depending on booking requirements and distance.
          </div>
        </div>
      </div>
    </section>
  );
};
