import React from 'react';
import { motion } from 'framer-motion';

export interface CtaProps {
  title?: string;
  description?: string;
  primaryButtonLabel?: string;
  primaryButtonUrl?: string;
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
}

export const Cta: React.FC<CtaProps> = ({ 
  title, 
  description, 
  primaryButtonLabel,
  primaryButtonUrl,
  secondaryButtonLabel,
  secondaryButtonUrl
}) => {
  return (
    <section className="w-full py-24 bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-900/30 rounded-3xl overflow-hidden p-12 md:p-20 text-center shadow-2xl"
        >
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            {title && <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">{title}</h2>}
            {description && <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">{description}</p>}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryButtonLabel && (
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={primaryButtonUrl || '#'}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-colors"
                >
                  {primaryButtonLabel}
                </motion.a>
              )}
              {secondaryButtonLabel && (
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={secondaryButtonUrl || '#'}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-4 px-8 rounded-xl transition-colors"
                >
                  {secondaryButtonLabel}
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
