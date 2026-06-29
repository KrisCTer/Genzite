import React from 'react';
import { motion } from 'framer-motion';

export interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Master the future',
  subtitle = 'Discover top-tier tech solutions',
  ctaText = 'Get started',
}) => {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden bg-zinc-950 text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950 opacity-60"></div>
      
      {/* Floating glassmorphism blob */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"
        >
          {title}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-10"
        >
          {subtitle}
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="px-8 py-4 bg-white text-zinc-900 font-bold rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-shadow"
        >
          {ctaText}
        </motion.button>
      </div>
    </section>
  );
};
