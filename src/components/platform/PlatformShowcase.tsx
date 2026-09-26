import React, { useState } from 'react';
import {
  Layers,
  Shield,
  Building2,
  Sliders,
  UserCheck,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface TierData {
  id: string;
  tierNumber: string;
  name: string;
  role: string;
  scope: string;
  icon: React.ElementType;
  badge: string;
  details: string[];
  securityConstraint: string;
}

const ARCHITECTURE_TIERS: TierData[] = [
  {
    id: 'tier-platform',
    tierNumber: 'Tier 01',
    name: 'Platform Foundation & Security Kernel',
    role: 'Central Platform Infrastructure',
    scope: 'System-Wide (/platform, /users, /tenants)',
    icon: Shield,
    badge: 'Security Root',
    details: [
      'Universal Identity Resolution Service (Step 16 Authoritative Gate)',
      'Tamper-proof Firestore Security Rules protecting cross-tenant isolation',
      'Firebase Authentication infrastructure with email verification & claim enforcement',
      'Central Developer Cockpit (#masteradmin) for tenant lifecycle management',
    ],
    securityConstraint: 'Strict Developer/Master Admin access only. Zero tenant read access across registries.',
  },
  {
    id: 'tier-registry',
    tierNumber: 'Tier 02',
    name: 'Tenant Registry & Provisioning Engine',
    role: 'Tenant Directory & Domain Router',
    scope: 'Platform Domain Routing & Status Enforcement',
    icon: Building2,
    badge: 'Registry Directory',
    details: [
      'Multi-tenant directory with active, suspended, and provisioned status controls',
      'Automatic routing by subdomain, custom domain, query parameter, or hash slug',
      'Tenant isolation verification ensuring distinct subcollection partitions',
      'Audit log trail for tenant status transitions and configuration updates',
    ],
    securityConstraint: 'Suspended tenants are automatically diverted to the NoWorkspace checkpoint.',
  },
  {
    id: 'tier-tenant-os',
    tierNumber: 'Tier 03',
    name: 'Scoped Tenant Operating System',
    role: 'Studio Owner & Admin CMS',
    scope: 'Isolated Tenant Subcollection (/tenants/{tenantId})',
    icon: Sliders,
    badge: 'Tenant Studio OS',
    details: [
      'Comprehensive Booking Engine with real-time appointment pipeline and deposits',
      'Private Customer Database and scoped wedding enquiry management',
      'Bespoke Bridal Catalog CMS with pricing, packages, and duration configurations',
      'Review Moderation Pipeline with attestation and approval gates',
      'Media Vault backed by structured storage paths (/tenants/{tenantId}/media)',
    ],
    securityConstraint: 'Requires Owner or Admin role matching the exact active tenantId.',
  },
  {
    id: 'tier-employee',
    tierNumber: 'Tier 04',
    name: 'Staff & Employee Workspace',
    role: 'Delegated Operational Staff',
    scope: 'Least-Privilege Tenant Roster',
    icon: UserCheck,
    badge: 'Operational Workspace',
    details: [
      'Focused, uncluttered appointment schedule and daily client rosters',
      'Direct service notes and preparation requirements for booked sessions',
      'No access to financial analytics, tenant billing, or raw client export databases',
      'Instant logout and session isolation upon duty completion',
    ],
    securityConstraint: 'Role-scoped to Employee/Staff. Cannot alter pricing or delete records.',
  },
  {
    id: 'tier-storefront',
    tierNumber: 'Tier 05',
    name: 'Public Luxury Storefront Experience',
    role: 'End-Consumer Client Experience',
    scope: 'Public Browsing & Client Onboarding',
    icon: Sparkles,
    badge: 'Client Storefront',
    details: [
      'High-performance luxury bridal brand website (e.g. Khushi Makeup Arts)',
      'Interactive bridal lookbook, before-and-after transformations, video portfolio',
      'Instant availability checker and dynamic inquiry submission flow',
      'SEO-optimized metadata and high-converting bridal package showcases',
    ],
    securityConstraint: 'Public read-only catalog access. Enquiries and booking drafts submit to isolated queues.',
  },
];

interface PlatformShowcaseProps {
  onNavigateToStorefront?: () => void;
}

export const PlatformShowcase: React.FC<PlatformShowcaseProps> = ({ onNavigateToStorefront }) => {
  const [activeTierId, setActiveTierId] = useState<string>('tier-platform');
  const activeTier = ARCHITECTURE_TIERS.find((t) => t.id === activeTierId) || ARCHITECTURE_TIERS[0];
  const ActiveIcon = activeTier.icon;

  return (
    <section id="showcase" className="relative py-28 bg-zinc-900 text-white overflow-hidden border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wider uppercase mb-5">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Tier Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-100 tracking-tight leading-tight">
            Separation of Concerns,{' '}
            <span className="italic font-normal text-amber-200">Uncompromising Security</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            The Atelier Platform is deliberately structured across 5 autonomous layers.
            Explore each tier to see how security, operational autonomy, and luxury presentation harmoniously coexist.
          </p>
        </div>

        {/* Interactive Architecture Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tier Selector Sidebar (5 columns on large screen) */}
          <div className="lg:col-span-5 space-y-3">
            {ARCHITECTURE_TIERS.map((tier) => {
              const TierIcon = tier.icon;
              const isSelected = tier.id === activeTierId;
              return (
                <button
                  key={tier.id}
                  onClick={() => setActiveTierId(tier.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950/90'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400 group-hover:text-amber-300 group-hover:bg-zinc-700'
                      }`}
                    >
                      <TierIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                          {tier.tierNumber}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {tier.badge}
                        </span>
                      </div>
                      <h4
                        className={`text-sm font-medium truncate mt-0.5 ${
                          isSelected ? 'text-zinc-100 font-semibold' : 'text-zinc-300'
                        }`}
                      >
                        {tier.name}
                      </h4>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-amber-400 translate-x-1' : 'text-zinc-600 group-hover:text-zinc-400'
                    }`}
                  />
                </button>
              );
            })}

            {/* Live Flagship Link */}
            {onNavigateToStorefront && (
              <div className="pt-4">
                <button
                  onClick={onNavigateToStorefront}
                  className="w-full p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 text-left flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 block">
                      Live Production Storefront
                    </span>
                    <span className="text-sm font-serif font-medium text-zinc-100">
                      Experience Tier 05: Khushi Makeup Arts
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Tier Detail Card (7 columns on large screen) */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl relative">
            {/* Top metadata */}
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <ActiveIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-widest">
                      {activeTier.tierNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {activeTier.role}
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-light text-zinc-100 mt-1">
                    {activeTier.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Scope Identifier */}
            <div className="py-4">
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Data Scope & Subcollection Partition
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-amber-300">
                {activeTier.scope}
              </div>
            </div>

            {/* Key Capabilities */}
            <div className="py-4">
              <h4 className="text-sm font-serif font-medium text-zinc-200 mb-3">
                Architectural Responsibilities
              </h4>
              <ul className="space-y-3">
                {activeTier.details.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300 font-light">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security Constraint Callout */}
            <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-300 block mb-0.5">
                  Security Invariant
                </strong>
                {activeTier.securityConstraint}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
