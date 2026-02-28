"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconChevronDown } from "@tabler/icons-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faq: FAQItem[];
}

export function FAQAccordion({ faq }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faq.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-[#e4e4e7] overflow-hidden"
        >
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-[#fafafa] transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-[#0a0a0a] pr-4">
              {item.question}
            </span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <IconChevronDown size={20} className="text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="px-6 pb-6 pt-0">
                  <div className="pt-2 border-t border-[#e4e4e7]">
                    <p className="text-[#71717a] leading-relaxed mt-4">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
