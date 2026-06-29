import React from 'react';
import { motion } from 'framer-motion';

export interface FeaturesProps {
  items?: string[];
  heading?: string;
}

export const Features: React.FC<FeaturesProps> = ({
  items = ['Modern Design', 'High Performance', 'Absolute Security'],
  heading = 'Key Features',
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-24 bg-zinc-900 text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-zinc-100">{heading}</h2>
        
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {items.map((item, index) => (
            <motion.div
              key={index}
              variants={itemAnim}
              className="p-8 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-md hover:bg-zinc-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                <div className="w-6 h-6 rounded-full bg-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-zinc-100">{item}</h3>
              <p className="text-zinc-400">
                This is the detailed description for this feature, generated to be compatible with AI structures.
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
