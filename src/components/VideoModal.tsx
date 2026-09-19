import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { VideoShowcaseItem } from '../types';

interface VideoModalProps {
  video: VideoShowcaseItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Must start muted to adhere to "Do not autoplay videos with sound"
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Auto play muted
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

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

  if (!isOpen || !video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video Player Modal"
    >
      <div
        className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden border border-[#b89758]/50 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#6c2e3e] text-white font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-wider font-semibold">
              {video.tag}
            </span>
            <h3 className="font-['Playfair_Display'] text-lg text-white font-medium mt-1">
              {video.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close video player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative aspect-[9/16] sm:aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
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
        <div className="w-full h-1 bg-white/20">
          <div
            className="h-full bg-[#fed488] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Video Controls Bar */}
        <div className="p-4 bg-[#140e10] flex items-center justify-between text-white text-xs">
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
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
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
      </div>
    </div>
  );
};
