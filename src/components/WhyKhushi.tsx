import React from 'react';
import { useSiteContent } from '../context/ContentContext';
import { WHY_KHUSHI_BENEFITS as DEFAULT_BENEFITS } from '../data/makeupData';
import {
  SketchBrush,
  SketchPerfume,
  SketchLipstick,
  SketchCompact,
  SketchBotanical,
  SketchStar,
  SketchWavyLine
} from './HandDrawnIllustrations';

export const WhyKhushi: React.FC = () => {
  const { content } = useSiteContent();
  const { brand } = content;
  const benefits = (content.benefits || DEFAULT_BENEFITS).filter((b) => b.hidden !== true);
  const getHandDrawnIllustration = (index: number) => {
    switch (index) {
      case 0:
        return <SketchBrush className="w-8 h-8 text-[#b89758]" />;
      case 1:
        return <SketchPerfume className="w-8 h-8 text-[#b89758]" />;
      case 2:
        return <SketchLipstick className="w-8 h-8 text-[#b89758]" />;
      case 3:
        return <SketchBotanical className="w-8 h-8 text-[#b89758]" />;
      case 4:
        return <SketchCompact className="w-8 h-8 text-[#b89758]" />;
      default:
        return <SketchStar className="w-6 h-6 text-[#b89758]" />;
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#f5e4e8]/60 dark:bg-[#180e13]/60 backdrop-blur-xs border-t border-[#dca8b5]/40 dark:border-[#b89758]/35 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold">
              Philosophy In Practice
            </span>
            <SketchPerfume className="w-6 h-6 text-[#b89758] dark:text-[#fed488] animate-gentle-pulse" />
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Why Choose {brand.founder || 'Khushi'}
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-36 sm:w-48 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] font-medium mt-1 max-w-xl">
            Artisanal techniques, personalized care, and professional products designed to give you complete confidence on your most momentous day.
          </p>
        </div>

        {/* Benefits with Hand-Drawn Line Illustrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`relative p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/45 shadow-xs hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col justify-between group cursor-default ${
                index === 4 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Blooming decorative outline frames on hover / active / click */}
              <div className="absolute -inset-1.5 rounded-3xl border border-[#c48496]/70 dark:border-[#b89758]/60 rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-102 group-hover:rotate-2 transition-all duration-500 pointer-events-none" />
              <div className="absolute -inset-1.5 rounded-3xl border border-[#b89758]/50 dark:border-[#fed488]/40 -rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-103 group-hover:-rotate-2 transition-all duration-500 pointer-events-none" />
              {/* Ambient radial aura glow on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#6c2e3e]/15 via-[#dca8b5]/15 to-[#b89758]/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              {/* Corner celestial sparkle stars */}
              <div className="absolute -top-2.5 -right-2.5 text-[#6c2e3e] dark:text-[#fed488] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 pointer-events-none z-20">
                <svg className="w-5 h-5 drop-shadow-[0_0_6px_rgba(254,212,136,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                </svg>
              </div>
              <div className="absolute -bottom-2 -left-2 text-[#dca8b5] dark:text-[#b89758] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 group-hover:-rotate-45 transition-all duration-500 pointer-events-none z-20">
                <svg className="w-4 h-4 drop-shadow-[0_0_6px_rgba(254,212,136,0.3)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#faeaed] dark:bg-[#2a1720] border border-[#c48496] dark:border-[#b89758]/40 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 group-hover:border-[#b89758] transition-all duration-500 ease-out shadow-xs">
                    {getHandDrawnIllustration(index)}
                  </div>
                  <span className="font-['Caveat'] text-lg text-[#8c5f1b] dark:text-[#fed488] font-bold group-hover:scale-110 transition-transform duration-300">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-[#6c2e3e] dark:text-[#fff1f3] font-medium leading-snug group-hover:text-[#b89758] dark:group-hover:text-[#fed488] transition-colors duration-300">
                  {benefit.title}
                </h3>

                <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] mt-2 font-normal leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              <div className="relative z-10 mt-4 pt-3 border-t border-[#b89758]/20 dark:border-[#b89758]/25 flex items-center justify-between text-[11px] text-[#8c5f1b] dark:text-[#fed488] font-['Caveat'] text-sm font-semibold">
                <span>Handcrafted with care</span>
                <SketchStar className="w-3.5 h-3.5 text-[#b89758] dark:text-[#fed488] group-hover:rotate-90 group-hover:scale-125 transition-transform duration-500 ease-out" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
