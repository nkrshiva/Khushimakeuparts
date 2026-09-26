import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Pause, Play, Lock } from 'lucide-react';

interface PlatformHeroProps {
  onOpenLogin: () => void;
  onExploreFeatures?: () => void;
}

interface SlideItem {
  id: string;
  url: string;
  alt: string;
  category: string;
  caption: string;
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    url: '/portfolio/model-01.jpg',
    alt: 'High Definition bridal makeup and jewellery draping transformation',
    category: 'Bridal Artistry & HD Looks',
    caption: 'Bespoke bridal styling and wedding muhurat schedule coordination',
  },
  {
    id: 'slide-2',
    url: '/portfolio/model-03.jpg',
    alt: 'Luxury hair styling and contemporary texture waves',
    category: 'Hair Styling & Chair Allocation',
    caption: 'Tiered service variants, chair reservations, and team roster scheduling',
  },
  {
    id: 'slide-3',
    url: '/portfolio/model2-01.jpeg',
    alt: 'Festive Sangeet and Haldi occasion makeup artistry',
    category: 'Occasion & Event Styling',
    caption: 'Seasonal packages, event inquiry management, and lead inboxes',
  },
  {
    id: 'slide-4',
    url: '/portfolio/model2-06.jpeg',
    alt: 'Contemporary aesthetic parlour transformation with luxury skin prep',
    category: 'Skin Aesthetics & Treatment Suites',
    caption: 'Treatment room allocations, client skin records, and verified reviews',
  },
  {
    id: 'slide-5',
    url: '/portfolio/model-04.jpg',
    alt: 'Editorial and couture fashion transformation showcase',
    category: 'Editorial & Haute Transformations',
    caption: 'Dynamic portfolios, video showcase reels, and digital brand storefronts',
  },
];

export const PlatformHero: React.FC<PlatformHeroProps> = ({
  onOpenLogin,
  onExploreFeatures,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;

    timerRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section aria-labelledby="platform-hero-heading" className="relative pt-12 pb-24 md:pt-16 md:pb-32 overflow-hidden">
      {/* Background Decorative Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#6c2e3e]/30 via-[#b89758]/20 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[350px] bg-gradient-to-br from-[#b89758]/15 to-transparent blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-white/10 via-[#fed488]/10 to-white/10 border border-[#b89758]/40 shadow-inner backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#fed488]">
              Next-Gen Beauty & Atelier Infrastructure
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1
            id="platform-hero-heading"
            className="font-['Playfair_Display'] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.12]"
          >
            The Intelligent Operating Engine for{' '}
            <span className="bg-gradient-to-r from-[#fed488] via-[#e5c5cc] to-[#fed488] bg-clip-text text-transparent italic font-serif">
              Luxury Ateliers
            </span>
          </h1>

          <p className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base md:text-lg text-[#dfc3c9] max-w-2xl mx-auto font-normal leading-relaxed">
            Empowering independent makeup artists, boutique hair studios, and aesthetic ateliers with isolated cloud workspaces, atomic booking conflict protection, and enterprise client CRM.
          </p>
        </div>

        {/* ─── PRIMARY ANIMATED LOGIN CTA CONTROL ───────────────────────────── */}
        <div className="mt-12 mb-16 flex flex-col items-center justify-center relative">
          {/* Subtle Ambient Decorative Sparkles */}
          <div aria-hidden="true" className="absolute -top-7 -left-12 sm:left-1/4 text-[#fed488] animate-sparkle-1 select-none pointer-events-none">
            ✦
          </div>
          <div aria-hidden="true" className="absolute top-2 -right-8 sm:right-1/4 text-[#fed488] animate-sparkle-2 text-xs select-none pointer-events-none">
            ✧
          </div>
          <div aria-hidden="true" className="absolute -bottom-8 left-1/3 text-[#fed488] text-[10px] animate-sparkle-1 select-none pointer-events-none">
            ·
          </div>
          <div aria-hidden="true" className="absolute -top-3 right-1/3 text-[#dfc3c9] text-xs animate-sparkle-2 select-none pointer-events-none">
            ✦
          </div>

          {/* Animated Concentric Rings Container */}
          <div className="relative flex items-center justify-center p-8 sm:p-12">
            {/* Concentric Ring 3 (Outer) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-[#fed488]/20 animate-ring-3 pointer-events-none"
            />
            {/* Concentric Ring 2 (Middle) */}
            <div
              aria-hidden="true"
              className="absolute inset-2 sm:inset-4 rounded-full border border-[#b89758]/35 animate-ring-2 pointer-events-none"
            />
            {/* Concentric Ring 1 (Inner) */}
            <div
              aria-hidden="true"
              className="absolute inset-5 sm:inset-8 rounded-full border border-[#fed488]/50 animate-ring-1 pointer-events-none"
            />

            {/* Central Master Button */}
            <button
              onClick={onOpenLogin}
              aria-label="Universal Entry: Authenticate and open workspace console"
              className="relative z-10 group px-8 sm:px-12 py-4 sm:py-5 rounded-full bg-gradient-to-r from-[#6c2e3e] via-[#8c3b50] to-[#b89758] text-white font-semibold text-xs sm:text-sm uppercase tracking-[0.25em] shadow-[0_0_40px_rgba(184,151,88,0.35)] hover:shadow-[0_0_60px_rgba(254,212,136,0.6)] active:scale-95 transition-all duration-300 flex items-center gap-3 border border-[#fed488]/60 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#fed488]/50"
            >
              <div className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center border border-white/20 group-hover:rotate-12 transition-transform">
                <Lock className="w-3.5 h-3.5 text-[#fed488]" />
              </div>
              <span className="font-['Plus_Jakarta_Sans'] font-bold drop-shadow-sm">
                ENTER PLATFORM CONSOLE
              </span>
              <ArrowRight className="w-4 h-4 text-[#fed488] group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          <div className="text-center text-[11px] text-[#dfc3c9]/70 flex items-center gap-2 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Universal Sign-in for Platform Developers, Tenant Owners & Staff</span>
          </div>
        </div>

        {/* ─── HERO SLIDESHOW / CAROUSEL ───────────────────────────────────── */}
        <div
          aria-label="Atelier platform business showcase"
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden bg-black/40 border border-[#b89758]/30 shadow-2xl backdrop-blur-md"
        >
          {/* Slides Track */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-black">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.url}
                    alt={slide.alt}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
                  />
                  {/* Subtle Gradient Overlays for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12090d] via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#12090d]/80 via-transparent to-transparent hidden sm:block" />

                  {/* Caption Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-10 max-w-lg z-20 space-y-1.5">
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#fed488] bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm inline-block">
                      {slide.category}
                    </span>
                    <p className="font-['Playfair_Display'] text-lg sm:text-2xl text-white font-medium leading-snug drop-shadow-md">
                      {slide.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Interactive Controls Bar */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
            <button
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
              className="p-1 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <div className="w-px h-3 bg-white/20" />
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="p-1 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="p-1 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-3 right-6 z-30 flex items-center gap-1.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Jump to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentSlide ? 'w-6 bg-[#fed488]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Pillar Highlights */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <div className="font-['Playfair_Display'] text-xl text-[#fed488] font-semibold">Zero Leaks</div>
            <div className="text-[11px] text-[#dfc3c9]">Private Subcollection Architecture</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <div className="font-['Playfair_Display'] text-xl text-[#fed488] font-semibold">Concurrency</div>
            <div className="text-[11px] text-[#dfc3c9]">Atomic Slot Lock Protection</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <div className="font-['Playfair_Display'] text-xl text-[#fed488] font-semibold">Tiered RBAC</div>
            <div className="text-[11px] text-[#dfc3c9]">Platform Super Admin · Owner · Staff</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
            <div className="font-['Playfair_Display'] text-xl text-[#fed488] font-semibold">Bespoke Storefronts</div>
            <div className="text-[11px] text-[#dfc3c9]">Live SEO & Dynamic Theming</div>
          </div>
        </div>
      </div>
    </section>
  );
};
