import React from 'react';
import { Calendar, Camera, MapPin } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

interface HeroProps {
  onBookClick: () => void;
  onPortfolioClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBookClick, onPortfolioClick }) => {
  const { content } = useSiteContent();
  const { brand } = content;

  return (
    <section className="w-full px-4 sm:px-6 pt-6 pb-12 sm:pt-10 sm:pb-16 flex flex-col items-center text-center relative overflow-hidden bg-transparent transition-colors duration-300">
      {/* Background Ambient Botanical Watermark */}
      <div className="absolute top-10 -right-8 w-44 h-44 opacity-15 pointer-events-none text-[#b89758] hidden sm:block">
        <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 100 100">
          <path d="M50 90 C30 70, 20 40, 45 10 C55 35, 75 45, 50 90 Z" />
          <path d="M48 90 Q65 60 85 50" />
          <path d="M47 70 Q30 55 15 50" />
          <circle cx="85" cy="50" fill="currentColor" r="2.5" />
          <circle cx="15" cy="50" fill="currentColor" r="2.5" />
        </svg>
      </div>

      <div className="absolute top-24 -left-10 w-40 h-40 opacity-10 pointer-events-none text-[#b89758] hidden sm:block">
        <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" strokeDasharray="2 4" />
          <path d="M30 40 Q50 20 70 40 Q50 80 30 40" />
        </svg>
      </div>

      {/* Brand Monogram & Subtitle Pill */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/40 shadow-xs mb-3">
        <div className="w-7 h-7 rounded-full overflow-hidden bg-black p-0.5 border border-[#b89758]/50 shrink-0">
          <img
            src={brand.logoUrl}
            alt="Studio Logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] tracking-[0.25em] uppercase font-semibold">
          {brand.subtitle}
        </span>
      </div>

      {/* Main Brand Title */}
      <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl md:text-6xl leading-tight text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mb-2">
        {brand.name}
      </h1>

      {/* Hero Content Hook */}
      <p className="font-['Playfair_Display'] text-xl sm:text-2xl text-[#6c2e3e] dark:text-[#f3cad4] italic font-normal tracking-normal max-w-xl mx-auto mb-1">
        “{brand.tagline}”
      </p>

      {/* Services List Sub-heading */}
      <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] font-medium tracking-wide max-w-lg mx-auto mb-2">
        {brand.servicesList}
      </p>

      {/* Hand-drawn imperfect wavy underline SVG */}
      <div className="my-1">
        <SketchWavyLine className="w-40 sm:w-56 h-2.5 text-[#b89758]/70 dark:text-[#fed488]/80" />
      </div>

      {/* Hero Section Featured Photo Container (Centered with Surrounding Shapes) */}
      <div className="relative my-8 sm:my-10 flex items-center justify-center">
        {/* Photo Box with Surrounding Accent Shapes */}
        <div className="relative group animate-subtle-float">
          {/* Surrounding Accent Frame 1 (+3deg rotation) */}
          <div className="absolute inset-0 rounded-[2.3rem] sm:rounded-[2.8rem] border border-[#b89758]/55 dark:border-[#b89758]/40 rotate-3 scale-105 transition-transform duration-700 ease-out group-hover:rotate-8 group-hover:scale-108 pointer-events-none" />
          
          {/* Surrounding Accent Frame 2 (-3deg rotation) */}
          <div className="absolute inset-0 rounded-[2.3rem] sm:rounded-[2.8rem] border border-[#c48496] dark:border-[#b89758]/25 -rotate-3 scale-110 transition-transform duration-700 ease-out group-hover:-rotate-8 group-hover:scale-112 pointer-events-none" />

          {/* Surrounding Ambient Glow */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-[#6c2e3e]/25 via-[#f5d0dc]/40 to-[#b89758]/25 blur-xl scale-95 pointer-events-none animate-gentle-pulse" />

          {/* Celestial sparkles on corners */}
          <div className="absolute -top-3.5 -right-3.5 text-[#b89758] dark:text-[#fed488] z-10 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-45">
            <SketchStar className="w-6 h-6 text-[#b89758] dark:text-[#fed488]" />
          </div>
          <div className="absolute -bottom-3.5 -left-3.5 text-[#b89758]/80 dark:text-[#fed488]/80 z-10 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-45">
            <SketchStar className="w-5 h-5 text-[#b89758] dark:text-[#fed488]" />
          </div>

          {/* Centered Hero Photo Squircle */}
          <div className="relative w-68 h-68 sm:w-80 sm:h-80 md:w-92 md:h-92 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border-2 border-[#b89758] dark:border-[#fed488]/70 shadow-2xl bg-black p-1 transition-all duration-700 ease-out group-hover:shadow-[0_20px_50px_rgba(108,46,62,0.3)]">
            <img
              src={brand.heroPhotoUrl}
              alt="Khushi, Makeup Artist in Siwan & Nearby"
              className="w-full h-full object-cover object-center rounded-[1.8rem] sm:rounded-[2.3rem] transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      {/* Serving Notice Chip */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white dark:bg-[#25151c] border border-[#c48496] dark:border-[#b89758]/35 text-[#6c2e3e] dark:text-[#f8d7df] font-['Plus_Jakarta_Sans'] text-xs font-semibold my-3 transition-all duration-300 hover:scale-105 shadow-xs cursor-default">
        <MapPin className="w-3.5 h-3.5 text-[#8c5f1b] dark:text-[#fed488]" />
        <span>Serving Siwan &amp; Nearby Areas</span>
        <span className="text-[#8c5f1b] dark:text-[#b89758]">•</span>
        <span className="font-['Caveat'] text-sm text-[#8c5f1b] dark:text-[#fed488] font-bold">Doorstep Vanity</span>
      </div>

      {/* Primary & Secondary CTAs */}
      <div className="w-full flex flex-col sm:flex-row gap-3 max-w-xs sm:max-w-md justify-center my-4">
        <button
          onClick={onBookClick}
          className="w-full sm:w-auto py-3.5 px-7 rounded-xl bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest text-center transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 border border-[#6c2e3e]/40 dark:border-[#b89758]/40 hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] font-semibold cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#fed488] transition-transform duration-300 group-hover:rotate-12" />
          Book an Appointment
        </button>
        <button
          onClick={onPortfolioClick}
          className="w-full sm:w-auto py-3.5 px-7 rounded-xl bg-white hover:bg-[#faeaed] text-[#6c2e3e] dark:bg-[#221319] dark:text-[#f8d7df] border border-[#c48496] dark:border-[#b89758]/50 font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-wider text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 dark:hover:bg-[#2c1a21] font-semibold shadow-xs cursor-pointer"
        >
          <Camera className="w-4 h-4 text-[#8c5f1b] dark:text-[#fed488]" />
          View My Work
        </button>
      </div>

      {/* Positioning Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4">
        <span className="font-['Plus_Jakarta_Sans'] text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/35 text-[#382229] dark:text-[#f8d7df] font-semibold tracking-wide flex items-center gap-1.5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-sm cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c5f1b] dark:bg-[#b89758]" />
          Siwan Home Service
        </span>
        <span className="font-['Plus_Jakarta_Sans'] text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/35 text-[#382229] dark:text-[#f8d7df] font-semibold tracking-wide flex items-center gap-1.5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-sm cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c5f1b] dark:bg-[#b89758]" />
          Travel Across Bihar
        </span>
        <span className="font-['Plus_Jakarta_Sans'] text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/35 text-[#382229] dark:text-[#f8d7df] font-semibold tracking-wide flex items-center gap-1.5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-sm cursor-default">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8c5f1b] dark:bg-[#b89758]" />
          1:1 Bespoke Looks
        </span>
      </div>
    </section>
  );
};
