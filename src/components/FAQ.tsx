import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/makeupData';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

export const FAQ: React.FC = () => {
  // Only one FAQ item open at a time
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#f7ecee] dark:bg-[#140b0f] transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#b89758] dark:text-[#fed488] uppercase tracking-[0.2em] font-semibold">
              Client Guidance
            </span>
            <HelpCircle className="w-5 h-5 text-[#b89758] dark:text-[#fed488]" />
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Frequently Asked Questions
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-32 sm:w-44 h-2 text-[#b89758]/50 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] mt-1 max-w-xl">
            Clear details about doorstep vanity services, travel arrangements, booking methods, and styling options.
          </p>
        </div>

        {/* Animated Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl sm:rounded-3xl bg-[#fff9fa] dark:bg-[#1f1217] border border-[#b89758]/35 dark:border-[#b89758]/45 overflow-hidden transition-all duration-300 shadow-2xs"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-['Playfair_Display'] text-base sm:text-lg text-[#6c2e3e] dark:text-[#f8d7df] font-medium hover:text-[#7a3b4d] dark:hover:text-[#fed488] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b89758] cursor-pointer"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span className="pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#b89758] dark:text-[#fed488] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${item.id}`}
                    className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-[#b89758]/20 dark:border-[#b89758]/35 font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#5a454b] dark:text-[#dfc3c9] leading-relaxed animate-in fade-in duration-200"
                  >
                    <p className="pt-3">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
