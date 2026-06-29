import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FaqProps {
  title?: string;
  items?: Array<{ question: string; answer: string }>;
}

export const Faq: React.FC<FaqProps> = ({ title = 'Frequently Asked Questions', items = [] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-24 bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item, index) => (
            <div key={index} className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/50">
              <button 
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="text-lg font-medium text-white">{item.question}</span>
                <motion.svg 
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  className="w-5 h-5 text-zinc-500 shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 overflow-hidden"
                  >
                    <p className="text-zinc-400 pb-6 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
