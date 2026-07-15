import React from 'react';
import { motion } from 'framer-motion';

export interface FeaturesProps {
  items?: Array<string | { title?: string; name?: string; description?: string; icon?: string }>;
  features?: Array<string | { title?: string; name?: string; description?: string; icon?: string }>;
  list?: Array<string | { title?: string; name?: string; description?: string; icon?: string }>;
  heading?: string;
  title?: string;
  subtitle?: string;
}

export const Features: React.FC<FeaturesProps> = ({
  items,
  features,
  list,
  heading,
  title,
  subtitle
}) => {
  const rawList = features || items || list || [
    { title: 'SPEED & ACCELERATION', description: 'Lightning-fast execution powered by next-gen neural processing units and zero-latency architecture.' },
    { title: 'CORE SECURITY', description: 'Military-grade cryptographic encryption with automated threat detection and real-time firewall shielding.' },
    { title: 'NEON ECOSYSTEM', description: 'Seamlessly connected workflows designed with glassmorphic depth and intuitive cybernetic interfaces.' }
  ];

  const mainTitle = heading || title || 'Key Features';

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const icons = ['⚡', '🛡', '💎', '🚀', '🔥', '✨', '🌐', '🎯'];

  return (
    <section className="py-28 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
            {mainTitle}
          </h2>
          {subtitle && <p className="text-lg text-zinc-400 font-light">{subtitle}</p>}
        </div>
        
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {rawList.map((item: any, index: number) => {
            const itemTitle = typeof item === 'string' ? item : item.title || item.name || `Feature #${index + 1}`;
            const itemDesc = typeof item === 'string' 
              ? 'Engineered with precision architecture to deliver unparalleled performance and seamless integration across all devices.'
              : item.description || 'Engineered with precision architecture to deliver unparalleled performance and seamless integration across all devices.';
            const iconStr = typeof item === 'object' && item.icon ? item.icon : icons[index % icons.length];

            return (
              <motion.div
                key={index}
                variants={itemAnim}
                className="group p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/50 backdrop-blur-xl transition-all duration-300 shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.12)] flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:border-cyan-500/40 transition-all duration-300">
                    <span className="text-2xl">{iconStr}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-100 group-hover:text-cyan-400 transition-colors tracking-wide">
                    {itemTitle}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-sm font-light">
                    {itemDesc}
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-zinc-800/60 flex items-center gap-2 text-xs font-semibold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore capability</span>
                  <span>→</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

