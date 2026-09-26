import React from 'react';
import {
  Trophy,
  ExternalLink,
  ShieldCheck,
  Star,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  detail: string;
}

interface TenantSuccessCard {
  id: string;
  isFlagship: boolean;
  name: string;
  type: string;
  region: string;
  privacyBadge: string;
  description: string;
  metrics: Metric[];
  highlight: string;
}

const CLIENT_ACHIEVEMENTS: TenantSuccessCard[] = [
  {
    id: 'khushi-makeup-arts',
    isFlagship: true,
    name: 'Khushi Makeup Arts',
    type: 'Luxury Bridal Studio & Academy',
    region: 'Flagship Platform Tenant',
    privacyBadge: 'Public Showcase Tenant',
    description:
      'The premier flagship tenant of the Atelier Platform. Khushi Makeup Arts serves luxury brides across traditional and contemporary ceremonies with zero double-booking incidents across all muhurat seasons.',
    metrics: [
      { label: 'Bridal Transformations', value: '1,500+', detail: 'Verified bookings' },
      { label: 'Booking Concurrency Incidents', value: '0', detail: 'Protected by atomic locks' },
      { label: 'Client Satisfaction', value: '99.8%', detail: 'Verified bride reviews' },
      { label: 'Peak Muhurat Throughput', value: '100%', detail: 'Zero system downtime' },
    ],
    highlight: 'Operating on isolated subcollection with bespoke lookbook and atomic reservation pipeline.',
  },
  {
    id: 'south-mumbai-studio',
    isFlagship: false,
    name: 'Premier South Mumbai Atelier',
    type: 'High-End Bridal Lounge & Salon',
    region: 'Maharashtra (Confidential)',
    privacyBadge: 'Privacy-Preserving Record',
    description:
      'A distinguished bridal studio catering to high-net-worth brides in South Mumbai. Utilizes the Atelier Platform for high-deposit event scheduling and private client records.',
    metrics: [
      { label: 'Annual Wedding Bookings', value: '420+', detail: 'High-ticket bridal dates' },
      { label: 'Staff Workspaces', value: '8 Artists', detail: 'Delegated operational access' },
      { label: 'Lead-to-Booking Rate', value: '68%', detail: 'Automated enquiry workflow' },
      { label: 'Data Isolation Audit', value: 'Passed', detail: 'Server-enforced boundaries' },
    ],
    highlight: 'Protected under strict tenant data isolation. Client identities remain strictly confidential.',
  },
  {
    id: 'jaipur-destination',
    isFlagship: false,
    name: 'Palace Heritage Wedding Collective',
    type: 'Destination Wedding Styling Agency',
    region: 'Rajasthan (Confidential)',
    privacyBadge: 'Privacy-Preserving Record',
    description:
      'Specialized destination wedding artist group coordinating multi-day royal wedding ceremonies across Jaipur, Udaipur, and Jodhpur palaces.',
    metrics: [
      { label: 'Destination Events Handled', value: '85+', detail: 'Multi-day celebrations' },
      { label: 'Concurrent Artists Dispatched', value: '14', detail: 'Synchronized via platform' },
      { label: 'Enquiry Response Time', value: '< 15m', detail: 'Real-time studio CRM' },
      { label: 'Deposit Reconciliation', value: '100%', detail: 'Integrated booking ledger' },
    ],
    highlight: 'Zero cross-tenant visibility. Sovereign booking schedules and proprietary pricing models.',
  },
];

interface PlatformAchievementsProps {
  onNavigateToStorefront?: () => void;
}

export const PlatformAchievements: React.FC<PlatformAchievementsProps> = ({ onNavigateToStorefront }) => {
  return (
    <section id="achievements" className="relative py-28 bg-zinc-900 text-white overflow-hidden border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wider uppercase mb-5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Proven Platform Reliability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-100 tracking-tight leading-tight">
            Client Success &{' '}
            <span className="italic font-normal text-amber-200">Demonstrated Architecture</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            Our platform powers industry-leading bridal artists. We proudly showcase our public flagship tenant
            alongside privacy-preserving operational metrics from our confidential studio partners.
          </p>
        </div>

        {/* Success Cards */}
        <div className="space-y-8">
          {CLIENT_ACHIEVEMENTS.map((tenant) => (
            <div
              key={tenant.id}
              className={`p-8 sm:p-10 rounded-3xl border transition-all ${
                tenant.isFlagship
                  ? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-amber-500/50 shadow-2xl ring-1 ring-amber-500/20'
                  : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700/80 shadow-xl'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {tenant.privacyBadge}
                    </span>
                    <span className="text-xs text-zinc-400">{tenant.region}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-light text-zinc-100">
                    {tenant.name}
                  </h3>
                  <p className="text-sm text-zinc-400 font-light mt-1">{tenant.description}</p>
                </div>

                {tenant.isFlagship && onNavigateToStorefront && (
                  <button
                    onClick={onNavigateToStorefront}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-sm font-semibold hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shrink-0 cursor-pointer self-start lg:self-auto"
                  >
                    <span>Visit Live Storefront</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}

                {!tenant.isFlagship && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 shrink-0 self-start lg:self-auto">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Identity Anonymized for Privacy</span>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8">
                {tenant.metrics.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                    <div className="text-2xl sm:text-3xl font-serif font-medium text-amber-300">
                      {m.value}
                    </div>
                    <div className="text-xs font-medium text-zinc-200 mt-1">{m.label}</div>
                    <div className="text-[11px] text-zinc-400 font-light mt-0.5">{m.detail}</div>
                  </div>
                ))}
              </div>

              {/* Highlight footer */}
              <div className="pt-4 border-t border-zinc-800/60 flex items-center gap-2.5 text-xs text-zinc-400 font-light">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{tenant.highlight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
