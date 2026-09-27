import React from 'react';
import { Sparkles, Globe, ArrowRight, ShieldAlert } from 'lucide-react';
import { MovingBackground } from '../MovingBackground';

interface TenantNotFoundProps {
  hostname?: string;
  onOpenPlatform?: () => void;
  onOpenLogin?: () => void;
}

export const TenantNotFound: React.FC<TenantNotFoundProps> = ({
  hostname,
  onOpenPlatform,
  onOpenLogin,
}) => {
  const displayHost = hostname || (typeof window !== 'undefined' ? window.location.hostname : 'this address');

  return (
    <div className="min-h-screen bg-[#12090d] text-[#fcecee] flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans'] relative overflow-hidden select-none">
      {/* Luxury ambient silk background */}
      <MovingBackground veilOpacity={0.88} />

      <div className="relative z-10 max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-[#1d0e15]/95 border border-[#b89758]/40 shadow-2xl backdrop-blur-md space-y-6">
        {/* Brand Crest */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#6c2e3e] via-[#b89758] to-[#fed488] flex items-center justify-center text-white shadow-xl shadow-[#6c2e3e]/50 border border-white/20">
          <Globe className="w-8 h-8 text-[#fed488]" />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-semibold uppercase tracking-widest">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Unregistered Workspace Host</span>
        </div>

        {/* Title & Copy */}
        <div className="space-y-2">
          <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl text-white font-medium">
            Salon Website Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#dfc3c9] leading-relaxed max-w-sm mx-auto">
            The address <code className="px-2 py-0.5 rounded bg-black/40 text-[#fed488] font-mono text-xs border border-white/10">{displayHost}</code> is not registered to an active salon website on our multi-tenant network.
          </p>
        </div>

        {/* Help Note for Salon Owners */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-left text-xs text-[#dfc3c9]/90 space-y-1.5">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#fed488]" />
            Are you a salon owner or artist?
          </p>
          <p className="text-[11px] text-zinc-400 leading-normal">
            If you recently provisioned this workspace or added a custom domain, ensure your domain is configured in the Master Admin registry and verified in your DNS settings.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onOpenPlatform && (
            <button
              type="button"
              onClick={onOpenPlatform}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6c2e3e] to-[#b89758] hover:opacity-95 text-white text-xs font-semibold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#fed488] text-xs font-semibold uppercase tracking-wider border border-[#b89758]/40 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              Platform Sign In
            </button>
          )}
        </div>

        {/* Footer Brand */}
        <div className="pt-4 border-t border-white/10 text-[10px] text-zinc-500 tracking-wider uppercase">
          AuraOS Multi-Tenant Architecture
        </div>
      </div>
    </div>
  );
};
