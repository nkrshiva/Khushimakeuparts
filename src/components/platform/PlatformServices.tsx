import React from 'react';
import {
  Sparkles,
  Building,
  Crown,
  Globe,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface PlatformService {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  idealFor: string;
  turnaround: string;
  features: string[];
  popular?: boolean;
}

const PLATFORM_SERVICES: PlatformService[] = [
  {
    id: 'studio-os',
    name: 'Atelier Studio OS',
    tagline: 'Independent Bridal Artists & Boutique Studios',
    badge: 'Flagship Edition',
    icon: Sparkles,
    description:
      'Complete end-to-end digital atelier for master bridal artists. Turn high-intent bride inquiries into confirmed calendar reservations with zero scheduling friction.',
    idealFor: 'Solo luxury bridal artists, celebrity hair & makeup artists, boutique studio founders.',
    turnaround: 'Rapid Deployment (24-48 Hours)',
    features: [
      'High-converting bespoke bridal storefront',
      'Atomic slot lock booking engine with advance deposit rules',
      'Client relationship & wedding inquiry CRM',
      'Verified bride review moderation system',
      'Dynamic bridal package & lookbook CMS',
    ],
    popular: true,
  },
  {
    id: 'salon-suite',
    name: 'Multi-Location Salon Suite',
    tagline: 'Multi-Chair Salons & Branch Networks',
    badge: 'Multi-Branch',
    icon: Building,
    description:
      'Centralized management for premium salon brands operating multiple branches, senior styling chairs, or bridal lounges across metropolitan areas.',
    idealFor: 'Multi-chair luxury salons, regional beauty studios with multiple operating locations.',
    turnaround: 'Tailored Configuration (3-5 Days)',
    features: [
      'Multi-branch directory and location routing',
      'Delegated employee workspaces for junior stylists',
      'Centralized owner analytics with branch-level isolation',
      'Consolidated staff rosters & shift scheduling',
      'Location-specific service catalogs and pricing',
    ],
  },
  {
    id: 'wedding-agency',
    name: 'High-Volume Wedding Agency',
    tagline: 'Artist Collectives & Destination Agencies',
    badge: 'Agency Pro',
    icon: Crown,
    description:
      'Engineered for agency founders managing a roster of 10+ professional bridal artists across peak wedding muhurat dates and luxury destination events.',
    idealFor: 'Bridal artist agencies, wedding styling collectives, luxury event makeup consortiums.',
    turnaround: 'Custom Onboarding (1 Week)',
    features: [
      'Multi-artist dispatching and muhurat slot allocation',
      'High-demand date surge protection and tiering',
      'Contract & bridal advance tracking',
      'Multi-venue travel & logistics scheduling',
      'Agency-wide client history & preference profiles',
    ],
  },
  {
    id: 'enterprise-whitelabel',
    name: 'Enterprise Brand White-Label',
    tagline: 'Global Cosmetics Brands & Academy Portals',
    badge: 'White-Label',
    icon: Globe,
    description:
      'Full white-label deployment with bespoke domain routing, custom CSS theming, dedicated Cloud Firestore instances, and proprietary academy modules.',
    idealFor: 'Cosmetics academy chains, international beauty brands, luxury hotel spa networks.',
    turnaround: 'Enterprise Engagement',
    features: [
      'Custom domain & SSL certificate provisioning',
      'Dedicated tenant namespace with custom branding',
      'Custom role-based access control matrix',
      'Enterprise SLA & 24/7 dedicated support',
      'Direct API integrations with existing enterprise ERPs',
    ],
  },
];

interface PlatformServicesProps {
  onOpenLogin?: () => void;
}

export const PlatformServices: React.FC<PlatformServicesProps> = ({ onOpenLogin }) => {
  return (
    <section id="services" className="relative py-28 bg-zinc-950 text-white overflow-hidden border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wider uppercase mb-5">
            <Crown className="w-3.5 h-3.5" />
            <span>Platform Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-100 tracking-tight leading-tight">
            Tailored Solutions for Every{' '}
            <span className="italic font-normal text-amber-200">Scale of Beauty Enterprise</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            From acclaimed solo artists to multi-branch luxury salon brands, the Atelier Platform powers
            flawless client onboarding, booking reliability, and brand prestige.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PLATFORM_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className={`relative flex flex-col justify-between p-8 sm:p-10 rounded-3xl border transition-all duration-300 ${
                  srv.popular
                    ? 'bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border-amber-500/50 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/20'
                    : 'bg-zinc-900/60 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/90 shadow-xl'
                }`}
              >
                {srv.popular && (
                  <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-md">
                    Most Selected
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700">
                      {srv.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-light text-zinc-100">{srv.name}</h3>
                  <div className="text-sm font-medium text-amber-400/90 mt-1 mb-4">{srv.tagline}</div>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6">
                    {srv.description}
                  </p>

                  {/* Ideal For & Turnaround */}
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 mb-6 text-xs">
                    <div className="text-zinc-400">
                      <strong className="text-zinc-200">Ideal For:</strong> {srv.idealFor}
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-300/90">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{srv.turnaround}</span>
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-2.5 mb-8">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                      Included Architecture:
                    </span>
                    {srv.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-sm text-zinc-300 font-light">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={onOpenLogin}
                  className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    srv.popular
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700/80'
                  }`}
                >
                  <span>Select Configuration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
