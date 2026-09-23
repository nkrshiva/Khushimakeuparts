import React from 'react';
import {
  BusinessArchetype,
  ModuleId
} from '../../types';
import { ARCHETYPE_PRESETS, MODULE_REGISTRY } from '../../data/archetypePresets';
import { SlideToggle } from '../AdminPanel';
import { Sparkles, Layers, CheckCircle2, Sliders, Info, ShieldCheck } from 'lucide-react';

interface ArchetypeModulesTabProps {
  currentArchetype: BusinessArchetype;
  enabledModules: Partial<Record<ModuleId, boolean>>;
  onSwitchArchetype: (archetype: BusinessArchetype) => void;
  onToggleModule: (moduleId: ModuleId, val: boolean) => void;
}

export const ArchetypeModulesTab: React.FC<ArchetypeModulesTabProps> = ({
  currentArchetype,
  enabledModules,
  onSwitchArchetype,
  onToggleModule,
}) => {
  const archetypesList = Object.values(ARCHETYPE_PRESETS);

  // Group modules by category
  const categories = [
    { key: 'booking', label: 'Booking & Scheduling Engine' },
    { key: 'operations', label: 'Salon & Staff Operations' },
    { key: 'content', label: 'Services & Content Architecture' },
    { key: 'marketing', label: 'Marketing, Portfolio & Lead Gen' },
  ] as const;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#6c2e3e]/40 via-purple-900/20 to-black/40 border border-[#fed488]/30">
        <div className="flex items-center gap-2.5 text-[#fed488] mb-1.5">
          <Sparkles className="w-5 h-5 text-[#fed488]" />
          <h2 className="font-['Playfair_Display'] text-xl font-semibold">
            Business Archetypes & Modular Capabilities
          </h2>
        </div>
        <p className="text-xs text-[#dfc3c9] leading-relaxed max-w-2xl">
          Switch your business archetype preset or toggle individual modules on and off at any time.
          Modules instantly adapt the public website experience, appointment workflows, and admin management tabs without needing code migrations.
        </p>
      </div>

      {/* Archetype Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-['Playfair_Display'] text-lg text-white font-medium flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#fed488]" />
            <span>Select Archetype Preset</span>
          </h3>
          <span className="text-[11px] text-[#fed488]/80 font-mono">
            Active: {ARCHETYPE_PRESETS[currentArchetype]?.name || 'Custom'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {archetypesList.map((arch) => {
            const isSelected = currentArchetype === arch.id;
            return (
              <div
                key={arch.id}
                onClick={() => onSwitchArchetype(arch.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#fed488]/15 border-[#fed488] shadow-lg shadow-[#fed488]/10 ring-1 ring-[#fed488]'
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/8'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fed488] text-[#562230] text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ACTIVE</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{arch.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-[#fed488] font-mono">
                    {arch.badge}
                  </span>
                </div>
                <p className="text-xs text-[#fed488]/90 font-medium mt-1">{arch.tagline}</p>
                <p className="text-[11px] text-[#dfc3c9]/80 mt-1.5 leading-relaxed">{arch.description}</p>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/30 text-[#dfc3c9]">
                    Client: {arch.terminology.clientNoun}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/30 text-[#dfc3c9]">
                    Booking: {arch.terminology.bookingNoun}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/30 text-[#dfc3c9]">
                    Area: {arch.terminology.serviceAreaNoun}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Granular Module Toggles */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-['Playfair_Display'] text-lg text-white font-medium flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#fed488]" />
              <span>Granular Module Toggles</span>
            </h3>
            <p className="text-[11px] text-[#dfc3c9]/70">
              Customize which features and tabs are active for this client website.
            </p>
          </div>
        </div>

        {categories.map((cat) => {
          const modulesInCat = MODULE_REGISTRY.filter((m) => m.category === cat.key);
          if (modulesInCat.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-[#fed488] font-semibold">
                {cat.label}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modulesInCat.map((mod) => {
                  const isEnabled = enabledModules[mod.id] ?? mod.defaultEnabled;
                  return (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{mod.name}</span>
                          <span className="text-[9px] font-mono text-[#dfc3c9]/60 px-1.5 py-0.2 rounded bg-black/40">
                            {mod.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#dfc3c9]/80 mt-0.5 leading-snug">
                          {mod.description}
                        </p>
                      </div>
                      <SlideToggle
                        checked={isEnabled}
                        onChange={(val) => onToggleModule(mod.id, val)}
                        size="sm"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#dfc3c9] flex items-center gap-2">
        <Info className="w-4 h-4 text-[#fed488] shrink-0" />
        <span>
          Click <strong>"Save All Changes"</strong> in the top bar to apply your selected archetype and modules.
        </span>
      </div>
    </div>
  );
};
