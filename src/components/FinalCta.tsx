import React from 'react';
import { BRAND } from '../data/makeupData';
import { Instagram, Calendar } from 'lucide-react';
import { SketchStar, SketchWavyLine, SketchBotanical } from './HandDrawnIllustrations';

interface FinalCtaProps {
  onEnquireClick?: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onEnquireClick }) => {
  return (
    <section className="w-full px-4 sm:px-6 py-14 sm:py-20 bg-[#fdf4f5] dark:bg-[#180e13] border-t border-[#b89758]/25 dark:border-[#b89758]/35 text-center relative overflow-hidden transition-colors duration-300">
      {/* Decorative Botanical Corner Skits */}
      <div className="absolute top-4 left-6 opacity-20 text-[#b89758] dark:text-[#fed488] pointer-events-none hidden sm:block">
        <SketchBotanical className="w-12 h-12" />
      </div>
      <div className="absolute bottom-4 right-6 opacity-20 text-[#b89758] dark:text-[#fed488] pointer-events-none hidden sm:block">
        <SketchBotanical className="w-12 h-12" />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-[1px] w-5 bg-[#b89758]/50 dark:bg-[#fed488]/50" />
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.25em] font-semibold">
            Reserve Ahead
          </span>
          <span className="h-[1px] w-5 bg-[#b89758]/50 dark:bg-[#fed488]/50" />
        </div>

        <h2 className="font-['Playfair_Display'] text-3xl sm:text-5xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mb-3">
          Ready to look unforgettable?
        </h2>

        <div className="my-1.5">
          <SketchWavyLine className="w-36 sm:w-48 h-2.5 text-[#b89758]/60 dark:text-[#fed488]/70" />
        </div>

        <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-base text-[#5a454b] dark:text-[#dfc3c9] max-w-md mb-8 leading-relaxed">
          Reach out to Khushi to check availability for your date and discuss your look.
        </p>

        {/* CTAs with optimized desktop ratio and larger icons */}
        <div className="w-full flex flex-col sm:flex-row gap-3.5 sm:gap-4 lg:gap-5 max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl justify-center items-stretch">
          {onEnquireClick && (
            <button
              onClick={onEnquireClick}
              className="w-full sm:w-auto flex-1 min-h-[54px] sm:min-h-[58px] py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-[#fed488] text-[#5d4201] hover:bg-[#ffe3ab] active:scale-95 transition-all shadow-md hover:shadow-lg font-['Plus_Jakarta_Sans'] text-xs sm:text-xs md:text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2.5 text-center cursor-pointer"
            >
              <Calendar className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />
              <span>Book &amp; Enquire with Details</span>
            </button>
          )}

          {/* Instagram Button with vibrant signature gradient & enlarged icon */}
          <a
            href={BRAND.instagramDmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 min-h-[54px] sm:min-h-[58px] py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-['Plus_Jakarta_Sans'] text-xs sm:text-xs md:text-sm uppercase tracking-wider font-semibold flex items-center justify-center gap-2.5 text-center active:scale-95 transition-all shadow-md hover:shadow-lg hover:shadow-[#fd1d1d]/25"
          >
            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />
            <span>Message on Instagram</span>
          </a>

          {/* WhatsApp Button with enlarged icon */}
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-1 min-h-[54px] sm:min-h-[58px] py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl bg-[#25d366] hover:bg-[#20ba59] text-white font-['Plus_Jakarta_Sans'] text-xs sm:text-xs md:text-sm uppercase tracking-wider font-semibold flex items-center justify-center gap-2.5 text-center active:scale-95 transition-all shadow-md hover:shadow-lg hover:shadow-[#25d366]/25"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current shrink-0" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.853L.054 23.625a.75.75 0 00.921.921l5.772-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.506-5.23-1.388l-.374-.22-3.876.993.993-3.875-.22-.374A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            <span>WhatsApp Khushi</span>
          </a>
        </div>

        {/* Ambient notice */}
        <div className="mt-8 flex items-center gap-2 text-xs text-[#b89758] dark:text-[#fed488] font-['Caveat'] text-base">
          <SketchStar className="w-3.5 h-3.5" />
          <span>Siwan's preferred bridal vanity at your home</span>
          <SketchStar className="w-3.5 h-3.5" />
        </div>
      </div>
    </section>
  );
};
