import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { PortfolioModel } from '../data/portfolioData';

interface PortfolioLightboxProps {
  model: PortfolioModel | null;
  categoryLabel: string;
  onClose: () => void;
}

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : dir < 0 ? -80 : 0,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 320, damping: 32 },
      opacity: { duration: 0.35, ease: 'easeOut' },
      scale: { duration: 0.35, ease: 'easeOut' },
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : dir < 0 ? 80 : 0,
    opacity: 0,
    scale: 0.97,
    transition: {
      x: { type: 'spring' as const, stiffness: 320, damping: 32 },
      opacity: { duration: 0.25, ease: 'easeIn' },
      scale: { duration: 0.25, ease: 'easeIn' },
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to first image when a new model opens
  useEffect(() => {
    if (model) {
      setActiveIndex(0);
      setDirection(0);
      setImgLoaded(false);
    }
  }, [model]);

  // Pre-reset loaded state on image change
  useEffect(() => {
    setImgLoaded(false);
  }, [activeIndex]);

  const total = model?.galleryImages.length ?? 0;

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

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

  const handleTouchStart = (e: React.TouchEvent) =>
    setTouchStartX(e.touches[0].clientX);

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? handleNext() : handlePrev();
    setTouchStartX(null);
  };

  if (!model || !mounted) return null;

  const currentSrc = model.galleryImages[activeIndex];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] h-[100dvh] w-screen flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label={`Gallery: ${model.name}`}
      onTouchStart={handleTouchStart}
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
          className="p-2 lg:p-2.5 rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
          aria-label="Close gallery (ESC)"
        >
          <X className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      </div>

      {/* ── Main Image Area (Strictly Bounded & Centered) ─────────────── */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative px-12 sm:px-16 lg:px-24 py-2 overflow-hidden">
        {/* Prev arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 lg:left-10 p-3 lg:p-4 rounded-full bg-black/50 hover:bg-[#6c2e3e] text-white border border-white/15 hover:border-[#b89758]/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Image container */}
        <div className="relative h-full w-full max-w-5xl flex items-center justify-center my-auto overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-[#b89758] border-t-transparent animate-spin" />
            </div>
          )}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full flex items-center justify-center relative z-10"
            >
              <img
                src={currentSrc}
                alt={`${model.name} — ${activeIndex + 1}`}
                className="max-h-full max-w-full object-contain rounded-xl lg:rounded-2xl shadow-2xl select-none"
                onLoad={() => setImgLoaded(true)}
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 lg:right-10 p-3 lg:p-4 rounded-full bg-black/50 hover:bg-[#6c2e3e] text-white border border-white/15 hover:border-[#b89758]/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer z-10"
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
                    setDirection(i > activeIndex ? 1 : -1);
                    setActiveIndex(i);
                  }
                }}
                className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer focus:outline-none ${
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

        {/* Book Now Button */}
        <button
          onClick={() => {
            onClose();
            setTimeout(() => {
              const el = document.getElementById('booking-concierge');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] hover:opacity-95 hover:scale-102 active:scale-95 text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-semibold border border-[#fed488]/40 shadow-md shadow-[#6c2e3e]/40 transition-all duration-300 cursor-pointer"
          aria-label="Book your makeup appointment"
        >
          <Calendar className="w-3.5 h-3.5 text-[#fed488]" />
          <span>Book This Look</span>
        </button>
      </div>
    </div>,
    document.body
  );
};
