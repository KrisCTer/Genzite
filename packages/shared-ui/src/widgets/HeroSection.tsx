import React from 'react';
import { motion } from 'framer-motion';

export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  buttonLabel?: string;
  secondaryCtaText?: string;
  secondaryButtonLabel?: string;
  badge?: string;
  badgeText?: string;
  features?: string[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'The Future of Cyber Connectivity',
  subtitle = 'Experience the next generation of OS performance with glassmorphic depth and neon-infused acceleration.',
  ctaText,
  buttonLabel,
  secondaryCtaText,
  secondaryButtonLabel,
  badge,
  badgeText,
  features
}) => {
  const mainCta = ctaText || buttonLabel || 'Get Started Now';
  const secCta = secondaryCtaText || secondaryButtonLabel || 'Explore Features';
  const topBadge = badge || badgeText || '✨ NEXT-GEN PLATFORM 2026';

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-zinc-950 text-white py-24 px-6">
      {/* Subtle tech-grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
      
      {/* Floating glassmorphism neon blobs */}
      <motion.div
        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none"
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Top glowing pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-cyan-500/30 backdrop-blur-xl mb-8 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-cyan-300 uppercase">{topBadge}</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-zinc-400 leading-[1.1]"
        >
          {title}
        </motion.h1>
        
        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="text-lg sm:text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
        >
          {subtitle}
        </motion.p>
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-base tracking-wide rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.45)] hover:shadow-[0_0_55px_rgba(6,182,212,0.75)] transition-all cursor-pointer border border-cyan-400/30 flex items-center justify-center gap-3"
          >
            <span>{mainCta}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.5)' }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800/80 text-zinc-200 font-semibold text-base rounded-2xl border border-zinc-700/80 backdrop-blur-xl transition-all cursor-pointer flex items-center justify-center"
          >
            {secCta}
          </motion.button>
        </motion.div>

        {/* Feature Highlights if any */}
        {features && features.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 pt-10 border-t border-zinc-800/80 flex flex-wrap justify-center gap-8 text-sm text-zinc-400"
          >
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">✓</span>
                <span>{typeof feat === 'string' ? feat : (feat as any).title || JSON.stringify(feat)}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

