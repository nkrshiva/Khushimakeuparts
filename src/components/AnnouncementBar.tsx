import React, { useState } from 'react';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';

export const AnnouncementBar: React.FC = () => {
  const { content } = useSiteContent();
  const [dismissed, setDismissed] = useState(false);

  const isVisible = content.sectionsVisibility.announcementBar && content.announcementBar?.enabled;
  if (!isVisible || dismissed) return null;

  const { badge, text, linkText, linkUrl } = content.announcementBar;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-40 w-full bg-gradient-to-r from-[#240e17] via-[#4d1f2b] to-[#240e17] border-b border-[#b89758]/40 text-[#fcecee] py-2 px-3 sm:px-6 transition-all duration-300 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-xs md:text-sm">
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 text-center flex-wrap">
          {badge && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#b89758]/20 text-[#fed488] font-['Plus_Jakarta_Sans'] text-[10px] font-bold uppercase tracking-wider border border-[#b89758]/40">
              <Sparkles className="w-3 h-3 text-[#fed488]" />
              {badge}
            </span>
          )}

          <span className="font-['Plus_Jakarta_Sans'] font-medium text-white/90 leading-tight">
            {text}
          </span>

          {linkText && (
            <a
              href={linkUrl || '#booking-concierge'}
              className="inline-flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-[#fed488] hover:text-white underline underline-offset-4 decoration-[#fed488]/60 hover:decoration-white font-semibold text-xs transition-colors shrink-0"
            >
              {linkText}
              <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2"
          aria-label="Dismiss announcement"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
