import React, { useState } from 'react';
import { useSiteContent } from '../context/ContentContext';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SketchStar, SketchWavyLine } from './HandDrawnIllustrations';

export const FAQ: React.FC = () => {
  const { content } = useSiteContent();
  const FAQ_ITEMS = (content.faqs || []).filter((f) => f.hidden !== true);
  // Only one FAQ item open at a time
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="w-full px-4 sm:px-6 py-12 sm:py-16 bg-[#f7ecee]/40 dark:bg-[#140b0f]/40 backdrop-blur-xs transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col mb-8">
          <div className="flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans'] text-[10px] sm:text-xs text-[#8c5f1b] dark:text-[#fed488] uppercase tracking-[0.2em] font-bold">
              Client Guidance
            </span>
            <HelpCircle className="w-5 h-5 text-[#8c5f1b] dark:text-[#fed488] animate-gentle-pulse" />
          </div>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-4xl text-[#6c2e3e] dark:text-[#f8d7df] font-normal tracking-tight mt-1">
            Frequently Asked Questions
          </h2>

          <div className="my-1.5">
            <SketchWavyLine className="w-32 sm:w-44 h-2 text-[#8c5f1b]/40 dark:text-[#fed488]/60" />
          </div>

          <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] mt-1 max-w-xl font-medium">
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
                className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1f1217] border border-[#c48496] dark:border-[#b89758]/45 hover:border-[#b89758] overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-['Playfair_Display'] text-base sm:text-lg text-[#6c2e3e] dark:text-[#f8d7df] font-medium hover:text-[#7a3b4d] dark:group-hover:text-[#fed488] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8c5f1b] cursor-pointer group"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span className="pr-4 group-hover:translate-x-0.5 transition-transform duration-200">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8c5f1b] dark:text-[#fed488] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        id={`faq-answer-${item.id}`}
                        className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-[#c48496]/40 dark:border-[#b89758]/35 font-['Plus_Jakarta_Sans'] text-xs sm:text-sm text-[#382229] dark:text-[#dfc3c9] leading-relaxed"
                      >
                        <p className="pt-3 font-normal">{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
