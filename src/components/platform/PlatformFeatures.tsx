import React from 'react';
import {
  Database,
  Lock,
  Users,
  ShieldCheck,
  Star,
  Layers,
  Calendar,
  Sliders,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface FeatureCard {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
}

const PLATFORM_FEATURES: FeatureCard[] = [
  {
    id: 'multi-tenant-isolation',
    icon: Database,
    title: 'Multi-Tenant Data Isolation',
    subtitle: 'Cryptographic Subcollection Separation',
    description:
      'Every studio operates inside its own isolated database subcollection. Server-enforced Firestore security rules guarantee zero cross-tenant leakage between competing studios.',
    tags: ['Firestore Rules', 'Zero Data Leakage', 'Enterprise Tenant Boundary'],
  },
  {
    id: 'atomic-slot-locks',
    icon: Lock,
    title: 'Atomic Slot Locks & Muhurat Holds',
    subtitle: 'Concurrency-Safe Reservation Engine',
    description:
      'Eliminates double-booking during peak wedding rush hours. Auspicious muhurat slots are protected by transaction-level atomic locks with automated hold expirations.',
    tags: ['Firestore Transactions', 'Race Condition Proof', 'Real-Time Sync'],
  },
  {
    id: 'private-crm',
    icon: Users,
    title: 'Private Studio CRM & Intelligence',
    subtitle: 'Scoped Client & Enquiry Vault',
    description:
      'Client contact details, enquiry records, and booking histories belong exclusively to the individual tenant. Encrypted storage ensures complete client relationship privacy.',
    tags: ['Scoped CRM', 'Confidential Records', 'Automated Enquiry Funnel'],
  },
  {
    id: 'rbac-delegation',
    icon: ShieldCheck,
    title: 'Granular RBAC & Staff Delegation',
    subtitle: 'Strict Least-Privilege Access Controls',
    description:
      'Delegate day-to-day operations to junior artists and studio managers without exposing financial logs, master tenant settings, or private client communication databases.',
    tags: ['Owner / Manager / Staff', 'Role Scoping', 'Employee Workspace'],
  },
  {
    id: 'review-moderation',
    icon: Star,
    title: 'Verified Review Moderation Pipeline',
    subtitle: 'Reputation Shielding & Attestations',
    description:
      'Studio reputation is protected against spam and malicious competitors. Tenant administrators can inspect, verify, and moderate genuine client testimonials before publishing.',
    tags: ['Verified Clients', 'Moderation Queue', 'Reputation Defense'],
  },
  {
    id: 'dynamic-catalog',
    icon: Layers,
    title: 'Dynamic Service Catalog & CMS',
    subtitle: 'Tiered Pricing & Bridal Package Configurator',
    description:
      'Publish bespoke bridal, cocktail, and occasion packages with real-time price updates, deposit rules, duration timings, and gallery showcases without developer intervention.',
    tags: ['Live CMS', 'Custom Bridal Packages', 'Instant Sync'],
  },
  {
    id: 'muhurat-calendar',
    icon: Calendar,
    title: 'High-Demand Muhurat Calendar',
    subtitle: 'Auspicious Date Management Engine',
    description:
      'Purpose-built for Indian luxury bridal seasons. Artists can mark auspicious wedding muhurat dates, enforce specialized deposit tiers, and manage blackout periods seamlessly.',
    tags: ['Muhurat Scheduling', 'Seasonal Tiering', 'Blackout Protection'],
  },
  {
    id: 'central-cockpit',
    icon: Sliders,
    title: 'Central Administration Cockpit',
    subtitle: 'Platform Tenant Provisioning & Telemetry',
    description:
      'Platform engineers monitor health, provision new studio domains, manage lifecycle states, and enforce global security posture without interfering in studio creative operations.',
    tags: ['Master Admin Cockpit', 'Tenant Provisioning', 'Platform Telemetry'],
  },
];

interface PlatformFeaturesProps {
  onOpenLogin?: () => void;
}

export const PlatformFeatures: React.FC<PlatformFeaturesProps> = ({ onOpenLogin }) => {
  return (
    <section id="features" className="relative py-28 bg-zinc-950 text-white overflow-hidden border-t border-zinc-800/80">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wider uppercase mb-5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Architecture & Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-100 tracking-tight leading-tight">
            Engineered Exclusively for{' '}
            <span className="italic font-normal text-amber-200">Luxury Bridal Ateliers</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            Generic salon booking software fails the complex realities of high-stakes wedding seasons.
            The Atelier Platform provides an enterprise-grade multi-tenant operating system.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {PLATFORM_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative flex flex-col justify-between p-7 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900/90 transition-all duration-300 shadow-lg hover:shadow-amber-500/5"
              >
                <div>
                  {/* Icon Badge */}
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400/80 block mb-1">
                    {feat.subtitle}
                  </span>
                  <h3 className="text-lg font-serif font-medium text-zinc-100 mb-3 group-hover:text-amber-200 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6">
                    {feat.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="pt-4 border-t border-zinc-800/60 flex flex-wrap gap-1.5">
                  {feat.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Bottom Callout */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-center sm:text-left">
            <h4 className="text-xl font-serif text-zinc-100">
              Ready to operate your studio with zero technical friction?
            </h4>
            <p className="text-sm text-zinc-400 mt-1">
              Access your studio console or request platform tenant provisioning.
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-sm font-semibold hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-950 cursor-pointer"
          >
            <span>Enter Studio Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
