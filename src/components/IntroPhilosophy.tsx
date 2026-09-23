import React from 'react';
import { useSiteContent } from '../context/ContentContext';
import { SketchStar, SketchBrush, SketchCompact } from './HandDrawnIllustrations';

export const IntroPhilosophy: React.FC = () => {
  const { content } = useSiteContent();
  const philosophy = content.brand.philosophy || {
    badge: 'studio philosophy',
    quote: '“You are already beautiful. Makeup simply brings your beauty forward.”',
    description: 'Khushi believes makeup should enhance the beauty you already have, not hide who you are. Every look is built around your face, your features and your occasion — so what people notice, first and always, is you.'
  };

  return (
    <section className="w-full px-4 sm:px-6 py-8 sm:py-11 bg-[#f5e4e8]/60 dark:bg-[#180e13]/60 backdrop-blur-xs border-y border-[#dca8b5]/40 dark:border-[#b89758]/35 relative overflow-hidden transition-colors duration-300">
      {/* Background delicate sketches */}
      <div className="absolute top-4 left-6 opacity-20 dark:opacity-30 text-[#b89758] dark:text-[#fed488] pointer-events-none hidden md:block">
        <SketchBrush className="w-10 h-10" />
      </div>
      <div className="absolute bottom-4 right-6 opacity-20 dark:opacity-30 text-[#b89758] dark:text-[#fed488] pointer-events-none hidden md:block">
        <SketchCompact className="w-10 h-10" />
      </div>

      <div className="max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Editorial Subtitle */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="h-[1px] w-5 bg-[#b89758]/40" />
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.25em] font-semibold">
            The Artist’s Creed
          </span>
          <span className="h-[1px] w-5 bg-[#b89758]/40" />
        </div>

        {/* Hand-drawn Atelier Badge with blooming surrounding shapes on hover/active */}
        <div className="relative group max-w-xl mx-auto my-1 w-full">
          {/* Dual rotated accent frames on hover / active / click */}
          <div className="absolute -inset-2 rounded-tl-3xl rounded-br-3xl border border-[#b89758]/50 rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-102 group-hover:rotate-2 transition-all duration-500 pointer-events-none" />
          <div className="absolute -inset-2 rounded-tl-3xl rounded-br-3xl border border-[#c48496]/70 dark:border-[#fed488]/40 -rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-103 group-hover:-rotate-2 transition-all duration-500 pointer-events-none" />
          {/* Ambient radial aura glow on hover */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#6c2e3e]/15 via-[#dca8b5]/15 to-[#b89758]/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          {/* Corner celestial sparkle stars */}
          <div className="absolute -top-2.5 -right-2.5 text-[#6c2e3e] dark:text-[#fed488] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 pointer-events-none z-20">
            <svg className="w-5 h-5 drop-shadow-[0_0_6px_rgba(254,212,136,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
          <div className="absolute -bottom-2 -left-2 text-[#dca8b5] dark:text-[#b89758] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 group-hover:-rotate-45 transition-all duration-500 pointer-events-none z-20">
            <svg className="w-4 h-4 drop-shadow-[0_0_6px_rgba(254,212,136,0.4)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>

          <div className="relative px-6 py-6 sm:py-7 bg-white/95 dark:bg-[#201319]/90 backdrop-blur-xs rounded-tl-3xl rounded-br-3xl border border-[#c48496] dark:border-[#b89758]/45 shadow-sm transition-transform duration-500 group-hover:-translate-y-1">
            <span className="font-['Caveat'] text-[#8c5f1b] dark:text-[#fed488] font-bold text-base sm:text-lg leading-none absolute -top-3 left-6 px-2 bg-white dark:bg-[#201319] border border-[#c48496] dark:border-[#dca8b5]/60 rounded-full">
              {philosophy.badge}
            </span>

            <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl md:text-3xl text-[#6c2e3e] dark:text-[#f8d7df] italic font-normal leading-relaxed mb-3">
              {philosophy.quote}
            </h2>

            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] font-normal leading-relaxed max-w-lg mx-auto">
              {philosophy.description}
            </p>

            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b89758] dark:bg-[#fed488]" />
              <span className="w-12 h-[1px] bg-[#b89758]/40" />
              <SketchStar className="w-3.5 h-3.5 text-[#b89758] dark:text-[#fed488]" />
              <span className="w-12 h-[1px] bg-[#b89758]/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#b89758] dark:bg-[#fed488]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
