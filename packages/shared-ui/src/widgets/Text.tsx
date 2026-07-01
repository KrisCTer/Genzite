import React from 'react';
import { motion } from 'framer-motion';

export interface TextProps {
  title?: string;
  content?: string;
  align?: 'left' | 'center' | 'right';
}

export const Text: React.FC<TextProps> = ({ title, content, align = 'left' }) => {
  return (
    <section className="w-full py-16 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`flex flex-col gap-6 text-${align}`}
        >
          {title && <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{title}</h2>}
          {content && (
            <div 
              className="text-lg text-zinc-400 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};
