import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface SlideToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md';
}

export const SlideToggle: React.FC<SlideToggleProps> = ({
  checked,
  onChange,
  label,
  sublabel,
  size = 'md'
}) => {
  return (
    <div className="flex items-center justify-between gap-3">
      {(label || sublabel) && (
        <div className="flex flex-col text-left">
          {label && (
            <span className={`font-medium ${size === 'sm' ? 'text-xs text-[#fed488]' : 'text-sm text-white'} flex items-center gap-1.5`}>
              {checked ? (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              {label}
            </span>
          )}
          {sublabel && <span className="text-[11px] text-[#dfc3c9]/70">{sublabel}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center rounded-full transition-colors cursor-pointer shrink-0 border ${
          size === 'sm' ? 'w-9 h-5 p-0.5' : 'w-12 h-6 p-0.5'
        } ${
          checked
            ? 'bg-emerald-600 border-emerald-400/60 shadow-xs'
            : 'bg-zinc-800 border-white/20'
        }`}
      >
        <span
          className={`inline-block rounded-full bg-white transition-transform shadow-md ${
            size === 'sm'
              ? `w-3.5 h-3.5 ${checked ? 'translate-x-4' : 'translate-x-0'}`
              : `w-5 h-5 ${checked ? 'translate-x-6' : 'translate-x-0'}`
          }`}
        />
      </button>
    </div>
  );
};
