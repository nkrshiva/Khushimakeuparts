import React from 'react';
import { useSiteContent } from '../context/ContentContext';
import { Trophy, Home, Sparkles, Award } from 'lucide-react';
import { SketchBotanical, SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

export const AboutKhushi: React.FC = () => {
  const { content } = useSiteContent();
  const { brand } = content;
  const story = brand.aboutStory || {
    heading: `Meet ${brand.founder}`,
    subheading: `Artist, visionary, and dedicated bridal beauty artisan in ${brand.location}.`,
    quote: '“Every bride carries a sacred grace. My artistry simply lets it shine with timeless confidence.”',
    paragraph1: `With dedicated hands-on craftsmanship across ${brand.location}, ${brand.founder} brings personalized atelier glamour right to your doorstep.`,
    paragraph2: 'Waterproof, flash-proof looks tailored meticulously to your skin undertone, facial contours, and bridal couture.',
    yearsExperience: '2+',
    happyClients: '50+'
  };

  return (
    <section id="about-khushi" className="w-full px-4 sm:px-6 py-12 sm:py-20 bg-[#f7ecee]/40 dark:bg-[#140b0f]/40 backdrop-blur-xs border-y border-[#c48496]/50 dark:border-[#b89758]/35 relative transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="w-10 h-10 text-[#8c5f1b] dark:text-[#fed488] mb-1">
            <SketchBotanical className="w-full h-full" />
          </div>

          <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.2em] font-bold">
            The Atelier Story
          </span>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            {story.heading}
          </h2>

          <div className="my-2">
            <SketchWavyLine className="w-36 sm:w-48 h-2.5 text-[#8c5f1b]/40 dark:text-[#fed488]/70" />
          </div>

          <p className="font-['Playfair_Display'] text-sm sm:text-base italic text-[#382229] dark:text-[#dfc3c9] max-w-md">
            {story.subheading}
          </p>
        </div>

        {/* Content Layout: Asymmetric Artist Portrait + Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Artist Portrait with Surrounding Shapes & Celestial Accents */}
          <div className="lg:col-span-5 flex justify-center items-center py-4">
            <div className="relative group animate-subtle-float w-full max-w-sm">
              {/* Surrounding Accent Frame 1 (+3deg rotation, matching arch top) */}
              <div className="absolute inset-0 rounded-t-[130px] rounded-b-[2rem] border border-[#b89758]/60 dark:border-[#fed488]/35 rotate-3 scale-105 transition-transform duration-700 ease-out group-hover:rotate-6 group-hover:scale-108 pointer-events-none" />

              {/* Surrounding Accent Frame 2 (-3deg rotation, matching arch top) */}
              <div className="absolute inset-0 rounded-t-[130px] rounded-b-[2rem] border border-[#c48496]/60 dark:border-[#b89758]/30 -rotate-3 scale-110 transition-transform duration-700 ease-out group-hover:-rotate-6 group-hover:scale-112 pointer-events-none" />

              {/* Surrounding Ambient Radial Glow */}
              <div className="absolute inset-0 rounded-t-[130px] rounded-b-[2rem] bg-gradient-to-tr from-[#6c2e3e]/20 via-[#f5d0dc]/40 to-[#b89758]/25 dark:from-[#6c2e3e]/30 dark:via-[#b89758]/20 dark:to-transparent blur-xl scale-95 pointer-events-none animate-gentle-pulse" />

              {/* Celestial sparkles on corners */}
              <div className="absolute -top-3.5 -right-3.5 text-[#8c5f1b] dark:text-[#fed488] z-20 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-45">
                <SketchStar className="w-6 h-6 text-[#8c5f1b] dark:text-[#fed488]" />
              </div>
              <div className="absolute -bottom-3.5 -left-3.5 text-[#8c5f1b]/80 dark:text-[#fed488]/80 z-20 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-45">
                <SketchStar className="w-5 h-5 text-[#8c5f1b] dark:text-[#fed488]" />
              </div>

              {/* Main Arch Portrait Card */}
              <div className="relative w-full aspect-[4/5] rounded-t-[120px] rounded-b-3xl overflow-hidden shadow-xl group-hover:shadow-[0_20px_50px_rgba(108,46,62,0.35)] transition-all duration-700 ease-out bg-white dark:bg-[#28161f] p-2.5 border-2 border-[#b89758] dark:border-[#fed488]/70">
                <div className="w-full h-full rounded-t-[112px] rounded-b-2xl overflow-hidden relative border border-[#c48496]/50 bg-[#faeaed] dark:bg-[#1f1217]">
                  <img
                    src={brand.artistPhotoUrl}
                    alt={`Editorial portrait of ${brand.founder}`}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Overlaid Artist Card */}
                  <div className="absolute bottom-3 inset-x-3 p-3 rounded-2xl bg-white/95 dark:bg-[#1f1217]/95 backdrop-blur-xs flex items-center justify-between border border-[#c48496] dark:border-[#b89758]/45 shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex flex-col text-left">
                      <span className="font-['Playfair_Display'] text-base text-[#6c2e3e] dark:text-[#f8d7df] font-medium leading-tight">
                        {brand.founder}
                      </span>
                      <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-wider font-bold">
                        Founder &amp; Principal Artist
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#faeaed] dark:bg-[#2a1720] text-[#6c2e3e] dark:text-[#fed488] flex items-center justify-center border border-[#b89758]/40 group-hover:rotate-12 transition-transform duration-300">
                      <Award className="w-4 h-4 text-[#8c5f1b] dark:text-[#fed488]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Atelier Story Narrative Column */}
          <div className="lg:col-span-7 flex flex-col text-left space-y-5">
            <div className="relative pl-5 border-l-2 border-[#8c5f1b] dark:border-[#fed488]">
              <p className="font-['Playfair_Display'] text-lg sm:text-xl text-[#6c2e3e] dark:text-[#f8d7df] italic leading-relaxed">
                {story.quote}
              </p>
            </div>

            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] leading-relaxed">
              {story.paragraph1}
            </p>

            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] leading-relaxed">
              {story.paragraph2}
            </p>

            {/* Quick Proof Milestones */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="relative group p-3.5 rounded-2xl bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/30 shadow-xs text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default">
                <div className="absolute -inset-1 rounded-2xl border border-[#b89758]/40 rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-102 transition-all duration-300 pointer-events-none" />
                <span className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal block relative z-10">
                  {story.yearsExperience}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-wider font-bold relative z-10">
                  Years of Artistry
                </span>
              </div>

              <div className="relative group p-3.5 rounded-2xl bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/30 shadow-xs text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default">
                <div className="absolute -inset-1 rounded-2xl border border-[#b89758]/40 -rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-102 transition-all duration-300 pointer-events-none" />
                <span className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal block relative z-10">
                  {story.happyClients}
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-wider font-bold relative z-10">
                  Happy Brides
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 relative group p-3.5 rounded-2xl bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/40 shadow-xs text-center flex flex-col justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-default">
                <div className="absolute -inset-1 rounded-2xl border border-[#b89758]/40 rotate-1 scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-102 transition-all duration-300 pointer-events-none" />
                <span className="font-['Caveat'] text-lg text-[#6c2e3e] dark:text-[#fed488] block relative z-10">
                  100% Doorstep
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-[10px] text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-wider font-bold relative z-10">
                  Luxury In {brand.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
