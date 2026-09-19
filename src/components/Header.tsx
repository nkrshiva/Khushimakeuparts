import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Phone, Instagram, Sun, Moon } from 'lucide-react';
import { BRAND } from '../data/makeupData';
import { SketchStar } from './HandDrawnIllustrations';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onNavigateToBooking?: (serviceId?: string) => void;
  onBookClick?: () => void;
  onNavigate?: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateToBooking,
  onBookClick,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Portfolio', href: '#lookbook-portfolio' },
    { label: 'About', href: '#about-khushi' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const sectionId = href.replace('#', '');
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleBookNowClick = () => {
    setMobileMenuOpen(false);
    if (onBookClick) {
      onBookClick();
    } else if (onNavigateToBooking) {
      onNavigateToBooking();
    } else {
      const el = document.getElementById('booking-concierge');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
        scrolled
          ? 'bg-[#f7ecee]/95 dark:bg-[#140b0f]/95 backdrop-blur-md shadow-sm border-b border-[#b89758]/30 dark:border-[#b89758]/35 py-2.5'
          : 'bg-[#f7ecee] dark:bg-[#140b0f] border-b border-[#b89758]/20 dark:border-[#b89758]/30 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo with Monogram and Stylized Typography */}
        <a
          href="#"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#b89758] rounded-md px-1"
          aria-label="Khushi Makeup Arts Home"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#b89758]/60 dark:border-[#b89758]/80 bg-black flex items-center justify-center p-0.5 shadow-xs transition-transform group-hover:scale-105">
            <img
              src={BRAND.logoUrl}
              alt="Khushi Makeup Arts Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-['Playfair_Display'] text-lg font-medium tracking-tight text-[#6c2e3e] dark:text-[#f8d7df] leading-none">
              Khushi
            </span>
            <span className="font-['Plus_Jakarta_Sans'] text-[9px] uppercase tracking-[0.25em] text-[#b89758] dark:text-[#fed488] font-semibold mt-0.5">
              Makeup Arts
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-wider text-[#5a454b] dark:text-[#dfc3c9] hover:text-[#6c2e3e] dark:hover:text-[#fed488] transition-colors relative py-1 group font-medium"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#b89758] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}

          {/* Theme Toggle Button (Desktop) */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to luxury dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to luxury dark theme'}
            className="p-2 rounded-full text-[#6c2e3e] dark:text-[#fed488] bg-[#fff9fa] dark:bg-[#23141a] border border-[#b89758]/35 hover:scale-105 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#fed488]" />
            ) : (
              <Moon className="w-4 h-4 text-[#6c2e3e]" />
            )}
          </button>

          <button
            onClick={handleBookNowClick}
            className="px-5 py-2.5 rounded-lg bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-medium hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] active:scale-95 transition-all shadow-xs border border-[#6c2e3e]/40 dark:border-[#b89758]/40 flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#fed488]" />
            Book Now
          </button>
        </nav>

        {/* Mobile Hamburger & Theme Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to luxury dark theme'}
            className="p-1.5 rounded-full text-[#6c2e3e] dark:text-[#fed488] bg-[#fff9fa] dark:bg-[#23141a] border border-[#b89758]/35 shadow-2xs"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#fed488]" /> : <Moon className="w-4 h-4 text-[#6c2e3e]" />}
          </button>

          <button
            onClick={handleBookNowClick}
            className="px-3 py-1.5 rounded-md bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-[11px] uppercase tracking-wider font-medium shadow-xs flex items-center gap-1.5"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#6c2e3e] dark:text-[#f8d7df] hover:bg-[#ebd7dc] dark:hover:bg-[#2a1720] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b89758]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-[85%] max-w-sm h-full bg-[#f7ecee] dark:bg-[#180e13] shadow-2xl p-6 flex flex-col justify-between border-l border-[#b89758]/30 overflow-y-auto text-[#25181c] dark:text-[#fcecee]"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between border-b border-[#b89758]/25 pb-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#b89758]/50 bg-black p-0.5 shrink-0">
                    <img
                      src={BRAND.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-['Playfair_Display'] text-base text-[#6c2e3e] dark:text-[#f8d7df] font-medium leading-none">
                      Khushi
                    </h3>
                    <p className="font-['Plus_Jakarta_Sans'] text-[8px] uppercase tracking-widest text-[#b89758] dark:text-[#fed488]">
                      Makeup Arts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="p-1.5 rounded-full text-[#6c2e3e] dark:text-[#fed488] bg-[#fff9fa] dark:bg-[#23141a] border border-[#b89758]/35"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-[#fed488]" /> : <Moon className="w-4 h-4 text-[#6c2e3e]" />}
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full text-[#6c2e3e] dark:text-[#f8d7df] hover:bg-[#edd4d9] dark:hover:bg-[#2a1720] transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex flex-col gap-3.5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="font-['Playfair_Display'] text-xl text-[#25181c] dark:text-[#fcecee] hover:text-[#6c2e3e] dark:hover:text-[#fed488] transition-colors py-2 flex items-center justify-between border-b border-[#b89758]/15"
                  >
                    <span>{link.label}</span>
                    <span className="text-[#b89758] text-sm font-sans">→</span>
                  </a>
                ))}
              </div>

              {/* Booking CTA inside Drawer */}
              <button
                onClick={handleBookNowClick}
                className="w-full mt-6 py-3.5 px-4 rounded-xl bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-medium flex items-center justify-center gap-2 shadow-md border border-[#6c2e3e]/40 dark:border-[#b89758]/40"
              >
                <Calendar className="w-4 h-4 text-[#fed488]" />
                Book an Appointment
              </button>
            </div>

            {/* Bottom Contact Details & Location */}
            <div className="pt-6 border-t border-[#b89758]/25 flex flex-col gap-3 text-xs text-[#5a454b] dark:text-[#dfc3c9]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
                <a href={BRAND.phoneHref} className="hover:underline font-medium text-[#25181c] dark:text-[#fcecee]">
                  {BRAND.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
                <a
                  href={BRAND.instagramProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[#25181c] dark:text-[#fcecee]"
                >
                  {BRAND.instagram}
                </a>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#b89758] dark:text-[#fed488] font-['Caveat'] text-sm">
                <SketchStar className="w-3.5 h-3.5" />
                <span>Serving Siwan &amp; Nearby Areas</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
