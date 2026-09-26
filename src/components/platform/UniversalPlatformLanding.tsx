import React from 'react';
import { PlatformHeader } from './PlatformHeader';
import { PlatformHero } from './PlatformHero';
import { PlatformFeatures } from './PlatformFeatures';
import { PlatformShowcase } from './PlatformShowcase';
import { PlatformServices } from './PlatformServices';
import { PlatformAchievements } from './PlatformAchievements';
import { PlatformFutureProjects } from './PlatformFutureProjects';
import { PlatformVision } from './PlatformVision';
import { PlatformFooter } from './PlatformFooter';

interface UniversalPlatformLandingProps {
  onOpenLogin: () => void;
  onNavigateToStorefront: () => void;
}

export const UniversalPlatformLanding: React.FC<UniversalPlatformLandingProps> = ({
  onOpenLogin,
  onNavigateToStorefront,
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navigation Header */}
      <PlatformHeader
        onOpenLogin={onOpenLogin}
        onNavigateStorefront={onNavigateToStorefront}
      />

      {/* Main Sections */}
      <main>
        {/* Hero Section with Carousel & Animated Login CTA */}
        <PlatformHero
          onOpenLogin={onOpenLogin}
        />

        {/* 8 Core Capabilities */}
        <PlatformFeatures onOpenLogin={onOpenLogin} />

        {/* 5-Tier Architecture Showcase */}
        <PlatformShowcase onNavigateToStorefront={onNavigateToStorefront} />

        {/* Platform Solutions / Services */}
        <PlatformServices onOpenLogin={onOpenLogin} />

        {/* Client Success: Flagship + Confidential Tenants */}
        <PlatformAchievements onNavigateToStorefront={onNavigateToStorefront} />

        {/* Roadmap: Available Now vs Future Releases */}
        <PlatformFutureProjects />

        {/* Platform Vision & Philosophy */}
        <PlatformVision onOpenLogin={onOpenLogin} />
      </main>

      {/* Platform Footer */}
      <PlatformFooter
        onOpenLogin={onOpenLogin}
        onNavigateToStorefront={onNavigateToStorefront}
      />
    </div>
  );
};
