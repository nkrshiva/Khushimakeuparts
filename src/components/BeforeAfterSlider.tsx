import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, MoveHorizontal, Wand2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { useSiteContent } from '../context/ContentContext';
import { DEFAULT_BEFORE_AFTER_GALLERY } from '../data/siteContent';
import { BeforeAfterItem } from '../types';
import { SketchStar, SketchWavyLine, SketchBotanical, SketchBrush, SketchLipstick } from './HandDrawnIllustrations';

/** Memoized Look Slide to keep outgoing look visually intact during cross-transition */
interface LookSlideProps {
  item: BeforeAfterItem;
  sliderPosition: number;
  containerWidth: number;
}

const LookSlide: React.FC<LookSlideProps> = React.memo(({ item, sliderPosition, containerWidth }) => {
  return (
    <div className="absolute inset-0 w-full h-full select-none pointer-events-none overflow-hidden">
      {/* 1. Base Layer: AFTER Image (Right / Complete Glam) */}
      <img
        src={item.afterImageUrl}
        alt={`${item.title} - After Glamour`}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* 2. Clipped Overlay: BEFORE Image (Left / Raw Skin) */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none select-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={item.beforeImageUrl}
          alt={`${item.title} - Before Prep`}
          className="absolute inset-0 w-full h-full object-cover max-w-none pointer-events-none select-none"
          style={{
            width: containerWidth > 0 ? `${containerWidth}px` : '100cqw',
            height: '100%',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
});

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '60%' : dir < 0 ? '-60%' : '0%',
    opacity: 0,
    scale: 0.98,
    zIndex: 1,
  }),
  center: {
    x: '0%',
    opacity: 1,
    scale: 1,
    zIndex: 1,
    transition: {
      x: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
      opacity: { duration: 0.4, ease: 'easeOut' },
      scale: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-35%' : dir < 0 ? '35%' : '0%',
    opacity: 0.2,
    scale: 0.98,
    zIndex: 0,
    transition: {
      x: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
      opacity: { duration: 0.35, ease: 'easeIn' },
      scale: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
    },
  }),
};

export const BeforeAfterSlider: React.FC = () => {
  const { content } = useSiteContent();
  const gallery = (content.beforeAfterGallery && content.beforeAfterGallery.length > 0)
    ? content.beforeAfterGallery
    : DEFAULT_BEFORE_AFTER_GALLERY;

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const activeItem: BeforeAfterItem = gallery[activeIndex] || gallery[0];

  const handlePrevLook = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1));
    setSliderPosition(50);
  };

  const handleNextLook = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0));
    setSliderPosition(50);
  };

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  return (
    <section id="transformation-slider" className="py-20 px-4 sm:px-6 relative overflow-hidden bg-transparent">
      {/* ─── FLOATING THEME SHAPES & STARS (BACKGROUND) ─── */}

      {/* 1. Ambient Botanical Watermark SVGs */}
      <div className="absolute top-12 -left-10 w-60 h-60 opacity-15 pointer-events-none text-[#b89758] hidden sm:block">
        <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 100 100">
          <path d="M50 90 C30 70, 20 40, 45 10 C55 35, 75 45, 50 90 Z" />
          <path d="M48 90 Q65 60 85 50" />
          <path d="M47 70 Q30 55 15 50" />
          <circle cx="85" cy="50" fill="currentColor" r="2.5" />
          <circle cx="15" cy="50" fill="currentColor" r="2.5" />
        </svg>
      </div>

      <div className="absolute -bottom-8 -right-10 w-64 h-64 opacity-15 pointer-events-none text-[#b89758] hidden sm:block">
        <svg fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" strokeDasharray="2 4" />
          <path d="M30 40 Q50 20 70 40 Q50 80 30 40" />
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
        </svg>
      </div>

      {/* 2. Ambient Glowing Luxury Light Orbs */}
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#6c2e3e]/25 via-[#b89758]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#b89758]/20 via-[#6c2e3e]/15 to-transparent blur-3xl pointer-events-none" />

      {/* 3. Floating Celestial Stars */}
      <div className="absolute top-20 left-10 sm:left-24 text-[#b89758] dark:text-[#fed488] pointer-events-none animate-subtle-float">
        <SketchStar className="w-5 h-5 text-[#b89758] dark:text-[#fed488]" />
      </div>
      <div className="absolute top-32 right-8 sm:right-28 text-[#b89758]/80 dark:text-[#fed488]/80 pointer-events-none animate-gentle-pulse">
        <SketchStar className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
      </div>
      <div className="absolute bottom-24 left-8 sm:left-20 text-[#b89758] dark:text-[#fed488] pointer-events-none animate-gentle-pulse">
        <SketchStar className="w-6 h-6 text-[#b89758] dark:text-[#fed488]" />
      </div>
      <div className="absolute bottom-28 right-12 sm:right-24 text-[#b89758] dark:text-[#fed488] pointer-events-none animate-subtle-float">
        <SketchStar className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
      </div>

      {/* 4. Delicate Floating Cosmetic Sketches */}
      <div className="absolute top-1/2 -left-4 opacity-25 pointer-events-none hidden lg:block -rotate-12">
        <SketchBrush className="w-16 h-16 text-[#b89758]" />
      </div>
      <div className="absolute top-1/2 -right-4 opacity-25 pointer-events-none hidden lg:block rotate-12">
        <SketchLipstick className="w-14 h-14 text-[#b89758]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b89758]/15 border border-[#8c5f1b]/40 dark:border-[#b89758]/35 text-[#8c5f1b] dark:text-[#fed488] text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 shadow-xs">
            <Wand2 className="w-3.5 h-3.5 text-[#8c5f1b] dark:text-[#fed488]" />
            <span>Interactive Artistry Showcase</span>
          </div>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl text-[#6c2e3e] dark:text-white font-medium mb-2">
            Before &amp; After Transformations
          </h2>

          {/* Hand-Drawn Wavy Underline Flourish */}
          <div className="flex justify-center my-2">
            <SketchWavyLine className="w-40 sm:w-56 h-2.5 text-[#b89758]/70 dark:text-[#fed488]/80" />
          </div>

          <p className="text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] font-medium leading-relaxed mt-2">
            Drag the golden divider left and right to witness the power of bespoke skin prep, precision color undertone calibration, and signature royal bridal glamour.
          </p>
        </div>

        {/* ─── CURRENT TRANSFORMATION TITLE AT TOP ─── */}
        <div className="max-w-xl mx-auto mb-6 text-center">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#1d0e15]/90 border border-[#c48496] dark:border-[#b89758]/40 shadow-sm backdrop-blur-sm text-[#25181c] dark:text-[#fcecee]">
            <div className="flex items-center justify-center gap-2 mb-1">
              {gallery.length > 1 && (
                <span className="text-[10px] text-[#6c2e3e] dark:text-[#fed488] tracking-widest uppercase font-bold px-2 py-0.5 rounded-full bg-[#f0d5db] dark:bg-[#6c2e3e]/60 border border-[#c48496] dark:border-[#fed488]/30">
                  Look {activeIndex + 1} of {gallery.length}
                </span>
              )}
              {activeItem.subtitle && (
                <span className="text-[11px] text-[#382229] dark:text-[#dfc3c9] tracking-wider uppercase font-semibold">
                  • {activeItem.subtitle}
                </span>
              )}
            </div>

            <h3 className="font-['Playfair_Display'] text-lg sm:text-2xl text-[#6c2e3e] dark:text-white font-medium truncate">
              {activeItem.title}
            </h3>
          </div>
        </div>

        {/* ─── COMPARISON SLIDER PANEL WITH SIDE NAVIGATION CONTROLS ─── */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-12 lg:px-14">
          {/* Left Side Navigation Button (At the side of the panel, not on it) */}
          {gallery.length > 1 && (
            <button
              type="button"
              onClick={handlePrevLook}
              aria-label="Previous Transformation"
              className="absolute left-0 sm:left-1 lg:-left-2 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3.5 rounded-full bg-white dark:bg-[#1d0e15] hover:bg-[#6c2e3e] text-[#6c2e3e] hover:text-white dark:text-[#fed488] dark:hover:text-white border border-[#c48496] dark:border-[#b89758]/50 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Previous Look"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Side Navigation Button (At the side of the panel, not on it) */}
          {gallery.length > 1 && (
            <button
              type="button"
              onClick={handleNextLook}
              aria-label="Next Transformation"
              className="absolute right-0 sm:right-1 lg:-right-2 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3.5 rounded-full bg-white dark:bg-[#1d0e15] hover:bg-[#6c2e3e] text-[#6c2e3e] hover:text-white dark:text-[#fed488] dark:hover:text-white border border-[#c48496] dark:border-[#b89758]/50 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              title="Next Look"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Comparison Slider Card with Decorative Framing Rings */}
          <div className="relative max-w-3xl mx-auto group">
            {/* Decorative Offset Frame 1 (-1deg rotation) */}
            <div className="absolute inset-0 rounded-3xl border border-[#c48496]/80 dark:border-[#b89758]/30 -rotate-1 scale-101 pointer-events-none transition-transform duration-700 group-hover:-rotate-2" />
            
            {/* Decorative Offset Frame 2 (+1deg rotation) */}
            <div className="absolute inset-0 rounded-3xl border border-[#b89758]/50 dark:border-[#b89758]/20 rotate-1 scale-102 pointer-events-none transition-transform duration-700 group-hover:rotate-2" />

            {/* Corner Sparkle Stars */}
            <div className="absolute -top-3 -right-3 text-[#b89758] dark:text-[#fed488] z-20 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-45">
              <SketchStar className="w-6 h-6 text-[#b89758] dark:text-[#fed488]" />
            </div>
            <div className="absolute -bottom-3 -left-3 text-[#b89758]/80 dark:text-[#fed488]/80 z-20 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-45">
              <SketchStar className="w-5 h-5 text-[#b89758] dark:text-[#fed488]" />
            </div>

            {/* Comparison Slider Card Body */}
            <div className="relative rounded-3xl p-3 sm:p-4 bg-white dark:bg-[#1a0c14]/95 border border-[#c48496] dark:border-[#b89758]/40 shadow-xl backdrop-blur-md transition-colors duration-300">
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-2xl overflow-hidden cursor-ew-resize select-none bg-neutral-900"
                style={{ containerType: 'inline-size' }}
              >
                {/* 1. Continuous Animated Look Slides (Seamless cross-slide & fade, zero black/white flash) */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={activeIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0 w-full h-full pointer-events-none select-none"
                    >
                      <LookSlide
                        item={activeItem}
                        sliderPosition={sliderPosition}
                        containerWidth={containerWidth}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* ─── FIXED UNBREAKABLE BEFORE & AFTER BADGES (Never flicker or disappear during look changes) ─── */}
                {/* Top Left "BEFORE" Badge */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 pointer-events-none select-none">
                  <span className="px-3 sm:px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/40 text-[#fcecee] text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-2xl whitespace-nowrap flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#dfc3c9]" />
                    <span>Before (Raw Skin Prep)</span>
                  </span>
                </div>

                {/* Top Right "AFTER" Badge */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none select-none">
                  <span className="px-3 sm:px-3.5 py-1.5 rounded-full bg-[#6c2e3e]/90 backdrop-blur-md border border-[#fed488]/60 text-[#fed488] text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-2xl whitespace-nowrap flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#fed488]" />
                    <span>After (Bridal Glam)</span>
                  </span>
                </div>

                {/* 3. Golden Divider Line & Drag Handle (Anchored and interactive at z-30) */}
                <div
                  className="absolute inset-y-0 z-30 pointer-events-none flex items-center justify-center"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Vertical Divider Bar with Golden Glow */}
                  <div className="w-0.5 h-full bg-gradient-to-b from-[#fed488] via-[#b89758] to-[#fed488] shadow-[0_0_12px_rgba(254,212,136,0.8)]" />

                  {/* Circular Golden Drag Knob */}
                  <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] border-2 border-[#fed488] shadow-2xl flex items-center justify-center text-white cursor-ew-resize pointer-events-auto transform active:scale-95 transition-transform">
                    <MoveHorizontal className="w-4 h-4 text-[#fed488]" />
                  </div>
                </div>
              </div>

              {/* Look Details Footer Bar */}
              <div className="mt-4 px-2 sm:px-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1">
                  {activeItem.description ? (
                    <p className="text-xs text-[#382229] dark:text-[#dfc3c9] font-medium leading-relaxed">
                      <span className="text-[#6c2e3e] dark:text-[#fed488] font-bold uppercase text-[10px] tracking-wider block sm:inline sm:mr-1.5">
                        Artistry Notes:
                      </span>
                      {activeItem.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[#382229]/80 dark:text-[#dfc3c9]/70 italic font-medium">
                      Drag the center golden divider left or right to explore raw skin prep vs royal bridal finish.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  {gallery.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      {gallery.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={() => {
                            setDirection(dotIdx > activeIndex ? 1 : -1);
                            setActiveIndex(dotIdx);
                            setSliderPosition(50);
                          }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            activeIndex === dotIdx
                              ? 'w-6 bg-[#8c5f1b] dark:bg-[#fed488]'
                              : 'w-1.5 bg-[#c48496]/60 dark:bg-white/30 hover:bg-[#c48496] dark:hover:bg-white/60'
                          }`}
                          aria-label={`Go to look ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-[#6c2e3e] dark:text-[#fed488] font-bold bg-[#faeaed] dark:bg-white/5 px-3 py-1.5 rounded-full border border-[#c48496] dark:border-white/10 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-[#8c5f1b] dark:text-[#fed488]" />
                    <span>100% Real Bride Prep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
