import React from 'react';
import { motion } from 'framer-motion';

export interface StatsProps {
  title?: string;
  description?: string;
  stats?: Array<{ label: string; value: string }>;
}

export const Stats: React.FC<StatsProps> = ({ title, description, stats = [] }) => {
  return (
    <section className="w-full py-20 bg-zinc-950 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="text-center mb-16 max-w-3xl mx-auto">
            {title && <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{title}</h2>}
            {description && <p className="text-zinc-400">{description}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-2"
            >
              <span className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 drop-shadow-sm">
                {stat.value}
              </span>
              <span className="text-sm md:text-base font-medium text-zinc-400 uppercase tracking-wider">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
