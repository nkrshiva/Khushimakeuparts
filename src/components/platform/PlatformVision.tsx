import React from 'react';
import { Sparkles, HeartHandshake, ShieldCheck, Compass, ArrowRight } from 'lucide-react';

interface PlatformVisionProps {
  onOpenLogin?: () => void;
}

export const PlatformVision: React.FC<PlatformVisionProps> = ({ onOpenLogin }) => {
  return (
    <section id="vision" className="relative py-28 bg-zinc-900 text-white overflow-hidden border-t border-zinc-800">
      {/* Subtle gold spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Vision Statement */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wider uppercase mb-6">
              <Compass className="w-3.5 h-3.5" />
              <span>Our Philosophy & Mission</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-zinc-100 tracking-tight leading-tight">
              Elevating the Artistry of Bridal Beauty into a{' '}
              <span className="italic font-normal text-amber-200">Sovereign Luxury Operating System</span>
            </h2>
            <div className="mt-8 space-y-5 text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
              <p>
                Master bridal artists dedicate their lives to orchestrating once-in-a-lifetime transformations.
                Yet for years, elite studios have been forced to juggle chaotic chat threads, lost booking receipts,
                and clunky generic software that treats a luxury wedding day like a routine dental visit.
              </p>
              <p>
                The <strong>Atelier Platform</strong> was founded on a singular conviction:{' '}
                <em className="text-amber-200 font-normal">the infrastructure behind luxury beauty should be as refined as the artistry itself.</em>
              </p>
              <p>
                We provide the cryptographic guarantees, atomic scheduling locks, and sovereign data boundaries
                that enable artists to focus entirely on their craft while their digital studio runs with mathematical precision.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>Enter Atelier Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: 3 Pillars */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-7 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-medium text-zinc-100">
                  Sovereign Studio Ownership
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                You own your client relationships, booking history, and creative assets. No marketplace lock-in,
                no competitor suggestions on your booking link, and zero data exploitation.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-medium text-zinc-100">
                  Precision in Peak Season
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                Engineered for the intensity of wedding season. Muhurat date reservation locks, instant WhatsApp routing,
                and real-time booking deposits eliminate missed dates and double bookings forever.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-base font-serif font-medium text-zinc-100">
                  Bespoke Luxury Standard
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                From typography and imagery to booking receipts and lookbook portfolios, every touchpoint reflects
                the timeless prestige of a premier luxury bridal atelier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
