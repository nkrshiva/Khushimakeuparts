import React, { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PortfolioModel } from '../data/portfolioData';

interface PortfolioLightboxProps {
  model: PortfolioModel | null;
  categoryLabel: string;
  onClose: () => void;
}

export const PortfolioLightbox: React.FC<PortfolioLightboxProps> = ({
  model,
  categoryLabel,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reset to first image when a new model opens
  useEffect(() => {
    if (model) {
      setActiveIndex(0);
      setImgLoaded(false);
    }
  }, [model]);

  // Pre-reset loaded state on image change
  useEffect(() => {
    setImgLoaded(false);
  }, [activeIndex]);

  const total = model?.galleryImages.length ?? 0;

  const handlePrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
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
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
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

  if (!model) return null;

  const currentSrc = model.galleryImages[activeIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Gallery: ${model.name}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 lg:py-4 border-b border-white/10 shrink-0">
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
          className="p-2 lg:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
          aria-label="Close gallery (ESC)"
        >
          <X className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      </div>

      {/* ── Main Image Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center relative px-14 sm:px-20 lg:px-28 overflow-hidden min-h-0">
        {/* Prev arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 lg:left-10 p-3 lg:p-4 rounded-full bg-black/50 hover:bg-[#6c2e3e] text-white border border-white/15 hover:border-[#b89758]/60 backdrop-blur-sm transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Image container */}
        <div className="relative max-h-full max-w-full lg:max-w-5xl flex items-center justify-center">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-[#b89758] border-t-transparent animate-spin" />
            </div>
          )}
          <img
            key={currentSrc}
            src={currentSrc}
            alt={`${model.name} — ${activeIndex + 1}`}
            className={`max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-180px)] max-w-full object-contain rounded-xl lg:rounded-2xl select-none transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImgLoaded(true)}
            draggable={false}
          />
        </div>

        {/* Next arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-6 lg:right-10 p-3 lg:p-4 rounded-full bg-black/50 hover:bg-[#6c2e3e] text-white border border-white/15 hover:border-[#b89758]/60 backdrop-blur-sm transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* ── Thumbnail Strip ─────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-white/10 px-4 lg:px-8 py-3 lg:py-4">
        <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-1 scrollbar-none justify-center">
          {model.galleryImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-[72px] lg:h-[72px] rounded-lg lg:rounded-xl overflow-hidden border-2 transition-all cursor-pointer focus:outline-none ${
                i === activeIndex
                  ? 'border-[#b89758] scale-105 shadow-lg shadow-[#b89758]/30'
                  : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
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
      </div>
    </div>
  );
};
