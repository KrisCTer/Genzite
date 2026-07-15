import React from 'react';
import { motion } from 'framer-motion';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  navigation?: Array<{ label: string; href: string }> | string[];
  links?: Array<{ label: string; href: string }> | string[];
  items?: Array<{ label: string; href: string }> | string[];
  ctaText?: string;
  buttonLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = 'NEON_OS', 
  subtitle, 
  logoUrl, 
  navigation,
  links,
  items,
  ctaText,
  buttonLabel
}) => {
  const rawNav = navigation || links || items || [
    { label: 'Products', href: '#products' },
    { label: 'Features', href: '#features' },
    { label: 'Specs', href: '#specs' },
    { label: 'Pricing', href: '#pricing' }
  ];

  const navList = rawNav.map((item: any, idx: number) => {
    if (typeof item === 'string') return { label: item, href: `#item-${idx}` };
    return { label: item.label || item.name || `Link ${idx}`, href: item.href || item.url || '#' };
  });

  const btnText = ctaText || buttonLabel || 'BUY NOW';

  return (
    <header className="w-full bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 w-9 rounded-xl object-cover border border-cyan-500/30" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-all">
                <span className="text-white font-black text-lg tracking-tighter">△</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-purple-300">
                {title || 'GENZITE_OS'}
              </h1>
              {subtitle && <p className="text-xs text-zinc-400 font-medium">{subtitle}</p>}
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navList.map((item, index) => (
              <motion.a 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                key={index} 
                href={item.href} 
                className="text-sm font-semibold text-zinc-300 hover:text-cyan-400 transition-colors tracking-wide"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-sm tracking-wider uppercase rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all cursor-pointer border border-cyan-400/30"
            >
              {btnText}
            </motion.button>

            <button className="md:hidden text-zinc-300 hover:text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

