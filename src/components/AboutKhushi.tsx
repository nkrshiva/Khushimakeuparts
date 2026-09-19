import React from 'react';
import { BRAND } from '../data/makeupData';
import { Trophy, Home, Sparkles, Award } from 'lucide-react';
import { SketchBotanical, SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

export const AboutKhushi: React.FC = () => {
  return (
    <section id="about-khushi" className="w-full px-4 sm:px-6 py-12 sm:py-20 bg-[#f7ecee] dark:bg-[#140b0f] border-y border-[#b89758]/20 dark:border-[#b89758]/35 relative transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="w-10 h-10 text-[#b89758] dark:text-[#fed488] mb-1">
            <SketchBotanical className="w-full h-full" />
          </div>

          <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold">
            The Atelier Story
          </span>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Meet Khushi
          </h2>

          <div className="my-2">
            <SketchWavyLine className="w-36 sm:w-48 h-2.5 text-[#b89758]/60 dark:text-[#fed488]/70" />
          </div>

          <p className="font-['Playfair_Display'] text-sm sm:text-base italic text-[#5a454b] dark:text-[#dfc3c9] max-w-md">
            Artist, visionary, and dedicated bridal beauty artisan in Siwan.
          </p>
        </div>

        {/* Content Layout: Asymmetric Artist Portrait + Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Artist Portrait with Soft Arch Frame & Double-Hairline Gold Stroke */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-t-[120px] rounded-b-3xl overflow-hidden shadow-md bg-[#f3e2e5] dark:bg-[#28161f] p-2.5 border border-[#b89758]/50">
              <div className="w-full h-full rounded-t-[112px] rounded-b-2xl overflow-hidden relative border border-[#b89758]/40 bg-[#fff9fa] dark:bg-[#1f1217]">
                <img
                  src={BRAND.artistPhotoUrl}
                  alt="Editorial portrait of Khushi, professional makeup artist in Siwan"
                  className="w-full h-full object-cover object-center"
                />

                {/* Overlaid Artist Card */}
                <div className="absolute bottom-3 inset-x-3 p-3 rounded-2xl bg-[#fff9fa]/95 dark:bg-[#1f1217]/95 backdrop-blur-xs flex items-center justify-between border border-[#b89758]/35 dark:border-[#b89758]/45 shadow-xs">
                  <div className="flex flex-col text-left">
                    <span className="font-['Playfair_Display'] text-base text-[#6c2e3e] dark:text-[#f8d7df] font-medium leading-tight">
                      Khushi
                    </span>
                    <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#b89758] dark:text-[#fed488] uppercase tracking-wider font-semibold">
                      Founder &amp; Principal Artist
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#f3e2e5] dark:bg-[#2a1720] text-[#6c2e3e] dark:text-[#fed488] flex items-center justify-center border border-[#b89758]/30">
                    <Award className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-7 flex flex-col gap-4 text-left">
            <div className="inline-flex items-center gap-2 text-xs text-[#b89758] dark:text-[#fed488] font-['Caveat'] text-lg">
              <SketchStar className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
              <span>Natural Instinct &amp; Professional Mastery</span>
            </div>

            <p className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base text-[#25181c] dark:text-[#fcecee] leading-relaxed">
              Khushi had an interest and a natural ability for makeup even before she formally learned the craft. Whenever she did makeup for people at occasional events, the appreciation she received became her biggest motivation.
            </p>

            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] leading-relaxed">
              She realized that if people already appreciated her work before she had learned professional techniques, she could take her skills much further by properly studying makeup artistry, methods and different styles.
            </p>

            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] leading-relaxed">
              She began developing her skills professionally, and has now been working as a makeup artist for around two years — continuing to learn and refine her craft with every client and every occasion. Along the way, she has attended makeup-related events where her work was recognized with trophies.
            </p>

            {/* Credential Stats Bento in Organic Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-4 pt-4 border-t border-[#b89758]/20 dark:border-[#b89758]/35">
              <div className="p-4 rounded-2xl bg-[#fff9fa] dark:bg-[#1f1217] shadow-2xs flex flex-col border border-[#b89758]/30 dark:border-[#b89758]/40">
                <span className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#6c2e3e] dark:text-[#fed488] font-normal">
                  2+
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#25181c] dark:text-[#fcecee] font-semibold mt-1">
                  Years Experience
                </span>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#5a454b] dark:text-[#dfc3c9] mt-0.5">
                  Professional artistry
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fff9fa] dark:bg-[#1f1217] shadow-2xs flex flex-col border border-[#b89758]/30 dark:border-[#b89758]/40">
                <span className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#6c2e3e] dark:text-[#fed488] font-normal">
                  Siwan
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#25181c] dark:text-[#fcecee] font-semibold mt-1">
                  Home-Service Area
                </span>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#5a454b] dark:text-[#dfc3c9] mt-0.5">
                  Doorstep vanity setup
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fff9fa] dark:bg-[#1f1217] shadow-2xs flex flex-col border border-[#b89758]/30 dark:border-[#b89758]/40 col-span-2 sm:col-span-1">
                <span className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#6c2e3e] dark:text-[#fed488] font-normal">
                  1:1
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#25181c] dark:text-[#fcecee] font-semibold mt-1">
                  Personalized Looks
                </span>
                <p className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#5a454b] dark:text-[#dfc3c9] mt-0.5">
                  Custom bone &amp; tone matching
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
