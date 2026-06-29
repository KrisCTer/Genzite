import React from 'react';

export interface FooterProps {
  copyright?: string;
  links?: string[];
}

export const Footer: React.FC<FooterProps> = ({
  copyright = '© 2026 Genzite AI.',
  links = ['About Us', 'Terms', 'Privacy'],
}) => {
  return (
    <footer className="py-12 bg-zinc-950 border-t border-zinc-900 text-zinc-500">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <p className="mb-4 md:mb-0">{copyright} All rights reserved.</p>
        <ul className="flex space-x-6">
          {links.map((link, index) => (
            <li key={index}>
              <a href="#" className="hover:text-white transition-colors">{link}</a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};
