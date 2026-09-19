import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Tag } from 'lucide-react';
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const currentItem = items[currentIndex];

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
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
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

  if (!isOpen || !currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 transition-all duration-300"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox Preview"
    >
      {/* Top Header Bar */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20 pointer-events-auto">
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
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
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
        className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/40 hover:bg-[#6c2e3e] text-white border border-white/20 backdrop-blur-sm transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
        aria-label="Previous Image (Left Arrow)"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/40 hover:bg-[#6c2e3e] text-white border border-white/20 backdrop-blur-sm transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#fed488] cursor-pointer"
        aria-label="Next Image (Right Arrow)"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Image Container */}
      <div
        className="relative max-w-4xl max-h-[80vh] flex flex-col items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-2xl overflow-hidden border border-[#b89758]/50 shadow-2xl bg-black/40">
          <img
            src={currentItem.imageUrl}
            alt={currentItem.alt}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl select-none"
          />
        </div>

        {/* Caption and Tags */}
        <div className="mt-4 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 max-w-xl text-center text-white">
          <h4 className="font-['Playfair_Display'] text-base sm:text-lg font-medium text-[#fed488]">
            {currentItem.title}
          </h4>
          <p className="font-['Plus_Jakarta_Sans'] text-xs text-white/80 mt-1 leading-snug">
            {currentItem.description}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#d4b87d] font-['Plus_Jakarta_Sans'] font-semibold">
              <Tag className="w-3 h-3" /> {currentItem.tag}
            </span>
            <span className="text-white/30">•</span>
            <span className="text-[11px] font-['Caveat'] text-[#fed488]">
              {currentItem.highlightText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
