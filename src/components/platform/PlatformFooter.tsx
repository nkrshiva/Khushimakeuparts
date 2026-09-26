import React from 'react';
import { Sparkles, Shield, ExternalLink, Terminal, CheckCircle2 } from 'lucide-react';

interface PlatformFooterProps {
  onOpenLogin: () => void;
  onNavigateToStorefront?: () => void;
}

export const PlatformFooter: React.FC<PlatformFooterProps> = ({
  onOpenLogin,
  onNavigateToStorefront,
}) => {
  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800/80">
          {/* Brand & Mission column (2 cols wide on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 shadow-md">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-serif tracking-widest text-lg font-light uppercase text-zinc-100 block">
                  Atelier
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 block -mt-1">
                  Platform Engine
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
              The high-precision multi-tenant operating engine powering bespoke bridal studios, luxury salon chains, and master makeup artists worldwide.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational — Firestore Engine Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Platform Architecture
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-light">
              <li>
                <a href="#features" className="hover:text-zinc-200 transition-colors">
                  Core Capabilities
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-zinc-200 transition-colors">
                  5-Tier Architecture
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-zinc-200 transition-colors">
                  Studio Editions
                </a>
              </li>
              <li>
                <a href="#roadmap" className="hover:text-zinc-200 transition-colors">
                  Release Roadmap
                </a>
              </li>
              <li>
                <a href="#vision" className="hover:text-zinc-200 transition-colors">
                  Philosophy & Mission
                </a>
              </li>
            </ul>
          </div>

          {/* Tenants & Flagship */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Active Tenants
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-light">
              <li>
                <button
                  onClick={onNavigateToStorefront}
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>Khushi Makeup Arts</span>
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                </button>
              </li>
              <li className="text-zinc-500">South Mumbai Studio (Confidential)</li>
              <li className="text-zinc-500">Jaipur Collective (Confidential)</li>
              <li className="pt-2">
                <a href="#achievements" className="text-amber-400/90 hover:underline">
                  View Verified Metrics →
                </a>
              </li>
            </ul>
          </div>

          {/* Universal Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Platform Consoles
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-light">
              <li>
                <button
                  onClick={onOpenLogin}
                  className="text-amber-300 hover:text-amber-200 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Universal Login Portal</span>
                  <Sparkles className="w-3 h-3" />
                </button>
              </li>
              <li>
                <a
                  href="#masteradmin"
                  className="hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Terminal className="w-3 h-3 text-zinc-500" />
                  <span>Developer Cockpit</span>
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Staff Workspace Portal</span>
              </li>
              <li>
                <span className="text-zinc-500">Tenant Provisioning API</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} Atelier Platform Technologies. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-zinc-400 text-center sm:text-right">
            <span>Khushi Makeup Arts is an independent tenant operating on this platform.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
