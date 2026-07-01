import React from 'react';
import { motion } from 'framer-motion';
import { LucideSearch, LucideSlidersHorizontal } from 'lucide-react';

export interface SearchProps {
  heading?: string;
  placeholder?: string;
}

export const Search: React.FC<SearchProps> = ({
  heading = 'Find what you need',
  placeholder = 'Search for products...'
}) => {
  return (
    <section className="py-12 bg-white text-zinc-900">
      <div className="container mx-auto px-6 max-w-4xl">
        {heading && <h2 className="text-2xl font-bold mb-6 text-center">{heading}</h2>}
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4"
        >
          <div className="relative flex-1">
            <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text" 
              placeholder={placeholder}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-lg shadow-sm"
            />
          </div>
          <button className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-6 rounded-2xl flex items-center justify-center transition-colors border border-zinc-200">
            <LucideSlidersHorizontal className="w-5 h-5" />
          </button>
        </motion.div>
        
        <div className="flex gap-2 mt-4 justify-center flex-wrap">
          <span className="text-sm text-zinc-500 py-1">Popular:</span>
          {['Vases', 'Chairs', 'Lighting', 'Kitchenware'].map((tag) => (
            <button key={tag} className="text-sm px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-700 transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
