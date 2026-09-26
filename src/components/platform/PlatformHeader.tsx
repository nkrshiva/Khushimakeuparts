import React, { useState } from 'react';
import { Sparkles, Menu, X, ArrowUpRight, LogIn, Store } from 'lucide-react';

interface PlatformHeaderProps {
  onOpenLogin: () => void;
  onNavigateStorefront?: () => void;
}

export const PlatformHeader: React.FC<PlatformHeaderProps> = ({
  onOpenLogin,
  onNavigateStorefront,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#12090d]/85 border-b border-[#b89758]/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#fed488] rounded-xl p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6c2e3e] via-[#8c3b50] to-[#b89758] flex items-center justify-center text-white shadow-md shadow-[#6c2e3e]/40 border border-[#fed488]/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#fed488]" />
          </div>
          <div>
            <div className="font-['Playfair_Display'] text-lg font-semibold tracking-wide text-white flex items-center gap-2">
              <span>ATELIER</span>
              <span className="text-[10px] uppercase font-['Plus_Jakarta_Sans'] font-bold px-2 py-0.5 rounded-full bg-[#fed488]/15 text-[#fed488] border border-[#fed488]/30 tracking-widest">
                Platform
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#dfc3c9]">
              SaaS Engine for Luxury Studios
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav aria-label="Platform navigation" className="hidden lg:flex items-center gap-7 text-xs font-medium text-[#dfc3c9]">
          <button
            onClick={() => scrollTo('platform-features')}
            className="hover:text-[#fed488] transition-colors cursor-pointer"
          >
            Capabilities
          </button>
          <button
            onClick={() => scrollTo('platform-showcase')}
            className="hover:text-[#fed488] transition-colors cursor-pointer"
          >
            Architecture
          </button>
          <button
            onClick={() => scrollTo('platform-services')}
            className="hover:text-[#fed488] transition-colors cursor-pointer"
          >
            Services
          </button>
          <button
            onClick={() => scrollTo('platform-achievements')}
            className="hover:text-[#fed488] transition-colors cursor-pointer"
          >
            Client Success
          </button>
          <button
            onClick={() => scrollTo('platform-roadmap')}
            className="hover:text-[#fed488] transition-colors cursor-pointer"
          >
            Roadmap
          </button>
          <button
            onClick={() => scrollTo('platform-vision')}
            className="hover:text-[#fed488] transition-colors cursor-pointer"
          >
            Vision
          </button>
        </nav>

        {/* Right CTA Group */}
        <div className="hidden sm:flex items-center gap-3">
          {onNavigateStorefront && (
            <button
              onClick={onNavigateStorefront}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#dfc3c9] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-white/10 cursor-pointer"
              title="Inspect Live Tenant Experience"
            >
              <Store className="w-3.5 h-3.5 text-[#fed488]" />
              <span>Khushi MUA Storefront</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
          )}

          <button
            onClick={onOpenLogin}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c2e3e] via-[#8c3b50] to-[#b89758] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md hover:opacity-95 active:scale-98 border border-[#fed488]/40 flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-[#fed488]" />
            <span>Enter Console</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-[#1a0c13] border-b border-[#b89758]/30 space-y-3">
          <nav className="flex flex-col gap-2.5 text-sm text-[#dfc3c9]">
            <button
              onClick={() => scrollTo('platform-features')}
              className="text-left py-2 hover:text-[#fed488] transition-colors"
            >
              Platform Capabilities
            </button>
            <button
              onClick={() => scrollTo('platform-showcase')}
              className="text-left py-2 hover:text-[#fed488] transition-colors"
            >
              Platform Architecture
            </button>
            <button
              onClick={() => scrollTo('platform-services')}
              className="text-left py-2 hover:text-[#fed488] transition-colors"
            >
              Platform Services
            </button>
            <button
              onClick={() => scrollTo('platform-achievements')}
              className="text-left py-2 hover:text-[#fed488] transition-colors"
            >
              Client Achievements
            </button>
            <button
              onClick={() => scrollTo('platform-roadmap')}
              className="text-left py-2 hover:text-[#fed488] transition-colors"
            >
              Platform Roadmap
            </button>
            <button
              onClick={() => scrollTo('platform-vision')}
              className="text-left py-2 hover:text-[#fed488] transition-colors"
            >
              About & Vision
            </button>
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            {onNavigateStorefront && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateStorefront();
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-[#fed488]" />
                <span>Visit Tenant Storefront</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
            >
              <LogIn className="w-4 h-4 text-[#fed488]" />
              <span>Enter Workspace</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
