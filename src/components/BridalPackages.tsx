import React from 'react';
import { BRIDAL_PACKAGES } from '../data/makeupData';
import { Check, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import { SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

interface BridalPackagesProps {
  onAskPackage: (packageId: string) => void;
}

export const BridalPackages: React.FC<BridalPackagesProps> = ({ onAskPackage }) => {
  return (
    <section className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#f7ecee] dark:bg-[#140b0f] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-8">
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold">
            Atelier Tiers
          </span>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Bridal Packages
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-28 sm:w-36 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] mt-1 max-w-xl">
            Curated suites created so every bride finds her quintessential match for her auspicious ceremony.
          </p>
        </div>

        {/* 3 Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {BRIDAL_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative p-6 sm:p-7 rounded-3xl bg-[#fff9fa] dark:bg-[#1f1217] flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-lg ${
                pkg.isRecommended
                  ? 'border-2 border-[#b89758] shadow-md -translate-y-1'
                  : 'border border-[#b89758]/35 dark:border-[#b89758]/45'
              }`}
            >
              {/* Recommended Badge */}
              {pkg.isRecommended && (
                <div className="absolute top-0 right-0 bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-[9px] px-3.5 py-1 rounded-bl-2xl uppercase tracking-wider font-semibold flex items-center gap-1 shadow-xs">
                  <SketchStar className="w-3 h-3 text-[#fed488]" />
                  Recommended
                </div>
              )}

              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#6c2e3e] dark:text-[#f8d7df] font-medium">
                    {pkg.name}
                  </h3>
                </div>

                <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#b89758] dark:text-[#fed488] uppercase tracking-widest block mb-2 font-semibold">
                  {pkg.tier}
                </span>

                <p className="font-['Plus_Jakarta_Sans'] text-xs text-[#5a454b] dark:text-[#dfc3c9] mb-5 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#25181c] dark:text-[#fcecee] mb-6">
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      {pkg.isRecommended ? (
                        <CheckCircle2 className="w-4 h-4 text-[#6c2e3e] dark:text-[#fed488] shrink-0 mt-0.5" />
                      ) : (
                        <Check className="w-4 h-4 text-[#b89758] dark:text-[#fed488] shrink-0 mt-0.5" />
                      )}
                      <span className="leading-snug text-[#5a454b] dark:text-[#e0cad0] font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Package CTA as explicitly requested */}
              <div className="pt-4 border-t border-[#b89758]/20 dark:border-[#b89758]/35">
                <button
                  onClick={() => onAskPackage(pkg.id)}
                  className={`w-full py-3.5 px-4 rounded-xl font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-semibold text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    pkg.isRecommended
                      ? 'bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] shadow-md border border-[#6c2e3e]/40 active:scale-98'
                      : 'bg-[#f7ecee] dark:bg-[#2c1722] text-[#6c2e3e] dark:text-[#fed488] border border-[#b89758]/40 hover:bg-[#ebd7dc] dark:hover:bg-[#381e2b] active:scale-98'
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
