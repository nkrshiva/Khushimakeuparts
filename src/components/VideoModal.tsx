import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Instagram, Youtube, ExternalLink } from 'lucide-react';
import { VideoShowcaseItem } from '../types';
import { detectVideoType } from '../utils/videoUtils';

interface VideoModalProps {
  video: VideoShowcaseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const videoMeta = detectVideoType(video?.videoUrl);
  const isPortrait = videoMeta.type === 'instagram' || (videoMeta.type === 'youtube' && videoMeta.isShort);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' && videoMeta.type === 'native') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Auto play native video muted
    if (videoRef.current && videoMeta.type === 'native') {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, videoMeta.type]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (total > 0) {
      setProgress((current / total) * 100);
    }
  };

  if (!isOpen || !video || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video Player Modal"
    >
      <div
        className={`relative w-full ${
          isPortrait ? 'max-w-[360px] sm:max-w-[420px]' : 'max-w-2xl sm:max-w-3xl'
        } my-auto bg-[#12080c] rounded-3xl overflow-hidden border border-[#b89758]/50 shadow-2xl flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] animate-in zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-b from-black/90 via-black/70 to-transparent flex items-center justify-between z-10 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-white font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 ${
                videoMeta.type === 'youtube'
                  ? 'bg-[#ff0000]'
                  : videoMeta.type === 'instagram'
                  ? 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]'
                  : 'bg-[#6c2e3e]'
              }`}
            >
              {videoMeta.type === 'youtube' && <Youtube className="w-3 h-3" />}
              {videoMeta.type === 'instagram' && <Instagram className="w-3 h-3" />}
              {videoMeta.type === 'youtube'
                ? videoMeta.isShort
                  ? 'YouTube Short'
                  : 'YouTube Video'
                : videoMeta.type === 'instagram'
                ? 'Instagram Reel'
                : video.tag || 'Transformation'}
            </span>
            <h3 className="font-['Playfair_Display'] text-sm sm:text-base text-white font-medium truncate max-w-[180px] sm:max-w-xs">
              {video.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {videoMeta.directUrl && (
              <a
                href={videoMeta.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1 text-[11px]"
                title="Open in new tab"
                aria-label="Open video in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 text-white transition-all duration-300 cursor-pointer"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Area: YouTube Shorts & Videos Embed */}
        {videoMeta.type === 'youtube' && videoMeta.embedUrl && (
          <div
            className={`relative w-full ${
              videoMeta.isShort
                ? 'aspect-[9/16] max-h-[calc(100dvh-8.5rem)] sm:max-h-[70vh]'
                : 'aspect-video max-h-[calc(100dvh-8.5rem)] sm:max-h-[70vh]'
            } bg-black flex items-center justify-center overflow-hidden mx-auto`}
          >
            <iframe
              src={videoMeta.embedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={video.title || 'YouTube Short'}
            />
          </div>
        )}

        {/* Video Area: Instagram Reel Embed */}
        {videoMeta.type === 'instagram' && videoMeta.embedUrl && (
          <div className="relative w-full aspect-[9/16] max-h-[calc(100dvh-8.5rem)] sm:max-h-[70vh] bg-black flex items-center justify-center overflow-hidden mx-auto">
            <iframe
              src={videoMeta.embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              title={video.title || 'Instagram Reel'}
            />
          </div>
        )}

        {/* Video Area: Native HTML5 Video */}
        {videoMeta.type === 'native' && (
          <>
            <div className="relative w-full aspect-[9/16] sm:aspect-video max-h-[calc(100dvh-8.5rem)] sm:max-h-[70vh] bg-black flex items-center justify-center overflow-hidden mx-auto">
              <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.posterUrl}
                playsInline
                muted={isMuted}
                autoPlay
                loop
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                className="w-full h-full object-contain cursor-pointer"
              />

              {/* Center Play/Pause Overlay Indicator on click */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 text-white border border-white/30 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
                  aria-label="Play Video"
                >
                  <Play className="w-8 h-8 ml-1 text-[#fed488]" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/20 shrink-0">
              <div
                className="h-full bg-[#fed488] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Video Controls Bar */}
            <div className="p-3.5 bg-[#140e10] flex items-center justify-between text-white text-xs shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-[10px] text-white/70">{isMuted ? 'Muted' : 'Sound On'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/60 font-['Plus_Jakarta_Sans']">
                  {video.duration}
                </span>
                <button
                  onClick={handleFullscreen}
                  className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                  aria-label="Toggle Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Footer info for YouTube */}
        {videoMeta.type === 'youtube' && (
          <div className="p-3.5 bg-[#170a10] border-t border-white/10 flex items-center justify-between text-xs gap-3 shrink-0">
            <p className="text-[11px] text-[#dfc3c9] truncate font-['Plus_Jakarta_Sans']">
              {video.subtitle || video.description}
            </p>
            {videoMeta.directUrl && (
              <a
                href={videoMeta.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-[#ff0000] text-white text-[11px] font-semibold flex items-center gap-1.5 hover:bg-[#cc0000] transition-colors shadow-xs"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Watch on YouTube</span>
              </a>
            )}
          </div>
        )}

        {/* Footer info for Instagram */}
        {videoMeta.type === 'instagram' && (
          <div className="p-3.5 bg-[#170a10] border-t border-white/10 flex items-center justify-between text-xs gap-3 shrink-0">
            <p className="text-[11px] text-[#dfc3c9] truncate font-['Plus_Jakarta_Sans']">
              {video.subtitle || video.description}
            </p>
            {videoMeta.directUrl && (
              <a
                href={videoMeta.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-[11px] font-semibold flex items-center gap-1.5 hover:opacity-95 transition-opacity shadow-xs"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Open on Instagram</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
