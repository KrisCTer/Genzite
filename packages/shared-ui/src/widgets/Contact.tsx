import React from 'react';
import { motion } from 'framer-motion';

export interface ContactProps {
  title?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const Contact: React.FC<ContactProps> = ({ 
  title = 'Get in Touch', 
  description,
  email,
  phone,
  address
}) => {
  return (
    <section className="w-full py-24 bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-12"
        >
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
            {description && <p className="text-zinc-400 mb-8 leading-relaxed">{description}</p>}
            
            <div className="flex flex-col gap-6">
              {email && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="text-zinc-300 font-medium">{email}</div>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div className="text-zinc-300 font-medium">{phone}</div>
                </div>
              )}
              {address && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div className="text-zinc-300 font-medium leading-relaxed">{address}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
              <input type="text" placeholder="Your Name" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="email" placeholder="Your Email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea placeholder="Message" rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
