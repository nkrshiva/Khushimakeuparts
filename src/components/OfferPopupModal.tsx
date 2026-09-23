import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OfferPopupConfig } from '../types';
import { SketchStar, SketchBotanical, SketchWavyLine } from './HandDrawnIllustrations';

interface OfferPopupModalProps {
  config?: OfferPopupConfig;
  isOpenOverride?: boolean; // For Admin Panel live preview
  onCloseOverride?: () => void;
  onNavigateToBooking?: (serviceId?: string) => void;
}

const SESSION_STORAGE_KEY = 'platform_offer_popup_dismissed';

export const OfferPopupModal: React.FC<OfferPopupModalProps> = ({
  config,
  isOpenOverride,
  onCloseOverride,
  onNavigateToBooking,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If Admin Panel is previewing it directly
    if (typeof isOpenOverride === 'boolean') {
      setIsOpen(isOpenOverride);
      return;
    }

    if (!config || config.enabled === false) {
      setIsOpen(false);
      return;
    }

    // Check session storage if showOncePerSession is enabled
    if (config.showOncePerSession !== false) {
      const alreadyDismissed = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (alreadyDismissed) {
        setIsOpen(false);
        return;
      }
    }

    // Show after an elegant 1.2s delay after visitor lands on the site
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [config, isOpenOverride]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (onCloseOverride) {
      onCloseOverride();
    }
    if (config?.showOncePerSession !== false && typeof isOpenOverride !== 'boolean') {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
      } catch {
        // Ignore session storage errors in private browsing
      }
    }
  }, [config?.showOncePerSession, isOpenOverride, onCloseOverride]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen || !config) return null;

  const handleCtaClick = () => {
    handleClose();
    if (config.ctaButtonLink?.startsWith('#')) {
      const targetId = config.ctaButtonLink.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else if (targetId === 'booking-form' && onNavigateToBooking) {
        onNavigateToBooking();
      }
    } else if (config.ctaButtonLink) {
      window.open(config.ctaButtonLink, '_blank', 'noopener,noreferrer');
    } else if (onNavigateToBooking) {
      onNavigateToBooking();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop (Click to dismiss easily) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Outer Container */}
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-[400px] my-auto flex flex-col items-center">
          {/* Main Animated Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full aspect-square group"
          >
            {/* ─── ARTISTIC SPRINKLES & SHAPES RING AROUND THE SQUARE ─── */}

            {/* Rotated Offset Frame 1 (-2deg) */}
            <div className="absolute -inset-2.5 sm:-inset-3 rounded-[2.2rem] border border-[#c48496]/80 dark:border-[#b89758]/50 -rotate-2 scale-[1.01] pointer-events-none transition-transform duration-700 group-hover:-rotate-3" />

            {/* Rotated Offset Frame 2 (+2deg) */}
            <div className="absolute -inset-4 sm:-inset-5 rounded-[2.5rem] border border-[#b89758]/60 dark:border-[#fed488]/40 rotate-2 scale-[1.02] pointer-events-none transition-transform duration-700 group-hover:rotate-3" />

            {/* Ambient Golden Halo Glow */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-[#6c2e3e]/30 via-[#b89758]/20 to-transparent blur-2xl pointer-events-none" />

            {/* Corner & Side Celestial Star Sprinkles */}
            <div className="absolute -top-4 left-6 text-[#b89758] dark:text-[#fed488] z-20 pointer-events-none animate-gentle-pulse">
              <SketchStar className="w-5 h-5 text-[#b89758] dark:text-[#fed488]" />
            </div>
            <div className="absolute -top-3 right-12 text-[#b89758]/90 dark:text-[#fed488]/90 z-20 pointer-events-none animate-subtle-float">
              <SketchStar className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
            </div>
            <div className="absolute top-1/2 -left-5 -translate-y-1/2 text-[#b89758] dark:text-[#fed488] z-20 pointer-events-none animate-gentle-pulse">
              <SketchStar className="w-5 h-5 text-[#b89758] dark:text-[#fed488]" />
            </div>
            <div className="absolute top-1/2 -right-5 -translate-y-1/2 text-[#b89758] dark:text-[#fed488] z-20 pointer-events-none animate-gentle-pulse">
              <SketchStar className="w-5 h-5 text-[#b89758] dark:text-[#fed488]" />
            </div>
            <div className="absolute -bottom-4 left-8 text-[#b89758]/80 dark:text-[#fed488]/80 z-20 pointer-events-none animate-subtle-float">
              <SketchStar className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
            </div>
            <div className="absolute -bottom-4 right-10 text-[#b89758] dark:text-[#fed488] z-20 pointer-events-none animate-gentle-pulse">
              <SketchStar className="w-5 h-5 text-[#b89758] dark:text-[#fed488]" />
            </div>

            {/* Hand-Drawn Botanical Sketches Flanking the Edges */}
            <div className="absolute -left-7 top-1/4 -rotate-45 text-[#b89758] dark:text-[#fed488] opacity-60 pointer-events-none hidden sm:block">
              <SketchBotanical className="w-8 h-8 text-[#b89758] dark:text-[#fed488]" />
            </div>
            <div className="absolute -right-7 bottom-1/4 rotate-45 text-[#b89758] dark:text-[#fed488] opacity-60 pointer-events-none hidden sm:block">
              <SketchBotanical className="w-8 h-8 text-[#b89758] dark:text-[#fed488]" />
            </div>

            {/* ─── EASY-CLOSE BUTTON (Prominent, High Contrast, Tactile) ─── */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1a0c14] border-2 border-[#b89758] shadow-2xl text-[#6c2e3e] dark:text-[#fed488] hover:bg-[#6c2e3e] hover:text-white dark:hover:bg-[#fed488] dark:hover:text-[#1a0c14] hover:scale-110 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
              aria-label="Close offer popup"
              title="Close (Esc)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* ─── MIDDLE SQUARE SHAPE (Houses the Square Photo) ─── */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-[#1a0c14] border-2 border-[#b89758]/70 dark:border-[#fed488]/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] select-none">
              {config.imageUrl ? (
                <img
                  src={config.imageUrl}
                  alt={config.topTitle || 'Special Announcement'}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-tr from-[#2a131e] via-[#1a0c14] to-[#3a1b2a]">
                  <Sparkles className="w-12 h-12 text-[#fed488] mb-3 animate-gentle-pulse" />
                  <span className="font-['Playfair_Display'] text-xl text-white font-medium">
                    {config.topTitle || 'Exclusive Offer'}
                  </span>
                </div>
              )}

              {/* Top & Bottom Soft Vignette Shadows for Legibility */}
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
            </div>

            {/* ─── ON TOP BUT TOUCHED (Overlapping Top Rim) ─── */}
            <div className="absolute -top-3.5 sm:-top-4.5 inset-x-3 sm:inset-x-4 flex flex-col items-center z-30 pointer-events-none">
              <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6c2e3e] via-[#8d3a4f] to-[#6c2e3e] text-[#fed488] border border-[#fed488]/80 shadow-2xl text-[10px] sm:text-xs font-bold tracking-widest uppercase text-center backdrop-blur-md">
                <Tag className="w-3 h-3 text-[#fed488]" />
                <span className="truncate max-w-[220px] sm:max-w-[280px]">
                  {config.topBadgeText || 'Special Announcement'}
                </span>
                <Sparkles className="w-3 h-3 text-[#fed488]" />
              </div>
            </div>

            {/* ─── BOTTOM BUT ALSO TOUCHED (Overlapping Lower Rim) ─── */}
            <div className="absolute -bottom-5 sm:-bottom-6 inset-x-2.5 sm:inset-x-3.5 z-30 pointer-events-auto">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#1d0e15]/95 backdrop-blur-md border border-[#c48496] dark:border-[#b89758]/60 shadow-2xl text-center flex flex-col gap-1.5 transition-colors">
                {config.bottomHighlight && (
                  <h4 className="font-['Playfair_Display'] font-bold text-sm sm:text-base text-[#6c2e3e] dark:text-[#fed488] leading-tight">
                    {config.bottomHighlight}
                  </h4>
                )}

                {config.bottomText && (
                  <p className="text-[10px] sm:text-[11px] text-[#382229] dark:text-[#dfc3c9] font-medium line-clamp-2 leading-relaxed">
                    {config.bottomText}
                  </p>
                )}

                {/* CTA Action Button */}
                <button
                  type="button"
                  onClick={handleCtaClick}
                  className="w-full mt-0.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#6c2e3e] via-[#8c3a4f] to-[#b89758] hover:opacity-95 text-white font-semibold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{config.ctaButtonText || 'Claim Offer Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#fed488]" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Dismiss Link Beneath Square */}
          <button
            type="button"
            onClick={handleClose}
            className="mt-8 text-xs text-white/80 hover:text-white underline underline-offset-4 cursor-pointer transition-colors"
          >
            Dismiss &amp; Continue to Website →
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
};
