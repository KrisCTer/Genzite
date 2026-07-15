import React from 'react';

export interface FooterProps {
  title?: string;
  description?: string;
  copyright?: string;
  links?: Array<string | { label?: string; name?: string; href?: string }>;
  navigation?: Array<string | { label?: string; name?: string; href?: string }>;
}

export const Footer: React.FC<FooterProps> = ({
  title = 'GENZITE_OS',
  description = 'Next-Generation Autonomous Cybernetic Web & App Ecosystem.',
  copyright,
  links,
  navigation
}) => {
  const rawLinks = navigation || links || ['System Status', 'Documentation', 'API Reference', 'Security Audit', 'Terms of Service', 'Privacy Policy'];
  const copyText = copyright || `© ${new Date().getFullYear()} ${title || 'GENZITE_OS'}. All cyber rights reserved.`;

  return (
    <footer className="py-16 bg-zinc-950 border-t border-zinc-900/80 text-zinc-400 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-black text-white text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              △
            </div>
            <span className="font-black text-xl tracking-wider text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-white">{title || 'GENZITE_OS'}</span>
          </div>
          <p className="text-sm text-zinc-500 max-w-sm font-light">{description}</p>
          <p className="text-xs text-zinc-600 mt-4 font-mono">{copyText}</p>
        </div>

        <div className="flex flex-wrap gap-8 items-center">
          {rawLinks.map((link: any, index: number) => {
            const label = typeof link === 'string' ? link : link.label || link.name || `Link ${index}`;
            const href = typeof link === 'string' ? '#' : link.href || '#';
            return (
              <a key={index} href={href} className="text-sm font-medium text-zinc-400 hover:text-cyan-400 transition-colors">
                {label}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

