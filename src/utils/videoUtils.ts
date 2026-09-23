/**
 * Video URL helper utilities for YouTube Shorts, YouTube Videos, Instagram Reels, and MP4 streams.
 */

export function parseInstagramReelId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

export function getInstagramEmbedUrl(reelId: string): string {
  return `https://www.instagram.com/reel/${reelId}/embed/`;
}

export function getInstagramDirectUrl(reelId: string): string {
  return `https://www.instagram.com/reel/${reelId}/`;
}

/**
 * Extracts YouTube video/shorts ID from any valid YouTube URL format.
 * Examples supported:
 * - https://www.youtube.com/shorts/5qap5aO4i9A
 * - https://youtube.com/shorts/5qap5aO4i9A?feature=share
 * - https://youtu.be/5qap5aO4i9A
 * - https://www.youtube.com/watch?v=5qap5aO4i9A
 * - https://m.youtube.com/shorts/5qap5aO4i9A
 */
export function parseYouTubeId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // YouTube Shorts: youtube.com/shorts/{id}
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]+)/i);
  if (shortsMatch) {
    return shortsMatch[1].split('?')[0].split('&')[0];
  }

  // Shortened URL: youtu.be/{id}
  const youtuBeMatch = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]+)/i);
  if (youtuBeMatch) {
    return youtuBeMatch[1].split('?')[0].split('&')[0];
  }

  // Standard watch URL: youtube.com/watch?v={id}
  const watchMatch = trimmed.match(/[?&]v=([A-Za-z0-9_-]+)/i);
  if (watchMatch) {
    return watchMatch[1].split('&')[0];
  }

  // Embed URL: youtube.com/embed/{id}
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([A-Za-z0-9_-]+)/i);
  if (embedMatch) {
    return embedMatch[1].split('?')[0].split('&')[0];
  }

  return null;
}

export function isYouTubeShortsUrl(url?: string): boolean {
  if (!url) return false;
  return /youtube\.com\/shorts\//i.test(url);
}

/**
 * Constructs a high-performance YouTube embed URL configured for
 * seamless inline autoplay (muted), looping, and minimal branding.
 */
export function getYouTubeEmbedUrl(
  videoId: string,
  options?: {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    clean?: boolean;
  }
): string {
  const {
    autoplay = true,
    muted = true,
    loop = true,
    controls = true,
    clean = false
  } = options || {};

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    controls: controls && !clean ? '1' : '0',
    disablekb: clean ? '1' : '0',
    fs: clean ? '0' : '1',
    iv_load_policy: '3', // Hide annotations
    cc_load_policy: '0', // Hide closed captions / subtitles
  });

  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId); // Required by YouTube for single video looping
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeDirectUrl(videoId: string, isShort = true): string {
  return isShort
    ? `https://www.youtube.com/shorts/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`;
}

export type VideoType = 'youtube' | 'instagram' | 'native';

export function detectVideoType(url?: string): {
  type: VideoType;
  id?: string;
  isShort?: boolean;
  embedUrl?: string;
  directUrl?: string;
  thumbnailUrl?: string;
} {
  if (!url) return { type: 'native' };

  const youtubeId = parseYouTubeId(url);
  if (youtubeId) {
    const isShort = isYouTubeShortsUrl(url) || true;
    return {
      type: 'youtube',
      id: youtubeId,
      isShort,
      embedUrl: getYouTubeEmbedUrl(youtubeId, { autoplay: true, muted: true, loop: true }),
      directUrl: getYouTubeDirectUrl(youtubeId, isShort),
      thumbnailUrl: getYouTubeThumbnail(youtubeId),
    };
  }

  const instagramId = parseInstagramReelId(url);
  if (instagramId) {
    return {
      type: 'instagram',
      id: instagramId,
      embedUrl: getInstagramEmbedUrl(instagramId),
      directUrl: getInstagramDirectUrl(instagramId),
    };
  }

  return { type: 'native', directUrl: url };
}

/**
 * Returns a valid image URL for thumbnail/poster.
 * If user accidentally pastes a YouTube URL into the poster field,
 * it automatically converts it to YouTube's official image thumbnail URL.
 */
export function resolvePosterImage(posterUrl?: string, videoUrl?: string): string {
  // If the user pasted a YouTube link into the poster URL field:
  if (posterUrl && (posterUrl.includes('youtube.com') || posterUrl.includes('youtu.be'))) {
    const yId = parseYouTubeId(posterUrl);
    if (yId) {
      return getYouTubeThumbnail(yId);
    }
  }

  // If a valid image URL is provided:
  if (
    posterUrl &&
    posterUrl.trim() &&
    !posterUrl.includes('youtube.com') &&
    !posterUrl.includes('instagram.com')
  ) {
    return posterUrl.trim();
  }

  // If poster is empty, but videoUrl is YouTube, auto-generate thumbnail:
  if (videoUrl) {
    const yId = parseYouTubeId(videoUrl);
    if (yId) {
      return getYouTubeThumbnail(yId);
    }
  }

  return '/portfolio/model-01.jpg';
}
