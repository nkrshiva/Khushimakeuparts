import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSiteContent } from '../context/ContentContext';
import { VideoShowcaseItem } from '../types';
import { VideoModal } from './VideoModal';
import { Instagram, Youtube, ArrowUpRight, Maximize2, Sparkles, Volume2, Shuffle } from 'lucide-react';
import { SketchMirror, SketchWavyLine } from './HandDrawnIllustrations';
import { detectVideoType, getYouTubeEmbedUrl, resolvePosterImage } from '../utils/videoUtils';
import { VIDEO_SHOWCASE_ITEMS as DEFAULT_SHOWCASE_ITEMS } from '../data/makeupData';

// Helper: Fisher-Yates shuffle algorithm
function shuffleList<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const VideoShowcase: React.FC = () => {
  const { content } = useSiteContent();
  const { brand } = content;

  // Build the complete available pool (up to 20 videos), falling back to defaults if local storage cache is small
  const poolOfVideos = useMemo(() => {
    const customList = (content.videos || []).filter((v) => v.hidden !== true);
    if (customList.length >= 8) {
      return customList;
    }
    // Combine custom videos with default showcase items so there are at least 8 to display
    const merged = [...customList];
    for (const def of DEFAULT_SHOWCASE_ITEMS) {
      if (!merged.some((item) => item.id === def.id || item.videoUrl === def.videoUrl)) {
        merged.push(def);
      }
    }
    return merged.filter((v) => v.hidden !== true);
  }, [content.videos]);

  // Initial random selection of 8 videos from the pool
  const [displayedVideos, setDisplayedVideos] = useState<VideoShowcaseItem[]>(() => {
    return shuffleList(poolOfVideos).slice(0, 8);
  });

  const [isShuffling, setIsShuffling] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoShowcaseItem | null>(null);

  // Sync displayedVideos when the pool updates from admin save
  useEffect(() => {
    setDisplayedVideos(shuffleList(poolOfVideos).slice(0, 8));
  }, [poolOfVideos]);

  // On-demand visitor shuffle action
  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setDisplayedVideos(shuffleList(poolOfVideos).slice(0, 8));
      setIsShuffling(false);
    }, 300);
  };

  // Auto-play all videos simultaneously when user visits / scrolls to this section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Split into two tiers of 4: Tier 1 (4 videos) & Tier 2 (4 videos)
  const tier1 = displayedVideos.slice(0, 4);
  const tier2 = displayedVideos.slice(4, 8);

  // Stylish asymmetric corner accents for mobile & desktop
  const getCornerStyle = (idx: number, isTier2: boolean = false) => {
    const baseOffset = isTier2 ? 1 : 0;
    const styles = [
      'rounded-tl-2xl rounded-tr-lg rounded-br-2xl rounded-bl-lg sm:rounded-tl-3xl sm:rounded-tr-xl sm:rounded-br-3xl sm:rounded-bl-xl',
      'rounded-tl-lg rounded-tr-2xl rounded-br-lg rounded-bl-2xl sm:rounded-tl-xl sm:rounded-tr-3xl sm:rounded-br-xl sm:rounded-bl-3xl',
      'rounded-tl-lg rounded-tr-2xl rounded-br-lg rounded-bl-2xl sm:rounded-tl-xl sm:rounded-tr-3xl sm:rounded-br-xl sm:rounded-bl-3xl',
      'rounded-tl-2xl rounded-tr-lg rounded-br-2xl rounded-bl-lg sm:rounded-tl-3xl sm:rounded-tr-xl sm:rounded-br-3xl sm:rounded-bl-xl',
    ];
    return styles[(idx + baseOffset) % styles.length];
  };

  const renderVideoCard = (video: VideoShowcaseItem, idx: number, isTier2: boolean = false) => {
    const meta = detectVideoType(video.videoUrl);
    const isYouTube = meta.type === 'youtube';
    const isInsta = meta.type === 'instagram';
    const posterImage = resolvePosterImage(video.posterUrl, video.videoUrl);
    const cornerStyle = getCornerStyle(idx, isTier2);

    return (
      <div key={`${video.id || idx}-${idx}`} className="relative group/vcard">
        {/* Blooming surrounding outline frames on hover / active / click */}
        <div className={`absolute -inset-1.5 ${cornerStyle} border border-[#dca8b5]/70 dark:border-[#b89758]/60 rotate-1 scale-95 opacity-0 group-hover/vcard:opacity-100 group-active/vcard:opacity-100 group-focus-within/vcard:opacity-100 group-hover/vcard:scale-102 group-active/vcard:scale-102 group-hover/vcard:rotate-2 group-active/vcard:rotate-2 transition-all duration-500 pointer-events-none`} />
        <div className={`absolute -inset-1.5 ${cornerStyle} border border-[#c98a9c]/50 dark:border-[#fed488]/40 -rotate-1 scale-95 opacity-0 group-hover/vcard:opacity-100 group-active/vcard:opacity-100 group-focus-within/vcard:opacity-100 group-hover/vcard:scale-103 group-active/vcard:scale-103 group-hover/vcard:-rotate-2 group-active/vcard:-rotate-2 transition-all duration-500 pointer-events-none`} />
        {/* Ambient radial aura glow on hover / tap */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#6c2e3e]/20 via-[#dca8b5]/15 to-[#b89758]/20 blur-xl opacity-0 group-hover/vcard:opacity-100 group-active/vcard:opacity-100 transition-opacity duration-500 pointer-events-none" />
        {/* Corner celestial sparkle stars */}
        <div className="absolute -top-2.5 -right-2.5 text-[#6c2e3e] dark:text-[#fed488] opacity-0 group-hover/vcard:opacity-100 group-active/vcard:opacity-100 scale-50 group-hover/vcard:scale-110 group-active/vcard:scale-110 group-hover/vcard:rotate-45 group-active/vcard:rotate-45 transition-all duration-500 pointer-events-none z-20">
          <svg className="w-5 h-5 drop-shadow-[0_0_6px_rgba(254,212,136,0.6)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>
        <div className="absolute -bottom-2 -left-2 text-[#dca8b5] dark:text-[#b89758] opacity-0 group-hover/vcard:opacity-100 group-active/vcard:opacity-100 scale-50 group-hover/vcard:scale-100 group-active/vcard:scale-100 group-hover/vcard:-rotate-45 group-active/vcard:-rotate-45 transition-all duration-500 pointer-events-none z-20">
          <svg className="w-4 h-4 drop-shadow-[0_0_6px_rgba(254,212,136,0.4)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </div>

        <div
          onClick={() => setSelectedVideo(video)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedVideo(video);
            }
          }}
          className={`group relative ${cornerStyle} overflow-hidden bg-[#1a0e14] aspect-[9/16] shadow-md hover:shadow-2xl transition-all duration-500 ease-out flex flex-col justify-between border border-[#b89758]/55 dark:border-[#b89758]/45 hover:border-[#fed488] cursor-pointer hover:-translate-y-2 active:scale-98`}
          aria-label={`Open transformation video: ${video.title}`}
        >
          {/* ── CLEAN SIMULTANEOUS AUTOPLAY WHEN SCROLLED INTO VIEW ── */}
          {isInView && isYouTube && meta.id ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-black transition-transform duration-700 ease-out group-hover:scale-105">
              {/* Embedded YouTube Player: Clean Mode (controls=0, cropped 7% on edges to remove watermark & headers) */}
              <iframe
                src={getYouTubeEmbedUrl(meta.id, {
                  autoplay: true,
                  muted: true,
                  loop: true,
                  controls: false,
                  clean: true,
                })}
                className="w-[114%] h-[114%] -top-[7%] -left-[7%] absolute border-0 pointer-events-none select-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                tabIndex={-1}
                title={video.title}
              />
            </div>
          ) : isInView && meta.type === 'native' ? (
            <div className="absolute inset-0 w-full h-full bg-black transition-transform duration-700 ease-out group-hover:scale-105">
              <video
                src={video.videoUrl}
                poster={posterImage}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          ) : (
            /* ── PRE-SCROLL POSTER STATE (zero network load before reaching section) ── */
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
              style={{ backgroundImage: `url("${posterImage}")` }}
            />
          )}

          {/* Subtle dark gradient overlay to ensure text is always readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

          {/* Top Bar: Clean Tag & Expand Button */}
          <div className="relative z-10 p-2 sm:p-3 flex justify-between items-center pointer-events-none">
            <span
              className={`px-2 sm:px-2.5 py-0.5 rounded-full text-white font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[9px] uppercase tracking-wider backdrop-blur-xs font-semibold flex items-center gap-1 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                isYouTube
                  ? 'bg-[#ff0000]/90'
                  : isInsta
                  ? 'bg-gradient-to-r from-[#833ab4]/90 via-[#fd1d1d]/90 to-[#fcb045]/90'
                  : 'bg-[#6c2e3e]/90'
              }`}
            >
              {isYouTube && <Youtube className="w-2.5 h-2.5" />}
              {isInsta && <Instagram className="w-2.5 h-2.5" />}
              <span className="truncate max-w-[75px] sm:max-w-none">
                {video.tag || (isYouTube ? 'YouTube Short' : 'Transformation')}
              </span>
            </span>

            <div className="p-1 sm:p-1.5 rounded-full bg-black/60 text-white/90 backdrop-blur-xs border border-white/20 group-hover:bg-[#fed488] group-hover:text-[#5d4201] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shadow-sm">
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>

          {/* Center Hover / Tap Indicator: Invites the user to click to unmute and see full controls */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-none transform translate-y-2 group-hover:translate-y-0 scale-90 group-hover:scale-100 px-2">
            <div className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#12080c]/85 text-[#fed488] border border-[#b89758]/60 backdrop-blur-md shadow-xl flex items-center gap-1.5 text-[10px] sm:text-xs font-['Plus_Jakarta_Sans'] font-medium text-center">
              <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#fed488] shrink-0" />
              <span>Tap for Sound &amp; Controls</span>
            </div>
          </div>

          {/* Bottom Bar: Title & Subtitle */}
          <div className="relative z-10 p-2 sm:p-3 pointer-events-none transform group-hover:-translate-y-0.5 transition-transform duration-300">
            <h3 className="font-['Playfair_Display'] text-[11px] sm:text-xs md:text-sm text-white font-medium drop-shadow-sm leading-tight line-clamp-1">
              {video.title}
            </h3>
            <p className="font-['Plus_Jakarta_Sans'] text-[8px] sm:text-[10px] text-white/80 line-clamp-1 mt-0.5">
              {video.subtitle}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="transformation-videos"
      ref={sectionRef}
      className="w-full px-3.5 sm:px-6 py-12 sm:py-16 bg-[#f5e4e8]/60 dark:bg-[#140b0f]/60 backdrop-blur-xs transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-7 sm:mb-8">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#8c5f1b] dark:text-[#fed488]" /> Behind The Brush
            </span>
            <SketchMirror className="w-6 h-6 text-[#b89758] dark:text-[#fed488]" />
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            See the Transformation
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-32 sm:w-44 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
            <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] font-medium max-w-xl">
              Authentic bridal &amp; party transformations captured in Siwan. All videos play live simultaneously — tap any video to listen with full controls.
            </p>

            {/* Controls Bar: Shuffle Button & Live Status */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleShuffle}
                disabled={isShuffling}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#6c2e3e] hover:bg-[#7e3447] active:scale-95 text-white text-xs font-semibold font-['Plus_Jakarta_Sans'] shadow-xs hover:shadow-md transition-all border border-[#b89758]/40 cursor-pointer disabled:opacity-60"
                title="Shuffle transformation videos from the pool"
              >
                <Shuffle className={`w-3.5 h-3.5 text-[#fed488] ${isShuffling ? 'animate-spin' : ''}`} />
                <span>Shuffle Looks</span>
                {poolOfVideos.length > 8 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/30 text-[#fed488] font-mono">
                    8 of {poolOfVideos.length}
                  </span>
                )}
              </button>

              {isInView && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Live Playback</span>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500 ml-0.5" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TIER 1: FIRST 4 VIDEOS (Stylish 2x2 Grid on Mobile, 1x4 on Desktop) ── */}
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 transition-opacity duration-300 ${
            isShuffling ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'
          }`}
        >
          {tier1.map((video, idx) => renderVideoCard(video, idx, false))}
        </div>

        {/* ── ARTISTIC SEPARATION MOTIF BETWEEN THE TWO 4-VIDEO TIERS ── */}
        {tier2.length > 0 && (
          <div className="my-8 sm:my-12 flex flex-col items-center justify-center relative select-none">
            {/* Ambient gold glow */}
            <div className="absolute w-80 h-10 bg-[#fed488]/15 blur-2xl rounded-full pointer-events-none" />

            {/* Luxurious gradient line with centered emblem */}
            <div className="w-full flex items-center justify-center gap-3 sm:gap-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#b89758]/50 to-[#b89758]/80" />

              <div className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-white dark:bg-[#1a0e15] border border-[#c48496] dark:border-[#b89758]/40 shadow-xs">
                <Sparkles className="w-3 h-3 text-[#8c5f1b] dark:text-[#fed488]" />
                <span className="font-['Playfair_Display'] italic text-[11px] sm:text-xs text-[#6c2e3e] dark:text-[#fed488] tracking-wider uppercase font-semibold">
                  Atelier Artistry • Curated Transformations
                </span>
                <Sparkles className="w-3 h-3 text-[#8c5f1b] dark:text-[#fed488]" />
              </div>

              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#b89758]/50 to-[#b89758]/80" />
            </div>

            {/* Hand-drawn artistic wavy flourish underneath */}
            <div className="mt-2.5 flex justify-center">
              <SketchWavyLine className="w-32 sm:w-48 h-2.5 text-[#b89758]/60 dark:text-[#fed488]/70" />
            </div>
          </div>
        )}

        {/* ── TIER 2: SECOND 4 VIDEOS (Matching 2x2 Grid on Mobile, 1x4 on Desktop) ── */}
        {tier2.length > 0 && (
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 transition-opacity duration-300 ${
              isShuffling ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'
            }`}
          >
            {tier2.map((video, idx) => renderVideoCard(video, idx, true))}
          </div>
        )}

        {/* Social Channels Callout (YouTube + Instagram) */}
        <div className="mt-9 sm:mt-12 p-4 sm:p-5 rounded-3xl bg-[#fff9fa] dark:bg-[#1f1217] border border-[#b89758]/35 dark:border-[#b89758]/45 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 text-left">
            <div className="flex -space-x-2">
              <div className="w-11 h-11 rounded-full bg-[#ff0000] flex items-center justify-center text-white shadow-xs border-2 border-white dark:border-[#1f1217] shrink-0">
                <Youtube className="w-5 h-5" />
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center text-white shadow-xs border-2 border-white dark:border-[#1f1217] shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-['Playfair_Display'] text-base sm:text-lg text-[#6c2e3e] dark:text-[#f8d7df] font-medium">
                Watch More on YouTube &amp; Instagram
              </span>
              <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#5a454b] dark:text-[#dfc3c9]">
                Follow @khushimakeuparts for daily bridal transformation shorts, skincare routines &amp; client reviews.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={brand.instagramProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-wider font-semibold hover:bg-[#7a3b4d] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#fed488]" />
            </a>
          </div>
        </div>
      </div>

      {/* Fullscreen Cinema Video Modal (Opens on click with full controls and sound) */}
      <VideoModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
};
