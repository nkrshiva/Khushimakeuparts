import React, { useState } from 'react';
import { VIDEO_SHOWCASE_ITEMS, BRAND } from '../data/makeupData';
import { VideoShowcaseItem } from '../types';
import { VideoModal } from './VideoModal';
import { Play, Instagram, ArrowUpRight } from 'lucide-react';
import { SketchMirror, SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

export const VideoShowcase: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoShowcaseItem | null>(null);

  return (
    <section className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#f7ecee] dark:bg-[#140b0f] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold">
              Behind The Brush
            </span>
            <SketchMirror className="w-6 h-6 text-[#b89758] dark:text-[#fed488]" />
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            See the Transformation
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-32 sm:w-44 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] mt-1 max-w-xl">
            Authentic unfiltered moments, step-by-step beauty stories, and radiant reveals captured directly during prep sessions in Siwan.
          </p>
        </div>

        {/* Video Previews 2x2 Grid with Organic Asymmetric Corners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
          {VIDEO_SHOWCASE_ITEMS.map((video, idx) => {
            // Asymmetric corner styles matching Stitch design
            const cornerStyle =
              idx === 0
                ? 'rounded-t-3xl rounded-b-xl'
                : idx === 1
                ? 'rounded-t-xl rounded-b-3xl'
                : idx === 2
                ? 'rounded-t-xl rounded-b-3xl'
                : 'rounded-t-3xl rounded-b-xl';

            return (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className={`group relative ${cornerStyle} overflow-hidden bg-[#f3e2e5] dark:bg-[#201217] aspect-[9/16] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between p-3.5 border border-[#b89758]/35 dark:border-[#b89758]/45 cursor-pointer hover:-translate-y-1`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedVideo(video);
                  }
                }}
                aria-label={`Play transformation reel: ${video.title}`}
              >
                {/* Poster Background Image with Smooth Hover Zoom */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url("${video.posterUrl}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 group-hover:via-black/15 transition-colors" />

                {/* Top Tag & Duration */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#6c2e3e]/90 text-white font-['Plus_Jakarta_Sans'] text-[8px] uppercase tracking-wider backdrop-blur-xs font-semibold">
                    {video.tag}
                  </span>
                  <span className="font-['Plus_Jakarta_Sans'] text-[9px] text-white/90 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {video.duration}
                  </span>
                </div>

                {/* Bottom Title & Play Button */}
                <div className="relative z-10">
                  <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-white mb-2 border border-white/30 group-hover:bg-[#fed488] group-hover:text-[#5d4201] transition-all group-hover:scale-110 shadow-sm">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <h3 className="font-['Playfair_Display'] text-xs sm:text-sm text-white leading-tight font-medium">
                    {video.title}
                  </h3>
                  <p className="font-['Plus_Jakarta_Sans'] text-[10px] text-white/80 line-clamp-1 mt-0.5">
                    {video.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instagram Direct Link Callout as specified in prompt */}
        <div className="mt-8 p-5 rounded-3xl bg-[#fff9fa] dark:bg-[#1f1217] border border-[#b89758]/35 dark:border-[#b89758]/45 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 rounded-full bg-[#6c2e3e] dark:bg-[#7a3b4d] flex items-center justify-center text-white shadow-xs border border-[#b89758]/40 shrink-0">
              <Instagram className="w-6 h-6 text-[#fed488]" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Playfair_Display'] text-base sm:text-lg text-[#6c2e3e] dark:text-[#f8d7df] font-medium">
                {BRAND.instagram}
              </span>
              <span className="font-['Plus_Jakarta_Sans'] text-xs text-[#5a454b] dark:text-[#dfc3c9]">
                More makeup looks and videos are available on Instagram.
              </span>
            </div>
          </div>

          <a
            href={BRAND.instagramProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#6c2e3e] dark:bg-[#7a3b4d] text-white font-['Plus_Jakarta_Sans'] text-xs uppercase tracking-widest font-semibold hover:bg-[#7a3b4d] dark:hover:bg-[#8e4559] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2"
          >
            Follow {BRAND.instagram}
            <ArrowUpRight className="w-4 h-4 text-[#fed488]" />
          </a>
        </div>
      </div>

      {/* Video Modal Player */}
      <VideoModal
        video={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  );
};
