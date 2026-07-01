import React from 'react';
import { motion } from 'framer-motion';

export interface ImageProps {
  url?: string;
  alt?: string;
  caption?: string;
}

export const Image: React.FC<ImageProps> = ({ url, alt = 'Image', caption }) => {
  if (!url) return null;

  return (
    <section className="w-full py-12 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.figure 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <img 
              src={url} 
              alt={alt} 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent pointer-events-none" />
          </div>
          {caption && <figcaption className="text-sm text-zinc-500 italic">{caption}</figcaption>}
        </motion.figure>
      </div>
    </section>
  );
};
