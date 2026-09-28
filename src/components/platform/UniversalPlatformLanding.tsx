import React from 'react';
import { ArrowRight, LogIn } from 'lucide-react';

interface UniversalPlatformLandingProps {
  onOpenLogin: () => void;
  onNavigateToStorefront?: () => void;
}

export const UniversalPlatformLanding: React.FC<UniversalPlatformLandingProps> = ({
  onOpenLogin,
}) => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0c0508] text-white selection:bg-[#b89758]/30 selection:text-[#fed488] font-['Plus_Jakarta_Sans'] relative overflow-hidden">
      {/* Subtle luxury ambient lighting */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-[#6c2e3e]/25 via-[#b89758]/15 to-transparent blur-[140px] pointer-events-none -z-10"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-gradient-to-br from-[#b89758]/10 to-transparent blur-[120px] pointer-events-none -z-10"
      />

      {/* 1. Minimal Top Navigation */}
      <header className="w-full backdrop-blur-md bg-[#0c0508]/80 border-b border-white/[0.06] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Left: Atly Logo + Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/atly-logo.jpg"
              alt="Atly"
              className="w-10 h-10 object-contain rounded-xl shadow-md shadow-black/60 ring-1 ring-[#b89758]/30"
            />
            <span className="font-['Playfair_Display'] text-xl sm:text-2xl font-bold tracking-wider text-white">
              ATLY
            </span>
          </div>

          {/* Right: Log in */}
          <button
            onClick={onOpenLogin}
            className="px-5 py-2 rounded-full border border-white/20 hover:border-[#fed488]/60 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-2 group"
          >
            <span>Log in</span>
            <LogIn className="w-3.5 h-3.5 text-[#fed488] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* 2. Single Centered Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 sm:py-28 relative z-10 max-w-4xl mx-auto w-full">
        {/* Atly Center Logo Mark */}
        <div className="mb-8 relative group">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
          />
          <img
            src="/atly-logo.jpg"
            alt="Atly Platform"
            className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-3xl shadow-2xl shadow-black ring-1 ring-[#fed488]/40"
          />
        </div>

        {/* Brand Hierarchy */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#fed488] font-semibold">
            ATLY
          </span>

          <h1 className="font-['Playfair_Display'] text-3xl sm:text-5xl lg:text-6xl text-white font-medium tracking-tight leading-[1.18]">
            Everything your beauty business needs, in one place.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-lg mx-auto pt-2">
            The unified digital studio and management platform for luxury salons, master artists, and bespoke beauty ateliers.
          </p>
        </div>

        {/* Primary CTA Button */}
        <div className="mt-10">
          <button
            onClick={onOpenLogin}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#6c2e3e] via-[#8c3b50] to-[#b89758] hover:from-[#7d3548] hover:to-[#c9a662] text-white text-sm sm:text-base font-medium tracking-wide shadow-xl shadow-[#6c2e3e]/30 hover:shadow-[#6c2e3e]/50 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center gap-2.5 border border-[#fed488]/30 mx-auto"
          >
            <span>Log in to Atly</span>
            <ArrowRight className="w-4 h-4 text-[#fed488]" />
          </button>
        </div>
      </main>

      {/* 4. Minimal Footer */}
      <footer className="w-full border-t border-white/[0.06] py-6 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 font-light">
          <div>
            © {new Date().getFullYear()} Atly. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="hover:text-zinc-300 transition-colors">Privacy</span>
            <span>·</span>
            <span className="hover:text-zinc-300 transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
