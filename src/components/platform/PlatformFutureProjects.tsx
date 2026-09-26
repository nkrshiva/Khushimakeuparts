import React from 'react';
import {
  Rocket,
  CheckCircle2,
  Clock,
  Smartphone,
  MessageSquare,
  CreditCard,
  Sparkles,
  CalendarDays,
  ShieldAlert
} from 'lucide-react';

interface RoadmapItem {
  id: string;
  category: 'AVAILABLE_NOW' | 'ROADMAP';
  title: string;
  quarter: string;
  description: string;
  icon: React.ElementType;
  statusText: string;
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  // Available Now
  {
    id: 'now-identity',
    category: 'AVAILABLE_NOW',
    title: 'Universal Identity Resolution & Routing',
    quarter: 'Production Active',
    description:
      'Deterministic identity resolution directing Master Admins, Tenant Admins, and Staff to their authorized consoles.',
    icon: CheckCircle2,
    statusText: 'Verified & Deployed',
  },
  {
    id: 'now-atomic-locks',
    category: 'AVAILABLE_NOW',
    title: 'Atomic Slot Lock Booking Engine',
    quarter: 'Production Active',
    description:
      'Firestore transaction-level locks ensuring zero double-booking during intense wedding muhurat rushes.',
    icon: CheckCircle2,
    statusText: 'Verified & Deployed',
  },
  {
    id: 'now-tenant-isolation',
    category: 'AVAILABLE_NOW',
    title: 'Server-Enforced Multi-Tenant Isolation',
    quarter: 'Production Active',
    description:
      'Subcollection partition boundaries backed by 105+ automated security rule tests with zero cross-tenant leakage.',
    icon: CheckCircle2,
    statusText: 'Verified & Deployed',
  },
  {
    id: 'now-employee-workspace',
    category: 'AVAILABLE_NOW',
    title: 'Role-Scoped Employee Workspace',
    quarter: 'Production Active',
    description:
      'Dedicated staff portal providing schedule access without exposing administrative settings or tenant billing data.',
    icon: CheckCircle2,
    statusText: 'Verified & Deployed',
  },

  // Roadmap / Coming Soon
  {
    id: 'future-whatsapp',
    category: 'ROADMAP',
    title: 'WhatsApp Business API Bride Reminders',
    quarter: 'Q1 2027',
    description:
      'Automated appointment confirmations, wedding morning checklists, and bridal skin prep schedules dispatched via official WhatsApp API.',
    icon: MessageSquare,
    statusText: 'In Active Engineering',
  },
  {
    id: 'future-mobile-app',
    category: 'ROADMAP',
    title: 'Native Mobile Staff & On-Location App',
    quarter: 'Q2 2027',
    description:
      'Offline-capable iOS & Android companion app for bridal artists dispatched to destination wedding venues and hotel suites.',
    icon: Smartphone,
    statusText: 'Architecture Planned',
  },
  {
    id: 'future-payment-gateway',
    category: 'ROADMAP',
    title: 'Direct Multi-Currency Payment Gateway',
    quarter: 'Q2 2027',
    description:
      'Automated advance deposit collection supporting international NRI bride cards, UPI QR codes, and instant invoice generation.',
    icon: CreditCard,
    statusText: 'Integration Discovery',
  },
  {
    id: 'future-ai-palette',
    category: 'ROADMAP',
    title: 'AI Bridal Palette & Lookbook Matcher',
    quarter: 'Q3 2027',
    description:
      'Machine learning model matching bridal lehenga color palettes and skin undertones to recommend optimal makeup packages and shades.',
    icon: Sparkles,
    statusText: 'Research & Feasibility',
  },
];

export const PlatformFutureProjects: React.FC = () => {
  const availableItems = ROADMAP_ITEMS.filter((i) => i.category === 'AVAILABLE_NOW');
  const roadmapItems = ROADMAP_ITEMS.filter((i) => i.category === 'ROADMAP');

  return (
    <section id="roadmap" className="relative py-28 bg-zinc-950 text-white overflow-hidden border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wider uppercase mb-5">
            <Rocket className="w-3.5 h-3.5" />
            <span>Platform Evolution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-100 tracking-tight leading-tight">
            Current Capabilities &{' '}
            <span className="italic font-normal text-amber-200">Forward Roadmap</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            We maintain strict transparency between what is proven and operating in production right now
            versus capabilities currently progressing along our engineering roadmap.
          </p>
        </div>

        {/* Two Column Layout: Available Now vs Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Available Now Column */}
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900/60 border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-medium text-zinc-100">Available Now</h3>
                  <span className="text-xs text-emerald-400 font-mono">Live in Production</span>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                100% Operational
              </span>
            </div>

            <div className="space-y-5">
              {availableItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h4 className="text-base font-serif font-medium text-zinc-200">{item.title}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                        {item.statusText}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed pl-6.5">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Roadmap / In Development Column */}
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900/60 border border-amber-500/30 shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-medium text-zinc-100">Forward Roadmap</h3>
                  <span className="text-xs text-amber-400 font-mono">Under Active Development</span>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Next Releases
              </span>
            </div>

            <div className="space-y-5">
              {roadmapItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                        <h4 className="text-base font-serif font-medium text-zinc-200">{item.title}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400/90 shrink-0 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {item.quarter}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed pl-6.5">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
