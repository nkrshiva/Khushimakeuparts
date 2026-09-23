import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Sparkles,
  Youtube,
  Calendar,
  Play,
  Heart
} from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { SketchWavyLine } from './HandDrawnIllustrations';
import { VideoModal } from './VideoModal';
import { ReviewSubmissionModal } from './ReviewSubmissionModal';
import { VideoShowcaseItem, TestimonialItem } from '../types';

export const Testimonials: React.FC = () => {
  const { content } = useSiteContent();

  const isVisible = content.sectionsVisibility.testimonials;
  const list = (content.testimonials || []).filter((t) => t.hidden !== true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  // Modals state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitReviewOpen, setIsSubmitReviewOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [selectedVideoProof, setSelectedVideoProof] = useState<VideoShowcaseItem | null>(null);

  const activeCardRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Measure card height to maintain rock-solid container stability with ZERO layout jump
  useEffect(() => {
    if (activeCardRef.current) {
      const h = activeCardRef.current.offsetHeight;
      if (h > 0) {
        setMeasuredHeight((prev) => (prev ? Math.max(prev, h) : h));
      }
    }
  }, [activeIndex, list]);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleNext = useCallback(() => {
    if (list.length <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % list.length);
  }, [list.length]);

  const handlePrev = useCallback(() => {
    if (list.length <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
  }, [list.length]);

  const goToSlide = useCallback(
    (idx: number) => {
      if (idx === activeIndex || list.length <= 1) return;
      setDirection(idx > activeIndex ? 1 : -1);
      setActiveIndex(idx);
    },
    [activeIndex, list.length]
  );

  // Automatic rotation: transitions cleanly every 3 seconds unless paused
  useEffect(() => {
    if (isPaused || list.length <= 1 || isReviewModalOpen || !!selectedVideoProof) return;

    const timer = setInterval(() => {
      handleNext();
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused, list.length, isReviewModalOpen, selectedVideoProof, handleNext]);

  // Mobile touch swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Video proof modal launcher
  const openVideoProof = (item: TestimonialItem) => {
    const videoProofItem: VideoShowcaseItem = {
      id: `proof-${item.id}`,
      title: `${item.clientName} — Verified Review Proof`,
      subtitle: `${item.ceremony} (${item.date})`,
      tag: 'Video Proof',
      duration: '0:45',
      posterUrl: item.photoUrl,
      videoUrl: item.videoUrl || 'https://www.youtube.com/shorts/fkqzlnFsuA4',
      description: `Authentic video review proof: "${item.reviewText || item.quote || ''}"`,
    };
    setSelectedVideoProof(videoProofItem);
  };

  // Review Details Modal
  const openReviewModal = (idx: number) => {
    setModalIndex(idx);
    setIsReviewModalOpen(true);
  };

  const nextModalReview = () => setModalIndex((prev) => (prev + 1) % list.length);
  const prevModalReview = () => setModalIndex((prev) => (prev - 1 + list.length) % list.length);

  // Keyboard navigation for Review Modal
  useEffect(() => {
    if (!isReviewModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextModalReview();
      if (e.key === 'ArrowLeft') prevModalReview();
      if (e.key === 'Escape') setIsReviewModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReviewModalOpen, list.length]);

  if (!isVisible || list.length === 0) return null;

  const currentItem = list[activeIndex] || list[0];
  const prevIndex = (activeIndex - 1 + list.length) % list.length;
  const nextIndex = (activeIndex + 1) % list.length;
  const prevItem = list[prevIndex];
  const nextItem = list[nextIndex];
  const modalItem = list[modalIndex] || list[0];

  // Motion animation variants for the simultaneous slide-fade transition
  const variants = {
    enter: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: prefersReducedMotion ? 0 : dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  // Render a Single Review Card (with desktop side preview styling or active hero styling)
  const renderReviewCardContent = (
    item: TestimonialItem,
    isPreview = false,
    onCardClick?: () => void
  ) => {
    return (
      <div
        onClick={onCardClick}
        className={`w-full h-full rounded-3xl transition-all duration-300 relative select-none flex flex-col justify-between ${
          isPreview
            ? 'p-5 sm:p-6 bg-white/75 dark:bg-gradient-to-b dark:from-[#1c0f15]/70 dark:to-[#10070c]/70 border border-[#c48496]/70 dark:border-white/5 shadow-md cursor-pointer hover:border-[#c48496] text-[#25181c] dark:text-[#fcecee]'
            : 'p-6 sm:p-8 lg:p-10 bg-white dark:bg-gradient-to-b dark:from-[#1d0e16]/95 dark:via-[#160c12]/95 dark:to-[#0f070b]/95 border border-[#c48496] dark:border-[#b89758]/55 shadow-xl dark:shadow-[0_0_45px_-10px_rgba(184,151,88,0.22)] backdrop-blur-xl cursor-pointer hover:border-[#b89758] dark:hover:border-[#fed488]/80 hover:shadow-2xl dark:hover:shadow-[0_0_55px_-5px_rgba(184,151,88,0.3)] text-[#25181c] dark:text-white'
        }`}
      >
        {/* Top Header Row: Verified Bride + Decorative Watermark Quote */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-colors duration-300 ${
              isPreview
                ? 'bg-[#faeaed] dark:bg-[#251019] text-[#6c2e3e] dark:text-[#fed488] border border-[#c48496]/70 dark:border-[#b89758]/40'
                : 'bg-[#faeaed] dark:bg-[#2d141e] border border-[#c48496] dark:border-[#b89758]/60 text-[#6c2e3e] dark:text-[#fed488] shadow-xs'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#6c2e3e] dark:text-[#fed488]" />
            <span>Verified Bride</span>
          </span>

          <Quote
            className={`pointer-events-none transition-opacity ${
              isPreview
                ? 'w-8 h-8 text-[#b89758]/20 dark:text-[#b89758]/15'
                : 'w-10 h-10 sm:w-12 sm:h-12 text-[#b89758]/25 dark:text-[#b89758]/25'
            }`}
          />
        </div>

        {/* Main Body Row: Bride Portrait + Stars + Quote */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10 flex-1">
          {/* Bride Portrait with Verified Badge */}
          <div className="shrink-0 flex flex-col items-center">
            <div
              className="relative group/photo cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openVideoProof(item);
              }}
              title={`Click to watch video preview: ${item.clientName}`}
            >
              <div
                className={`rounded-2xl overflow-hidden relative shadow-lg transition-all duration-500 ease-out ${
                  isPreview
                    ? 'w-16 h-16 border border-[#b89758]/40'
                    : 'w-20 h-20 sm:w-24 sm:h-24 border-2 border-[#b89758] group-hover/photo:border-[#fed488] shadow-[#b89758]/20 group-hover/photo:shadow-xl'
                }`}
              >
                <img
                  src={item.photoUrl || '/portfolio/model-01.jpg'}
                  alt={item.clientName}
                  className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="absolute -bottom-1.5 -right-1.5 p-0.5 rounded-full bg-[#faeaed] dark:bg-[#190c13] border border-[#dca8b5] dark:border-[#b89758]/40 text-emerald-600 dark:text-emerald-400 group-hover/photo:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* ONLY Video Preview Option: 'Watch Clip' directly below the picture */}
            {!isPreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openVideoProof(item);
                }}
                className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full max-w-[105px] py-1 px-2.5 rounded-lg bg-[#faeaed] dark:bg-[#b89758]/15 hover:bg-[#6c2e3e] border border-[#c48496] dark:border-[#b89758]/50 hover:border-[#fed488] text-[11px] font-bold text-[#6c2e3e] dark:text-[#fed488] hover:text-white tracking-wide transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md hover:scale-105 active:scale-95 group/btnpreview"
                title="Watch authentic video preview"
              >
                <Play className="w-2.5 h-2.5 fill-current transition-transform group-hover/btnpreview:scale-125" />
                <span>Watch Clip</span>
              </button>
            )}
          </div>

          {/* Stars & Testimonial Quote */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < item.rating
                      ? 'fill-[#b89758] text-[#b89758] dark:fill-[#fed488] dark:text-[#fed488]'
                      : 'text-[#b89758]/20 dark:text-white/20'
                  }`}
                />
              ))}
              <span className="ml-1.5 text-xs text-[#8c5f1b] dark:text-[#fed488] font-bold font-['Plus_Jakarta_Sans']">
                5.0
              </span>
            </div>

            <blockquote
              className={`font-['Playfair_Display'] italic font-normal text-[#25181c] dark:text-[#fff1f3] leading-relaxed ${
                isPreview
                  ? 'text-xs sm:text-sm line-clamp-3'
                  : 'text-sm sm:text-base lg:text-lg'
              }`}
            >
              “{item.reviewText || item.quote}”
            </blockquote>
          </div>
        </div>

        {/* Footer Meta Row: Name, Ceremony, Date & Location */}
        <div className="pt-4 mt-4 border-t border-[#b89758]/20 dark:border-[#b89758]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
          <div>
            <h3
              className={`font-['Plus_Jakarta_Sans'] font-bold text-[#6c2e3e] dark:text-[#fff1f3] leading-tight ${
                isPreview ? 'text-xs' : 'text-sm sm:text-base'
              }`}
            >
              {item.clientName}
            </h3>
            <p className="text-xs text-[#8c5f1b] dark:text-[#fed488] font-bold mt-0.5">
              {item.ceremony}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#382229] dark:text-[#dfc3c9]/80 font-medium font-['Plus_Jakarta_Sans']">
            <Calendar className="w-3.5 h-3.5 text-[#8c5f1b] dark:text-[#fed488]/70 shrink-0" />
            <span>
              {item.date} {item.location && `• ${item.location}`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="bride-testimonials"
      className="w-full py-16 sm:py-24 bg-[#f7ecee]/60 dark:bg-[#12090d]/90 backdrop-blur-xs text-[#25181c] dark:text-[#fcecee] border-b border-[#b89758]/20 dark:border-[#b89758]/30 transition-colors duration-300 relative overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] bg-[#6c2e3e]/10 dark:bg-[#6c2e3e]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="h-[1px] w-6 bg-[#b89758]/60" />
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.25em] font-semibold">
              Words of Grace
            </span>
            <span className="h-[1px] w-6 bg-[#b89758]/60" />
          </div>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-5xl text-[#6c2e3e] dark:text-white font-normal tracking-tight">
            Real Brides. Real Radiance.
          </h2>

          <div className="mt-2 mb-3 flex justify-center">
            <SketchWavyLine className="w-40 sm:w-56 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] font-medium leading-relaxed">
            Every bridal look is a sacred journey of trust, care, and bespoke artistry. Read firsthand experiences from our cherished brides.
          </p>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setIsSubmitReviewOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#b89758]/15 hover:bg-[#b89758]/25 text-[#6c2e3e] dark:text-[#fed488] border border-[#b89758]/40 text-xs font-semibold uppercase tracking-wider transition-all hover:scale-105 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b89758] dark:text-[#fed488]" />
              <span>Share Your Bridal Review</span>
            </button>
          </div>
        </div>

        {/* ── CAROUSEL STAGE: DESKTOP 3-CARD COMPOSITION & MOBILE SINGLE-CARD VIEWPORT ── */}
        <div
          className="relative w-full flex items-center justify-center gap-5 lg:gap-8 overflow-hidden py-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left Edge Soft Gradient Vignette */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-28 xl:w-36 bg-gradient-to-r from-[#f7ecee] dark:from-[#12090d] via-[#f7ecee]/70 dark:via-[#12090d]/70 to-transparent pointer-events-none z-20" />

          {/* Left Preview Card (Previous Review) - Visible on Desktop with smooth fade */}
          {list.length > 1 && (
            <div
              onClick={handlePrev}
              className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 opacity-50 hover:opacity-85 transition-all duration-500 cursor-pointer transform -translate-x-2 hover:-translate-x-1 scale-[0.94] select-none"
              title="View Previous Review"
            >
              {renderReviewCardContent(prevItem, true, handlePrev)}
            </div>
          )}

          {/* Center Viewport: Stable Height & Motion Hardware-Accelerated Slide-Fade Layer */}
          <div
            className="relative w-full max-w-3xl shrink-0 overflow-hidden grid grid-cols-1 grid-rows-1 min-h-[340px] sm:min-h-[280px]"
            style={{ minHeight: measuredHeight ? `${measuredHeight}px` : undefined }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'tween', duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                }}
                className="w-full col-start-1 row-start-1"
                style={{ gridArea: '1 / 1' }}
              >
                <div ref={activeCardRef} className="w-full h-full">
                  {renderReviewCardContent(currentItem, false, () =>
                    openReviewModal(activeIndex)
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Preview Card (Next Review) - Visible on Desktop with smooth fade */}
          {list.length > 1 && (
            <div
              onClick={handleNext}
              className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 opacity-50 hover:opacity-85 transition-all duration-500 cursor-pointer transform translate-x-2 hover:translate-x-1 scale-[0.94] select-none"
              title="View Next Review"
            >
              {renderReviewCardContent(nextItem, true, handleNext)}
            </div>
          )}

          {/* Right Edge Soft Gradient Vignette */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-28 xl:w-36 bg-gradient-to-l from-[#f7ecee] dark:from-[#12090d] via-[#f7ecee]/70 dark:via-[#12090d]/70 to-transparent pointer-events-none z-20" />
        </div>

        {/* ── BOTTOM NAVIGATION & BRAND SIGNOFF BAR (Matching Reference Image) ── */}
        <div className="mt-8 sm:mt-12 flex items-center justify-between gap-4 pt-6 border-t border-[#b89758]/20 max-w-4xl mx-auto px-2">
          {/* Left Brand Badge */}
          <div className="hidden sm:flex items-center gap-2.5 text-[#b89758] dark:text-[#fed488]/80 font-['Plus_Jakarta_Sans'] text-[11px] uppercase tracking-[0.25em] font-semibold select-none">
            <span className="w-6 h-px bg-[#b89758]/40" />
            <span>KHUSHI MAKEUP ARTS</span>
            <span className="w-6 h-px bg-[#b89758]/40" />
          </div>

          {/* Center Navigation Controls: Prev Button, Pagination Dots, Next Button */}
          <div className="flex items-center gap-4 sm:gap-6 mx-auto sm:mx-0">
            {/* Previous Review Button */}
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-[#dca8b5] dark:border-[#b89758]/50 hover:border-[#6c2e3e] bg-[#faeaed] dark:bg-[#140b10] hover:bg-[#6c2e3e] text-[#6c2e3e] dark:text-[#fed488] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#fed488]/40"
              aria-label="Previous Review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination Indicators (Smooth Active Pill Indicator) */}
            <div className="flex items-center gap-2">
              {list.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-6 bg-[#6c2e3e] dark:bg-[#fed488] shadow-sm shadow-[#6c2e3e]/30 dark:shadow-[#fed488]/40'
                      : 'w-2 bg-[#dca8b5]/60 dark:bg-white/20 hover:bg-[#dca8b5] dark:hover:bg-white/40'
                  }`}
                  aria-label={`Go to review ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next Review Button */}
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border border-[#dca8b5] dark:border-[#b89758]/50 hover:border-[#6c2e3e] bg-[#faeaed] dark:bg-[#140b10] hover:bg-[#6c2e3e] text-[#6c2e3e] dark:text-[#fed488] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#fed488]/40"
              aria-label="Next Review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right Script Sentiment */}
          <div className="hidden sm:flex items-center gap-1.5 font-['Playfair_Display'] italic text-sm text-[#6c2e3e] dark:text-[#fed488]/85 select-none">
            <span>Real People. Real Happiness</span>
            <Heart className="w-3.5 h-3.5 text-[#6c2e3e] dark:text-[#fed488] fill-[#6c2e3e]/20 dark:fill-[#fed488]/30 inline" />
          </div>
        </div>
      </div>

      {/* ── 1. POPUP MODAL: FULL REVIEW DETAILS WITH PREV / NEXT NAVIGATION ── */}
      {isReviewModalOpen && modalItem && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 dark:bg-black/85 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setIsReviewModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-2xl my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[88vh] flex flex-col bg-[#fbf0f2] dark:bg-[#140b10] border-2 border-[#dca8b5] dark:border-[#b89758]/50 shadow-2xl rounded-3xl p-5 sm:p-8 overflow-hidden text-[#25181c] dark:text-[#fcecee]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6c2e3e]/10 dark:bg-[#6c2e3e]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Header */}
            <div className="shrink-0 flex items-center justify-between pb-4 border-b border-[#b89758]/20 dark:border-white/10 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#b89758] dark:text-[#fed488]" />
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-wider text-[#6c2e3e] dark:text-[#fed488]">
                  Verified Bride Review • {modalIndex + 1} of {list.length}
                </span>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-full bg-[#6c2e3e]/10 dark:bg-white/10 hover:bg-[#6c2e3e]/20 dark:hover:bg-white/20 text-[#6c2e3e] dark:text-white transition-colors cursor-pointer"
                aria-label="Close review details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto modal-scrollbar py-5 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 pr-1">
              {/* Bride Photo with Watch Clip below */}
              <div className="shrink-0 flex flex-col items-center">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#b89758] shadow-xl relative group/modalPhoto cursor-pointer"
                  onClick={() => openVideoProof(modalItem)}
                  title="Click to play video proof"
                >
                  <img
                    src={modalItem.photoUrl || '/portfolio/model-01.jpg'}
                    alt={modalItem.clientName}
                    className="w-full h-full object-cover group-hover/modalPhoto:scale-105 transition-transform"
                  />
                </div>

                {/* Single clean 'Watch Clip' button directly below picture in popup modal */}
                <button
                  type="button"
                  onClick={() => openVideoProof(modalItem)}
                  className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full max-w-[105px] py-1 px-2.5 rounded-lg bg-[#6c2e3e]/10 dark:bg-[#b89758]/15 hover:bg-[#6c2e3e] border border-[#b89758]/40 dark:border-[#b89758]/50 hover:border-[#fed488] text-[11px] font-semibold text-[#6c2e3e] dark:text-[#fed488] hover:text-white tracking-wide transition-all duration-300 cursor-pointer shadow-xs hover:scale-105 active:scale-95 group/btnpreview"
                  title="Watch authentic video preview"
                >
                  <Play className="w-2.5 h-2.5 fill-current transition-transform group-hover/btnpreview:scale-125" />
                  <span>Watch Clip</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < modalItem.rating
                          ? 'fill-[#b89758] text-[#b89758] dark:fill-[#fed488] dark:text-[#fed488]'
                          : 'text-[#b89758]/20 dark:text-white/20'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-[#b89758] dark:text-[#fed488] font-bold font-['Plus_Jakarta_Sans']">
                    5.0 Verified Bride
                  </span>
                </div>

                <blockquote className="font-['Playfair_Display'] text-lg sm:text-xl text-[#25181c] dark:text-white font-normal italic leading-relaxed">
                  “{modalItem.reviewText || modalItem.quote}”
                </blockquote>

                <div className="pt-2 border-t border-[#b89758]/20 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#6c2e3e] dark:text-white">
                      {modalItem.clientName}
                    </h3>
                    <p className="text-xs text-[#b89758] font-medium">
                      {modalItem.ceremony}
                    </p>
                  </div>
                  <div className="text-xs text-[#5a454b]/80 dark:text-white/50 font-['Plus_Jakarta_Sans']">
                    {modalItem.date} {modalItem.location && `• ${modalItem.location}`}
                  </div>
                </div>

                {/* Action Button: Watch Video Proof */}
                <div className="pt-2">
                  <button
                    onClick={() => openVideoProof(modalItem)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff0000]/90 hover:bg-[#ff0000] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Youtube className="w-4 h-4 animate-gentle-pulse" />
                    <span>Watch Video Proof (YouTube Short)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Navigation Footer with Left & Right Arrows */}
            <div className="shrink-0 pt-4 border-t border-[#b89758]/20 dark:border-white/10 flex items-center justify-between relative z-10">
              <button
                onClick={prevModalReview}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#6c2e3e]/10 dark:bg-white/10 hover:bg-[#6c2e3e] text-[#6c2e3e] dark:text-white hover:text-white text-xs font-medium border border-[#b89758]/30 dark:border-white/15 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Review</span>
              </button>

              <div className="flex items-center gap-1.5">
                {list.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setModalIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === modalIndex
                        ? 'w-6 bg-[#6c2e3e] dark:bg-[#fed488]'
                        : 'w-2 bg-[#b89758]/30 dark:bg-white/20 hover:bg-[#b89758]/60 dark:hover:bg-white/40'
                    }`}
                    aria-label={`Go to review ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextModalReview}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#6c2e3e]/10 dark:bg-white/10 hover:bg-[#6c2e3e] text-[#6c2e3e] dark:text-white hover:text-white text-xs font-medium border border-[#b89758]/30 dark:border-white/15 transition-all cursor-pointer"
              >
                <span>Next Review</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 2. POPUP MODAL: VIDEO PROOF PLAYER (YouTube Short engine) ── */}
      <VideoModal
        video={selectedVideoProof}
        isOpen={!!selectedVideoProof}
        onClose={() => setSelectedVideoProof(null)}
      />

      {/* ── 3. PUBLIC BRIDE REVIEW SUBMISSION MODAL ── */}
      <ReviewSubmissionModal
        isOpen={isSubmitReviewOpen}
        onClose={() => setIsSubmitReviewOpen(false)}
      />
    </section>
  );
};
