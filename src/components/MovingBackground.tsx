import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface MovingBackgroundProps {
  /** Opacity of the separation veil between 0.5 (more visible motion) and 0.95 (subtler veil). Default 0.82 */
  veilOpacity?: number;
  /** Whether to show golden dust particles. Default true */
  showDust?: boolean;
  /** Whether to show star sprinkles in the background. Default true */
  showStars?: boolean;
  /** Whether to show silk wave gradients. Default true */
  showSilkWaves?: boolean;
  /** Whether to show bokeh luminous orbs. Default true */
  showBokeh?: boolean;
  /** Whether to show abstract floral shadows. Default true */
  showFloralShadows?: boolean;
}

export const MovingBackground: React.FC<MovingBackgroundProps> = ({
  veilOpacity = 0.82,
  showDust = true,
  showStars = true,
  showSilkWaves = true,
  showBokeh = true,
  showFloralShadows = true,
}) => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas particle animation for Floating Golden Dust & Star Sprinkles
  useEffect(() => {
    if (!showDust && !showStars) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle count: 35 for balanced performance and luxury feel
    const particleCount = Math.min(Math.floor(window.innerWidth / 32), 40);
    const starCount = Math.min(Math.floor(window.innerWidth / 45), 28);

    interface Particle {
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      currentAlpha: number;
      speedY: number;
      swaySpeed: number;
      swayDistance: number;
      swayOffset: number;
      pulseSpeed: number;
      pulseOffset: number;
    }

    interface StarSprinkle {
      x: number;
      y: number;
      outerRadius: number;
      innerRadius: number;
      rotation: number;
      rotSpeed: number;
      baseAlpha: number;
      pulseSpeed: number;
      pulseOffset: number;
      speedY: number;
    }

    const particles: Particle[] = [];
    const stars: StarSprinkle[] = [];

    if (showDust) {
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.8 + 0.6,
          baseAlpha: Math.random() * 0.5 + 0.25,
          currentAlpha: 0.3,
          speedY: Math.random() * 0.25 + 0.1, // slow rising drift
          swaySpeed: Math.random() * 0.01 + 0.005,
          swayDistance: Math.random() * 20 + 8,
          swayOffset: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    if (showStars) {
      for (let i = 0; i < starCount; i++) {
        const outer = Math.random() * 4.5 + 3.5; // 3.5px to 8px 4-point stars
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          outerRadius: outer,
          innerRadius: outer * 0.22,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.004,
          baseAlpha: Math.random() * 0.55 + 0.35,
          pulseSpeed: Math.random() * 0.025 + 0.012,
          pulseOffset: Math.random() * Math.PI * 2,
          speedY: Math.random() * 0.12 + 0.05, // very slow celestial drift
        });
      }
    }

    const draw4PointStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      outerR: number,
      innerR: number,
      angle: number
    ) => {
      c.save();
      c.translate(cx, cy);
      c.rotate(angle);
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        const rot = (i * Math.PI) / 2;
        c.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
        c.lineTo(Math.cos(rot + Math.PI / 4) * innerR, Math.sin(rot + Math.PI / 4) * innerR);
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Gold color based on theme
      const goldR = isDark ? 254 : 184;
      const goldG = isDark ? 212 : 151;
      const goldB = isDark ? 136 : 88;

      // 1. Draw floating golden dust
      if (showDust) {
        particles.forEach((p) => {
          p.y -= p.speedY;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          const swayX = p.x + Math.sin(time * p.swaySpeed + p.swayOffset) * p.swayDistance;
          p.currentAlpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(time * p.pulseSpeed + p.pulseOffset));

          ctx.beginPath();
          ctx.arc(swayX, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${goldR}, ${goldG}, ${goldB}, ${p.currentAlpha})`;
          ctx.shadowColor = `rgba(${goldR}, ${goldG}, ${goldB}, 0.6)`;
          ctx.shadowBlur = p.radius * 3;
          ctx.fill();
        });
      }

      // 2. Draw twinkling 4-point celestial star sprinkles
      if (showStars) {
        stars.forEach((s) => {
          s.y -= s.speedY;
          s.rotation += s.rotSpeed;
          if (s.y < -15) {
            s.y = height + 15;
            s.x = Math.random() * width;
          }

          // Gentle twinkling sparkle
          const currentAlpha =
            s.baseAlpha * (0.5 + 0.5 * Math.sin(time * s.pulseSpeed + s.pulseOffset));

          ctx.fillStyle = `rgba(${goldR}, ${goldG}, ${goldB}, ${currentAlpha})`;
          ctx.shadowColor = `rgba(${goldR}, ${goldG}, ${goldB}, ${currentAlpha * 0.8})`;
          ctx.shadowBlur = s.outerRadius * 2.5;

          draw4PointStar(ctx, s.x, s.y, s.outerRadius, s.innerRadius, s.rotation);
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showDust, showStars, isDark]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── 1. BASE LIVING CANVAS COLOR ── */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: isDark ? '#11080d' : '#f7ecee' }}
      />

      {/* ── 2. MOVING SILK FABRIC WAVES (Option 1 & 6) ── */}
      {showSilkWaves && (
        <div className="absolute inset-0 overflow-hidden opacity-40 dark:opacity-60 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-700">
          {/* Wave Layer 1: Primary Brand Silk Curve */}
          <div
            className="absolute -top-[20%] -left-[15%] w-[130%] h-[110%] rounded-[45%_55%_65%_35%/40%_60%_40%_60%] blur-[70px] sm:blur-[100px] animate-silk-1 pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(108, 46, 62, 0.45) 0%, rgba(184, 151, 88, 0.22) 45%, transparent 75%)'
                : 'radial-gradient(ellipse at center, rgba(230, 195, 204, 0.6) 0%, rgba(218, 178, 187, 0.35) 45%, transparent 75%)',
            }}
          />

          {/* Wave Layer 2: Counter-drifting Metallic Silk Ribbon */}
          <div
            className="absolute -bottom-[25%] -right-[15%] w-[125%] h-[105%] rounded-[60%_40%_45%_55%/50%_45%_55%_50%] blur-[80px] sm:blur-[110px] animate-silk-2 pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at center, rgba(184, 151, 88, 0.3) 0%, rgba(86, 34, 48, 0.4) 40%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(245, 215, 222, 0.55) 0%, rgba(235, 195, 160, 0.25) 50%, transparent 70%)',
            }}
          />

          {/* Center Subtle Diagonal Silk Sheen */}
          <div
            className="absolute top-[25%] left-[10%] w-[80%] h-[55%] -rotate-12 rounded-[50%] blur-[90px] opacity-40 dark:opacity-35 animate-subtle-float"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(254, 212, 136, 0.15) 0%, rgba(108, 46, 62, 0.25) 50%, transparent 80%)'
                : 'linear-gradient(135deg, rgba(254, 212, 136, 0.25) 0%, rgba(240, 205, 215, 0.4) 50%, transparent 80%)',
            }}
          />
        </div>
      )}

      {/* ── 3. LUXURY BOKEH ATMOSPHERE (Option 5) ── */}
      {showBokeh && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-35 dark:opacity-45">
          {/* Bokeh Orb 1 - Top Left */}
          <div
            className="absolute top-[8%] left-[12%] w-48 sm:w-72 h-48 sm:h-72 rounded-full blur-[60px] animate-bokeh-drift"
            style={{
              background: isDark
                ? 'radial-gradient(circle, rgba(254, 212, 136, 0.25) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(220, 168, 181, 0.35) 0%, transparent 70%)',
            }}
          />

          {/* Bokeh Orb 2 - Middle Right */}
          <div
            className="absolute top-[45%] right-[8%] w-56 sm:w-80 h-56 sm:h-80 rounded-full blur-[70px] animate-bokeh-drift"
            style={{
              animationDelay: '-6s',
              background: isDark
                ? 'radial-gradient(circle, rgba(184, 151, 88, 0.22) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(240, 210, 180, 0.3) 0%, transparent 70%)',
            }}
          />

          {/* Bokeh Orb 3 - Bottom Left */}
          <div
            className="absolute bottom-[10%] left-[20%] w-60 sm:w-96 h-60 sm:h-96 rounded-full blur-[80px] animate-bokeh-drift"
            style={{
              animationDelay: '-11s',
              background: isDark
                ? 'radial-gradient(circle, rgba(108, 46, 62, 0.35) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(245, 220, 228, 0.45) 0%, transparent 70%)',
            }}
          />
        </div>
      )}

      {/* ── 4. SOFT LIGHT RAYS (Option 3) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
        <div
          className="absolute -top-[30%] -left-[10%] w-[120%] h-[120%] animate-ray-shift origin-top-left"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 0% 0%, rgba(254, 212, 136, 0.2) 0%, rgba(184, 151, 88, 0.08) 35%, transparent 65%)'
              : 'radial-gradient(ellipse at 0% 0%, rgba(254, 212, 136, 0.35) 0%, rgba(220, 168, 181, 0.15) 40%, transparent 65%)',
          }}
        />
      </div>

      {/* ── 5. ABSTRACT FLORAL SHADOWS (Option 4 & 6) ── */}
      {showFloralShadows && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15 dark:opacity-20 mix-blend-overlay dark:mix-blend-screen">
          {/* Stylized floral branch shadow top-right */}
          <svg
            className="absolute top-[-5%] right-[-5%] w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] text-[#b89758] animate-subtle-float"
            viewBox="0 0 200 200"
            fill="currentColor"
            style={{ filter: 'blur(12px)', transformOrigin: 'top right' }}
          >
            <path d="M140,20 Q160,50 170,90 Q150,85 130,95 Q145,65 140,20 Z" opacity="0.4" />
            <path d="M120,60 Q150,80 145,120 Q130,105 110,110 Q120,85 120,60 Z" opacity="0.3" />
            <path d="M90,90 Q125,105 115,145 Q100,130 85,135 Q90,110 90,90 Z" opacity="0.25" />
            <path d="M170,80 Q190,110 185,140 Q170,130 155,135 Q165,105 170,80 Z" opacity="0.3" />
          </svg>

          {/* Stylized botanical flourish bottom-left */}
          <svg
            className="absolute bottom-[-5%] left-[-5%] w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] text-[#6c2e3e] dark:text-[#b89758] animate-subtle-float"
            viewBox="0 0 200 200"
            fill="currentColor"
            style={{ filter: 'blur(14px)', transformOrigin: 'bottom left', animationDelay: '-4s' }}
          >
            <path d="M40,160 Q60,130 90,120 Q85,140 95,160 Q65,145 40,160 Z" opacity="0.3" />
            <path d="M70,130 Q100,100 130,110 Q115,125 120,145 Q95,130 70,130 Z" opacity="0.25" />
          </svg>
        </div>
      )}

      {/* ── 6. FLOATING GOLDEN DUST PARTICLES CANVAS (Option 2 & 6) ── */}
      {showDust && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* ── 7. SEPARATION LAYER / OPACITY CONTROL VEIL ── */}
      {/* This layer sits between the moving backdrop and foreground content */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500 backdrop-blur-[1.5px]"
        style={{
          backgroundColor: isDark
            ? 'rgba(18, 9, 13, 0.82)'
            : `rgba(247, 236, 238, ${veilOpacity})`,
        }}
      />
    </div>
  );
};
