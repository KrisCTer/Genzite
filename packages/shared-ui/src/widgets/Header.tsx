import React from 'react';
import { motion } from 'framer-motion';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  navigation?: Array<{ label: string; href: string }>;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, logoUrl, navigation = [] }) => {
  return (
    <header className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-full" />}
            <div>
              {title && <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>}
              {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
            </div>
          </motion.div>
          
          <nav className="hidden md:flex gap-6">
            {navigation.map((item, index) => (
              <motion.a 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index} 
                href={item.href || '#'} 
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
