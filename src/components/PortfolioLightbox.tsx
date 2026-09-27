import React, { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { PortfolioModel } from '../data/portfolioData';

interface PortfolioLightboxProps {
  model: PortfolioModel | null;
  categoryLabel: string;
  onClose: () => void;
}

// Synchronized, GPU-accelerated transition with identical durations and smooth cubic-bezier
const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '30%' : dir < 0 ? '-30%' : '0%',
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: '0%',
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: [0.25, 1, 0.5, 1],
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-25%' : dir < 0 ? '25%' : '0%',
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.32,
      ease: [0.25, 1, 0.5, 1],
    },
  }),
};

export const PortfolioLightbox: React.FC<PortfolioLightboxProps> = ({
  model,
  categoryLabel,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const navLockTimeout = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (navLockTimeout.current) clearTimeout(navLockTimeout.current);
    };
  }, []);

  // Preload all gallery images of current model into browser cache on open
  useEffect(() => {
    if (!model?.galleryImages) return;
    setActiveIndex(0);
    setDirection(0);

    model.galleryImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [model]);

  const total = model?.galleryImages.length ?? 0;

  const navigateTo = useCallback(
    (newIndex: number, dir: number) => {
      if (isNavigating || total <= 1) return;
      setIsNavigating(true);
      setDirection(dir);
      setActiveIndex(newIndex);

      if (navLockTimeout.current) clearTimeout(navLockTimeout.current);
      navLockTimeout.current = window.setTimeout(() => {
        setIsNavigating(false);
      }, 340);
    },
    [isNavigating, total]
  );

  const handlePrev = useCallback(() => {
    navigateTo((activeIndex - 1 + total) % total, -1);
  }, [activeIndex, total, navigateTo]);

  const handleNext = useCallback(() => {
    navigateTo((activeIndex + 1) % total, 1);
  }, [activeIndex, total, navigateTo]);

  // Keyboard + body scroll lock
  useEffect(() => {
    if (!model) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [model, onClose, handlePrev, handleNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
    // Prevent browser horizontal drag/navigation gestures while swiping gallery
    if (deltaX > deltaY && e.cancelable) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? handleNext() : handlePrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!model || !mounted) return null;

  const currentSrc = model.galleryImages[activeIndex];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] h-[100dvh] w-full flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden select-none touch-pan-y"
      role="dialog"
      aria-modal="true"
      aria-label={`Gallery: ${model.name}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 lg:py-4 border-b border-white/10 shrink-0 z-20">
        {/* Left: Category / Model */}
        <div className="flex flex-col">
          <span className="font-['Plus_Jakarta_Sans'] text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-[0.25em] text-[#b89758] font-semibold">
            {categoryLabel}
          </span>
          <span className="font-['Playfair_Display'] text-sm sm:text-base lg:text-xl text-white font-normal leading-tight">
            {model.name}
          </span>
        </div>

        {/* Center: Image counter */}
        <span className="font-['Plus_Jakarta_Sans'] text-xs lg:text-sm text-white/50 tabular-nums">
          {activeIndex + 1} / {total}
        </span>

        {/* Right: Close */}
        <button
          onClick={onClose}
          className="p-2 lg:p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 hover:rotate-90 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
          aria-label="Close gallery (ESC)"
        >
          <X className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      </div>

      {/* ── Main Image Area (Strictly Bounded & Centered, Zero Horizontal Overflow) ── */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative px-12 sm:px-16 lg:px-24 py-2 overflow-hidden touch-none">
        {/* Prev arrow */}
        <button
          onClick={handlePrev}
          disabled={isNavigating}
          className="absolute left-2 sm:left-6 lg:left-10 p-3 lg:p-4 rounded-full bg-black/50 hover:bg-[#6c2e3e] text-white border border-white/15 hover:border-[#b89758]/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer z-30 disabled:opacity-60"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Co-anchored Cross-Slide Container (Zero Layout Shift, Zero Pop Flicker) */}
        <div className="relative h-full w-full max-w-5xl flex items-center justify-center my-auto overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full flex items-center justify-center p-2 sm:p-4 pointer-events-none select-none"
              style={{ willChange: 'transform, opacity' }}
            >
              <img
                src={currentSrc}
                alt={`${model.name} — ${activeIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-xl lg:rounded-2xl shadow-2xl select-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next arrow */}
        <button
          onClick={handleNext}
          disabled={isNavigating}
          className="absolute right-2 sm:right-6 lg:right-10 p-3 lg:p-4 rounded-full bg-black/50 hover:bg-[#6c2e3e] text-white border border-white/15 hover:border-[#b89758]/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer z-30 disabled:opacity-60"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* ── Bottom Controls: Thumbnails & Action ──────────────────────── */}
      <div className="shrink-0 border-t border-white/10 bg-black/60 backdrop-blur-sm px-4 lg:px-8 py-2 sm:py-2.5 flex flex-col items-center gap-2 z-20">
        {/* Thumbnails (shown if multiple images exist) */}
        {model.galleryImages.length > 1 && (
          <div className="flex gap-2 lg:gap-2.5 overflow-x-auto max-w-full pb-0.5 scrollbar-none justify-center">
            {model.galleryImages.map((src, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i !== activeIndex) {
                    navigateTo(i, i > activeIndex ? 1 : -1);
                  }
                }}
                className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer focus:outline-none active:scale-95 ${
                  i === activeIndex
                    ? 'border-[#fed488] scale-105 shadow-md shadow-[#fed488]/30'
                    : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/50'
                }`}
                aria-label={`View image ${i + 1}`}
                aria-current={i === activeIndex}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}

        {/* Book Now Button with luxury shaped touch feedback */}
        <button
          onClick={() => {
            onClose();
            setTimeout(() => {
              const el = document.getElementById('booking-concierge');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }}
          className="group/btn relative flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] hover:opacity-95 text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-semibold border border-[#fed488]/40 shadow-md shadow-[#6c2e3e]/40 transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fed488]"
          aria-label="Book your makeup appointment"
        >
          {/* Subtle blooming outline frame on hover / tap */}
          <div className="absolute -inset-1 rounded-xl border border-[#fed488]/60 rotate-1 scale-95 opacity-0 group-hover/btn:opacity-100 group-active/btn:opacity-100 group-focus-visible/btn:opacity-100 group-hover/btn:scale-102 group-active/btn:scale-102 group-hover/btn:rotate-2 group-active/btn:rotate-2 transition-all duration-300 pointer-events-none" />
          <Calendar className="w-3.5 h-3.5 text-[#fed488] transition-transform duration-300 group-hover/btn:rotate-12 group-active/btn:rotate-12" />
          <span>Book This Look</span>
        </button>
      </div>
    </div>,
    document.body
  );
};
