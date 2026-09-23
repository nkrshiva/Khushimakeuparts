import React from 'react';
import { useSiteContent } from '../context/ContentContext';
import { Check, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

interface BridalPackagesProps {
  onAskPackage: (packageId: string) => void;
}

export const BridalPackages: React.FC<BridalPackagesProps> = ({ onAskPackage }) => {
  const { content } = useSiteContent();
  const BRIDAL_PACKAGES = (content.bridalPackages || []).filter((pkg) => pkg.hidden !== true);
  return (
    <section className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#f5e4e8]/60 dark:bg-[#140b0f]/60 backdrop-blur-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-8">
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.2em] font-bold">
            Atelier Tiers
          </span>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Bridal Packages
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-28 sm:w-36 h-2 text-[#8c5f1b]/40 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] mt-1 max-w-xl font-medium">
            Curated suites created so every bride finds her quintessential match for her auspicious ceremony.
          </p>
        </div>

        {/* 3 Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {BRIDAL_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1f1217] flex flex-col justify-between transition-all duration-500 ease-out shadow-xs hover:shadow-2xl hover:-translate-y-2.5 group ${
                pkg.isRecommended
                  ? 'border-2 border-[#b89758] shadow-md'
                  : 'border border-[#c48496] dark:border-[#b89758]/45'
              }`}
            >
              {/* Blooming decorative outline frames on hover / active / click */}
              <div
                className={`absolute -inset-2 rounded-3xl border rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-102 group-hover:rotate-2 transition-all duration-500 pointer-events-none ${
                  pkg.isRecommended
                    ? 'border-[#b89758]/70 dark:border-[#fed488]/70'
                    : 'border-[#c48496]/70 dark:border-[#b89758]/60'
                }`}
              />
              <div
                className={`absolute -inset-2 rounded-3xl border -rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-103 group-hover:-rotate-2 transition-all duration-500 pointer-events-none ${
                  pkg.isRecommended
                    ? 'border-[#fed488]/50 dark:border-[#b89758]/50'
                    : 'border-[#b89758]/50 dark:border-[#fed488]/40'
                }`}
              />
              {/* Ambient radial aura glow on hover */}
              <div
                className={`absolute inset-0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                  pkg.isRecommended
                    ? 'bg-gradient-to-tr from-[#b89758]/25 via-[#fed488]/20 to-[#6c2e3e]/20'
                    : 'bg-gradient-to-tr from-[#6c2e3e]/15 via-[#dca8b5]/15 to-[#b89758]/15'
                }`}
              />
              {/* Corner celestial sparkle stars */}
              <div className="absolute -top-3 -right-3 text-[#6c2e3e] dark:text-[#fed488] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-110 group-hover:rotate-45 transition-all duration-500 pointer-events-none z-20">
                <svg className="w-5 h-5 drop-shadow-[0_0_6px_rgba(254,212,136,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                </svg>
              </div>
              <div className="absolute -bottom-2.5 -left-2.5 text-[#c48496] dark:text-[#b89758] opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 group-hover:-rotate-45 transition-all duration-500 pointer-events-none z-20">
                <svg className="w-4 h-4 drop-shadow-[0_0_6px_rgba(254,212,136,0.4)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                </svg>
              </div>

              {/* Recommended Badge */}
              {pkg.isRecommended && (
                <div className="absolute top-0 right-0 bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-[9px] px-3.5 py-1 rounded-bl-2xl uppercase tracking-wider font-semibold flex items-center gap-1 shadow-xs group-hover:scale-105 transition-transform duration-300 z-10">
                  <SketchStar className="w-3 h-3 text-[#fed488] animate-spin-slow" />
                  Recommended
                </div>
              )}

              <div className="relative z-10">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#6c2e3e] dark:text-[#f8d7df] font-medium group-hover:text-[#b89758] dark:group-hover:text-[#fed488] transition-colors duration-300">
                    {pkg.name}
                  </h3>
                </div>

                <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-widest block mb-2 font-bold">
                  {pkg.tier}
                </span>

                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#382229] dark:text-[#dfc3c9] mb-5 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#25181c] dark:text-[#fcecee] mb-6">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      {pkg.isRecommended ? (
                        <CheckCircle2 className="w-4 h-4 text-[#6c2e3e] dark:text-[#fed488] shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <Check className="w-4 h-4 text-[#8c5f1b] dark:text-[#fed488] shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                      )}
                      <span className="leading-snug text-[#25181c] dark:text-[#e0cad0] font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Package CTA as explicitly requested */}
              <div className="pt-4 border-t border-[#c48496]/40 dark:border-[#b89758]/35">
                <button
                  onClick={() => onAskPackage(pkg.id)}
                  className={`w-full py-3.5 px-4 rounded-xl font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 shadow-xs hover:shadow-md ${
                    pkg.isRecommended
                      ? 'bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] border border-[#6c2e3e]/40'
                      : 'bg-[#faeaed] dark:bg-[#2c1722] text-[#6c2e3e] dark:text-[#fed488] border border-[#c48496] hover:bg-[#f3d2d9] dark:hover:bg-[#381e2b] shadow-2xs'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-[#fed488]" />
                  Ask About Bridal Packages
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
