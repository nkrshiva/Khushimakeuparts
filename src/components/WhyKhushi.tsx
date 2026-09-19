import React from 'react';
import { WHY_KHUSHI_BENEFITS } from '../data/makeupData';
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
    <section className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#fdf4f5] dark:bg-[#180e13] border-t border-[#b89758]/20 dark:border-[#b89758]/35 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold">
              Philosophy In Practice
            </span>
            <SketchPerfume className="w-6 h-6 text-[#b89758] dark:text-[#fed488]" />
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Why Choose Khushi
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-36 sm:w-48 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] mt-1 max-w-xl">
            Artisanal techniques, personalized care, and professional products designed to give you complete confidence on your most momentous day.
          </p>
        </div>

        {/* 5 Benefits with Hand-Drawn Line Illustrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {WHY_KHUSHI_BENEFITS.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`p-5 sm:p-6 rounded-3xl bg-[#fff9fa] dark:bg-[#1f1217] border border-[#b89758]/30 dark:border-[#b89758]/45 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group ${
                index === 4 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#f7ecee] dark:bg-[#2a1720] border border-[#b89758]/30 dark:border-[#b89758]/40 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getHandDrawnIllustration(index)}
                  </div>
                  <span className="font-['Caveat'] text-lg text-[#b89758] dark:text-[#fed488]">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="font-['Playfair_Display'] text-lg sm:text-xl text-[#6c2e3e] dark:text-[#f8d7df] font-medium leading-snug">
                  {benefit.title}
                </h3>

                <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] mt-2 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#b89758]/15 dark:border-[#b89758]/25 flex items-center justify-between text-[11px] text-[#b89758] dark:text-[#fed488] font-['Caveat'] text-sm">
                <span>Handcrafted with care</span>
                <SketchStar className="w-3 h-3 text-[#b89758] dark:text-[#fed488]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
