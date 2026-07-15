import React from 'react';
import { motion } from 'framer-motion';

export interface CtaProps {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  buttonLabel?: string;
  primaryButtonLabel?: string;
  primaryButtonUrl?: string;
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
}

export const Cta: React.FC<CtaProps> = ({ 
  title, 
  subtitle,
  description, 
  ctaText,
  buttonLabel,
  primaryButtonLabel,
  primaryButtonUrl,
  secondaryButtonLabel,
  secondaryButtonUrl
}) => {
  const mainTitle = title || 'Ready to Accelerate Your Cyber Workflow?';
  const mainDesc = description || subtitle || 'Deploy your high-performance infrastructure with zero latency and complete cryptographic security right now.';
  const mainBtn = primaryButtonLabel || ctaText || buttonLabel || 'Deploy Now - Instant Access';
  const secBtn = secondaryButtonLabel || 'Schedule Cyber Audit';

  return (
    <section className="w-full py-28 bg-zinc-950 text-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-purple-950/40 border border-cyan-500/40 rounded-3xl overflow-hidden p-12 md:p-20 text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl"
        >
          {/* Decorative radial glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.15] bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-purple-200">
              {mainTitle}
            </h2>
            <p className="text-lg sm:text-xl text-zinc-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              {mainDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                href={primaryButtonUrl || '#'}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-95 text-white font-extrabold py-4 px-8 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all cursor-pointer text-center text-base tracking-wide border border-cyan-400/30"
              >
                {mainBtn}
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.5)' }}
                whileTap={{ scale: 0.96 }}
                href={secondaryButtonUrl || '#'}
                className="w-full sm:w-auto bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold py-4 px-8 rounded-2xl backdrop-blur-xl transition-all cursor-pointer text-center text-base"
              >
                {secBtn}
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

