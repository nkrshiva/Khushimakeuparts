import React from 'react';

// Delicate Hand-drawn Lipstick
export const SketchLipstick: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 32 32">
    <path d="M12 28 H20 V16 H12 Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M13 16 V10 C13 7, 16 4, 19 3 L19 16" strokeLinecap="round" />
    <line stroke="currentColor" x1="12" x2="20" y1="22" y2="22" />
    <line stroke="currentColor" x1="12" x2="20" y1="16" y2="16" />
    <path d="M19 3 C16 4, 13 7, 13 10" />
    <circle cx="16" cy="25" r="0.8" fill="currentColor" />
  </svg>
);

// Delicate Hand-drawn Cosmetic Brush & Powder Bristles
export const SketchBrush: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 32 32">
    <path d="M5 27 L15 17" strokeLinecap="round" />
    <path d="M15 17 L18 14 L21 17 L18 20 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M18 14 C21 11, 27 5, 27 4 C26 4, 20 10, 18 14 Z" fill="currentColor" fillOpacity="0.2" strokeLinecap="round" />
    <path d="M19 13 Q 23 7 25 5" strokeDasharray="1 1.5" />
  </svg>
);

// Delicate Vintage Hand Mirror
export const SketchMirror: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 32 32">
    <ellipse cx="16" cy="11" rx="9" ry="8" />
    <ellipse cx="16" cy="11" rx="6.5" ry="5.5" strokeDasharray="1.5 2" opacity="0.6" />
    <path d="M14 7 Q 19 11 15 15" strokeWidth="0.8" opacity="0.7" />
    <line x1="16" y1="19" x2="16" y2="29" strokeLinecap="round" />
    <path d="M13 23 Q 16 26 19 23" />
    <circle cx="16" cy="29" r="1.5" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

// Compact Powder / Blush Case
export const SketchCompact: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 32 32">
    {/* Base pan */}
    <ellipse cx="16" cy="20" rx="12" ry="7" fill="currentColor" fillOpacity="0.08" />
    <ellipse cx="16" cy="20" rx="9" ry="4.5" strokeDasharray="1.5 1.5" />
    {/* Angled mirrored lid */}
    <ellipse cx="16" cy="10" rx="11" ry="6" stroke="currentColor" />
    <path d="M12 8 Q 16 11 20 9" strokeWidth="0.8" opacity="0.6" />
    <line x1="12" y1="15" x2="20" y2="15" strokeDasharray="1 1" />
  </svg>
);

// Mascara Wand & Flirty Lashes
export const SketchMascara: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 32 32">
    <line x1="8" y1="28" x2="20" y2="10" strokeLinecap="round" />
    <line x1="20" y1="10" x2="25" y2="4" strokeWidth="1.8" strokeLinecap="round" />
    {/* Bristle teeth */}
    <path d="M18 10 L22 8 M19 9 L23 7 M21 7 L25 5 M22 6 L26 4" strokeWidth="0.8" />
    {/* Little stars/sparks */}
    <path d="M26 3 Q 29 3 30 6" strokeWidth="0.8" strokeDasharray="1 1" />
  </svg>
);

// Faceted Luxury Perfume Flacon
export const SketchPerfume: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 32 32">
    <rect x="9" y="12" width="14" height="16" rx="2.5" fill="currentColor" fillOpacity="0.08" />
    <rect x="11" y="14" width="10" height="12" rx="1.5" strokeDasharray="1.5 1.5" opacity="0.5" />
    <path d="M13 12 V8 H19 V12" />
    <polygon points="16,3 21,7 19,8 13,8 11,7" fill="currentColor" fillOpacity="0.15" />
    <circle cx="16" cy="20" r="2.5" fill="currentColor" fillOpacity="0.2" />
    {/* Scent droplets */}
    <circle cx="23" cy="5" r="0.7" fill="currentColor" />
    <circle cx="26" cy="7" r="0.7" fill="currentColor" />
  </svg>
);

// Delicate Hand-drawn Botanical Leaf / Olive Branch
export const SketchBotanical: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 32 32">
    <path d="M8 26 Q 16 16 24 8" strokeLinecap="round" />
    <path d="M12 21 C 8 18, 9 12, 14 15 C 16 17, 14 20, 12 21 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M17 15 C 14 11, 17 6, 21 10 C 22 12, 20 15, 17 15 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M22 9 C 21 4, 27 5, 26 9 Z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

// 4-Point Celestial Sparkle Star
export const SketchStar: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-[#b89758]" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2 L13.8 8.2 L20 10 L13.8 11.8 L12 18 L10.2 11.8 L4 10 L10.2 8.2 Z" />
  </svg>
);

// Hand-Drawn Wavy Underline Flourish
export const SketchWavyLine: React.FC<{ className?: string }> = ({ className = "w-32 h-2 text-[#b89758]/50" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" viewBox="0 0 160 12">
    <path d="M2 6 Q 20 2, 40 6 T 80 6 T 120 6 T 158 6" />
  </svg>
);

// Full Negative-Space Illustrated Vignette 1 (Flacon + Compact + Sprig)
export const SketchVignetteStudy: React.FC<{ className?: string }> = ({ className = "w-full h-24 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.1" viewBox="0 0 160 80">
    <path d="M12 68 Q 28 45 42 32" strokeDasharray="1 1.5" />
    <path d="M22 55 C 16 50, 16 42, 25 45 C 28 48, 25 54, 22 55 Z" fill="#b89758" fillOpacity="0.12" />
    <path d="M32 42 C 28 36, 30 28, 38 32 C 40 36, 36 41, 32 42 Z" fill="#b89758" fillOpacity="0.12" />
    <path d="M40 33 C 44 24, 52 26, 48 34 Z" fill="#6c2e3e" fillOpacity="0.1" />

    {/* Faceted Perfume Flacon */}
    <rect x="54" y="32" width="28" height="34" rx="4" stroke="currentColor" />
    <rect x="58" y="36" width="20" height="26" rx="2" stroke="currentColor" strokeDasharray="2 2" opacity="0.5" />
    <path d="M62 32 V24 H74 V32" />
    <polygon points="68,14 77,20 73,24 63,24 59,20" stroke="currentColor" fill="#b89758" fillOpacity="0.15" />
    <path d="M76 18 Q 86 14 96 12" strokeDasharray="1 2.5" />
    <path d="M78 20 Q 90 20 98 22" strokeDasharray="1 2.5" />
    <circle cx="68" cy="49" r="5" stroke="currentColor" fill="#6c2e3e" fillOpacity="0.1" />

    {/* Open Blush Compact */}
    <ellipse cx="116" cy="56" rx="19" ry="13" stroke="currentColor" fill="#f7ecee" />
    <ellipse cx="116" cy="56" rx="14" ry="9" strokeDasharray="2 2" fill="#fed488" fillOpacity="0.25" />
    <ellipse cx="116" cy="35" rx="18" ry="12" stroke="currentColor" fill="#ffffff" fillOpacity="0.5" />
    <line x1="110" y1="30" x2="122" y2="40" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M110 46 H122" />

    <path d="M144 22 L146 26 L150 27 L146 28 L144 32 L142 28 L138 27 L142 26 Z" fill="#b89758" />
    <circle cx="50" cy="18" r="1" fill="currentColor" />
  </svg>
);

// Full Negative-Space Illustrated Vignette 2 (Mirror + Mascara + Palette)
export const SketchVignetteAtelier: React.FC<{ className?: string }> = ({ className = "w-full h-24 text-[#b89758]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.1" viewBox="0 0 190 92">
    <line x1="15" y1="46" x2="175" y2="46" stroke="currentColor" strokeDasharray="2 4" opacity="0.2" />
    <line x1="95" y1="10" x2="95" y2="82" stroke="currentColor" strokeDasharray="2 4" opacity="0.2" />

    {/* Vintage Oval Hand Mirror */}
    <ellipse cx="36" cy="35" rx="16" ry="22" stroke="currentColor" fill="#f7ecee" />
    <ellipse cx="36" cy="35" rx="12" ry="18" strokeDasharray="2 2" opacity="0.5" />
    <path d="M31 22 Q 41 35 34 47" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
    <path d="M36 57 L36 82" />
    <path d="M33 63 Q 36 67 39 63" />
    <circle cx="36" cy="82" r="2.5" fill="#b89758" fillOpacity="0.2" />

    {/* Mascara Wand */}
    <path d="M62 82 L88 28" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M88 28 L98 8" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M86 24 L94 22 M88 20 L96 18 M90 16 L98 14 M92 12 L100 10" strokeWidth="0.8" />
    <path d="M98 5 Q 106 4 109 10" strokeWidth="0.8" opacity="0.7" />

    {/* Dual Palette */}
    <rect x="116" y="32" width="46" height="32" rx="4" stroke="currentColor" fill="#fff9fa" />
    <line x1="139" y1="32" x2="139" y2="64" strokeDasharray="1.5 2" />
    <circle cx="127" cy="48" r="7.5" fill="#f2d9de" />
    <circle cx="151" cy="48" r="7.5" fill="#fed488" fillOpacity="0.4" />
    <rect x="136" y="64" width="6" height="3" rx="1" fill="#b89758" />

    {/* Sprig */}
    <path d="M140 25 Q 158 16 176 22" />
    <path d="M148 21 C 146 14 154 13 156 20 Z" fill="#b89758" fillOpacity="0.15" />
    <path d="M163 18 C 162 10 171 11 170 19 Z" fill="#6c2e3e" fillOpacity="0.1" />

    <path d="M174 46 L176 50 L180 51 L176 52 L174 56 L172 52 L168 51 L172 50 Z" fill="#b89758" />
  </svg>
);
