import React from 'react';
import { SketchStar, SketchBrush, SketchCompact } from './HandDrawnIllustrations';

export const IntroPhilosophy: React.FC = () => {
  return (
    <section className="w-full px-4 sm:px-6 py-8 sm:py-11 bg-[#fdf4f5] dark:bg-[#180e13] border-y border-[#b89758]/25 dark:border-[#b89758]/35 relative overflow-hidden transition-colors duration-300">
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
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.25em] font-semibold">
            The Artist’s Creed
          </span>
          <span className="h-[1px] w-5 bg-[#b89758]/40" />
        </div>

        {/* Hand-drawn Atelier Badge */}
        <div className="relative max-w-xl mx-auto my-1 px-6 py-6 sm:py-7 bg-[#fff9fa]/90 dark:bg-[#201319]/90 backdrop-blur-xs rounded-tl-3xl rounded-br-3xl border border-[#b89758]/35 dark:border-[#b89758]/45 shadow-xs">
          <span className="font-['Caveat'] text-[#b89758] dark:text-[#fed488] text-base sm:text-lg leading-none absolute -top-3 left-6 px-2 bg-[#fff9fa] dark:bg-[#201319] border-x border-[#b89758]/30 rounded-full">
            studio philosophy
          </span>

          <h2 className="font-['Playfair_Display'] text-xl sm:text-2xl md:text-3xl text-[#6c2e3e] dark:text-[#f8d7df] italic font-normal leading-relaxed mb-3">
            “You are already beautiful. Makeup simply brings your beauty forward.”
          </h2>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] leading-relaxed max-w-lg mx-auto">
            Khushi believes makeup should enhance the beauty you already have, not hide who you are. Every look is built around your face, your features and your occasion — so what people notice, first and always, is you.
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
    </section>
  );
};
