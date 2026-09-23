import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { PortfolioItem } from '../types';
import { SketchStar } from './HandDrawnIllustrations';

interface LightboxProps {
  items: PortfolioItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (newIndex: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
}) => {
  const [mounted, setMounted] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const currentItem = items[currentIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrev = useCallback(() => {
    onIndexChange((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onIndexChange]);

  const handleNext = useCallback(() => {
    onIndexChange((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onIndexChange]);

  // Keyboard navigation & scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch swipe handling on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  if (!isOpen || !currentItem || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6 transition-all duration-300 overflow-hidden select-none"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox Preview"
    >
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 text-[#fed488] font-['Plus_Jakarta_Sans'] text-xs">
          <SketchStar className="w-3.5 h-3.5 text-[#fed488]" />
          <span className="uppercase tracking-widest font-semibold">
            {currentIndex + 1} / {items.length}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/80">{currentItem.subtitle}</span>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
          aria-label="Close Lightbox (ESC)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-[#6c2e3e] text-white border border-white/20 backdrop-blur-sm transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
        aria-label="Previous Image (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-[#6c2e3e] text-white border border-white/20 backdrop-blur-sm transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
        aria-label="Next Image (Right Arrow)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Image Container */}
      <div
        className="flex-1 min-h-0 w-full flex items-center justify-center p-2 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-full max-w-4xl flex items-center justify-center rounded-2xl overflow-hidden border border-[#b89758]/50 shadow-2xl bg-black/40">
          <img
            src={currentItem.imageUrl}
            alt={currentItem.alt}
            className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl select-none"
          />
        </div>
      </div>

      {/* Caption and Tags */}
      <div
        className="shrink-0 px-4 py-2.5 rounded-xl bg-black/70 backdrop-blur-sm border border-white/10 max-w-xl text-center text-white z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="font-['Playfair_Display'] text-base sm:text-lg font-medium text-[#fed488]">
          {currentItem.title}
        </h4>
        <p className="font-['Plus_Jakarta_Sans'] text-xs text-white/80 mt-0.5 leading-snug">
          {currentItem.description}
        </p>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#d4b87d] font-['Plus_Jakarta_Sans'] font-semibold">
            <Tag className="w-3 h-3" /> {currentItem.tag}
          </span>
          <span className="text-white/30">•</span>
          <span className="text-[11px] font-['Caveat'] text-[#fed488]">
            {currentItem.highlightText}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
