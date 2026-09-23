import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Eye, ArrowRight } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { PortfolioModel } from '../data/portfolioData';
import { PortfolioLightbox } from './PortfolioLightbox';
import { SketchWavyLine, SketchLipstick } from './HandDrawnIllustrations';

// ─── Types ──────────────────────────────────────────────────────────────────
interface OpenGallery {
  model: PortfolioModel;
  categoryLabel: string;
}

// ─── Model Card ─────────────────────────────────────────────────────────────
const ModelCard: React.FC<{
  model: PortfolioModel;
  onOpen: () => void;
}> = ({ model, onOpen }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen()}
    className="group relative rounded-2xl lg:rounded-3xl overflow-hidden bg-[#1a0e14] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#b89758] aspect-[3/4] shadow-md hover:shadow-2xl border border-[#b89758]/25 hover:border-[#fed488] transition-all duration-500 ease-out hover:-translate-y-2"
    aria-label={`View ${model.name}'s gallery`}
  >
    {/* Thumbnail */}
    <img
      src={model.thumbnail}
      alt={model.name}
      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
      loading="lazy"
    />

    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

    {/* Hover eye icon */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
      <div className="p-3 lg:p-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
        <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
      </div>
    </div>

    {/* Bottom label */}
    <div className="absolute bottom-0 inset-x-0 p-3.5 lg:p-5 transform group-hover:-translate-y-1 transition-transform duration-300">
      <p className="font-['Playfair_Display'] text-sm sm:text-base lg:text-lg text-white font-medium leading-tight">
        {model.name}
      </p>
      <span className="inline-flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-[10px] lg:text-xs text-[#fed488] mt-0.5 group-hover:gap-2 transition-all duration-300 font-semibold">
        View Gallery <ArrowRight className="w-2.5 h-2.5 lg:w-3 lg:h-3 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </div>
  </div>
);

// ─── Main Portfolio Component ────────────────────────────────────────────────
export const Portfolio: React.FC = () => {
  const { content } = useSiteContent();
  const PORTFOLIO_CATEGORIES = (content.portfolioCategories || [])
    .filter((cat) => cat.hidden !== true)
    .map((cat) => ({
      ...cat,
      models: (cat.models || []).filter((m) => m.hidden !== true),
    }))
    .filter((cat) => cat.models.length > 0);

  const [categoryIndex, setCategoryIndex] = useState(0);
  const [openGallery, setOpenGallery] = useState<OpenGallery | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Touch/swipe state for category carousel
  const touchStartX = useRef<number | null>(null);

  const totalCategories = PORTFOLIO_CATEGORIES.length;
  const safeIndex = totalCategories > 0 ? Math.min(categoryIndex, totalCategories - 1) : 0;
  const activeCategory = totalCategories > 0 ? PORTFOLIO_CATEGORIES[safeIndex] : null;

  // ── Category navigation ────────────────────────────────────────
  const goTo = useCallback(
    (index: number, dir: 'left' | 'right') => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setCategoryIndex((index + totalCategories) % totalCategories);
        setIsAnimating(false);
      }, 250);
    },
    [isAnimating, totalCategories]
  );

  const handlePrev = useCallback(() => {
    goTo(categoryIndex - 1, 'left');
  }, [categoryIndex, goTo]);

  const handleNext = useCallback(() => {
    goTo(categoryIndex + 1, 'right');
  }, [categoryIndex, goTo]);

  // ── Category swipe (when no gallery is open) ───────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) diff > 0 ? handleNext() : handlePrev();
    touchStartX.current = null;
  };

  // ── Keyboard navigation (section-level) ───────────────────────
  useEffect(() => {
    if (openGallery) return; // let the lightbox handle keys
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openGallery, handlePrev, handleNext]);

  if (!activeCategory) return null;

  return (
    <section
      id="lookbook-portfolio"
      className="w-full bg-[#f7ecee]/40 dark:bg-[#0e0810]/40 backdrop-blur-xs border-y border-[#dca8b5]/40 dark:border-[#b89758]/25 transition-colors duration-300 overflow-hidden text-[#25181c] dark:text-[#fcecee]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Section Header ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-20 pb-6 lg:pb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 lg:mb-2">
              <span className="h-[1px] w-5 lg:w-8 bg-[#b89758]/50" />
              <span className="font-['Plus_Jakarta_Sans'] text-[9px] sm:text-[10px] lg:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.25em] font-semibold">
                Couture Archive
              </span>
              <span className="h-[1px] w-5 lg:w-8 bg-[#b89758]/50" />
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl lg:text-5xl text-[#6c2e3e] dark:text-white font-normal tracking-tight">
              Portfolio
            </h2>
            <div className="mt-1.5 mb-2 lg:mt-2 lg:mb-3">
              <SketchWavyLine className="w-36 sm:w-48 lg:w-56 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
            </div>
            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm lg:text-base text-[#382229] dark:text-white/60 font-medium max-w-md lg:max-w-lg leading-relaxed">
              Real brides, real stories, real beauty. Each look crafted for the individual.
            </p>
          </div>
          <SketchLipstick className="w-7 h-7 lg:w-9 lg:h-9 text-[#b89758] dark:text-[#fed488] shrink-0 mt-1 hidden sm:block" />
        </div>
      </div>

      {/* ── Category Navigation Tabs ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 overflow-x-auto scrollbar-none pb-1">
          {PORTFOLIO_CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => goTo(i, i > categoryIndex ? 'right' : 'left')}
              className={`px-4 sm:px-5 lg:px-7 py-1.5 lg:py-2 rounded-full font-['Plus_Jakarta_Sans'] text-xs lg:text-sm whitespace-nowrap transition-all cursor-pointer font-medium border ${
                i === categoryIndex
                  ? 'bg-[#6c2e3e] border-[#b89758]/50 text-white shadow-sm shadow-[#6c2e3e]/50 font-semibold'
                  : 'bg-white dark:bg-white/5 border-[#c48496] dark:border-white/15 text-[#6c2e3e] dark:text-white/60 hover:bg-[#faeaed] dark:hover:text-white/90 shadow-2xs font-semibold'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Category Panel ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 lg:pb-20">
        {/* Category title + description */}
        <div
          className={`text-center py-5 sm:py-7 lg:py-10 transition-all duration-250 ${
            isAnimating
              ? direction === 'right'
                ? 'opacity-0 translate-x-4'
                : 'opacity-0 -translate-x-4'
              : 'opacity-100 translate-x-0'
          }`}
        >
          <h3 className="font-['Playfair_Display'] text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#6c2e3e] dark:text-white font-normal tracking-wide">
            {activeCategory.label.toUpperCase()}
          </h3>
          <p className="font-['Plus_Jakarta_Sans'] text-[11px] sm:text-sm lg:text-base text-[#8c5f1b] dark:text-[#fed488] mt-1 lg:mt-2 italic font-medium">
            {activeCategory.tagline}
          </p>
          <p className="font-['Plus_Jakarta_Sans'] text-xs lg:text-sm text-[#382229] dark:text-white/50 mt-1.5 lg:mt-2.5 max-w-sm lg:max-w-lg mx-auto leading-relaxed hidden sm:block">
            {activeCategory.description}
          </p>
        </div>

        {/* ── Model Cards Grid + floating side arrows ──────────── */}
        <div className="relative">
          {/* Prev arrow — vertically centered on grid */}
          <button
            onClick={handlePrev}
            className="absolute -left-1 sm:-left-5 lg:-left-14 xl:-left-16 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3.5 lg:p-4 rounded-full bg-white dark:bg-black/60 hover:bg-[#6c2e3e] text-[#6c2e3e] dark:text-white/80 hover:text-white border border-[#c48496] dark:border-white/15 hover:border-[#b89758]/60 backdrop-blur-sm transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#b89758] cursor-pointer shadow-md"
            aria-label="Previous category"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Model cards grid */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 transition-all duration-250 ${
              isAnimating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
            }`}
          >
            {activeCategory.models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onOpen={() =>
                  setOpenGallery({
                    model,
                    categoryLabel: activeCategory.label,
                  })
                }
              />
            ))}
          </div>

          {/* Next arrow — vertically centered on grid */}
          <button
            onClick={handleNext}
            className="absolute -right-1 sm:-right-5 lg:-right-14 xl:-right-16 top-1/2 -translate-y-1/2 z-10 p-2.5 sm:p-3.5 lg:p-4 rounded-full bg-white dark:bg-black/60 hover:bg-[#6c2e3e] text-[#6c2e3e] dark:text-white/80 hover:text-white border border-[#c48496] dark:border-white/15 hover:border-[#b89758]/60 backdrop-blur-sm transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-[#b89758] cursor-pointer shadow-md"
            aria-label="Next category"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* ── Dot Indicators ────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 lg:gap-2.5 mt-6 lg:mt-10">
          {PORTFOLIO_CATEGORIES.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => goTo(i, i > categoryIndex ? 'right' : 'left')}
              className={`rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                i === categoryIndex
                  ? 'bg-[#6c2e3e] dark:bg-[#fed488] w-6 lg:w-8 h-1.5 lg:h-2'
                  : 'bg-[#c48496]/60 dark:bg-white/25 w-1.5 lg:w-2 h-1.5 lg:h-2 hover:bg-[#c48496] dark:hover:bg-white/50'
              }`}
              aria-label={`Go to ${cat.label}`}
            />
          ))}
        </div>
      </div>

      {/* ── Per-Model Gallery Lightbox ───────────────────────────── */}
      <PortfolioLightbox
        model={openGallery?.model ?? null}
        categoryLabel={openGallery?.categoryLabel ?? ''}
        onClose={() => setOpenGallery(null)}
      />
    </section>
  );
};
