import React from 'react';
import { motion } from 'framer-motion';

export interface TestimonialProps {
  title?: string;
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string;
    avatarUrl?: string;
  }>;
}

export const Testimonial: React.FC<TestimonialProps> = ({ title, testimonials = [] }) => {
  return (
    <section className="w-full py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-lg flex flex-col justify-between"
            >
              <div className="mb-8 relative">
                <svg className="absolute -top-4 -left-4 w-10 h-10 text-zinc-800 opacity-50" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-zinc-300 relative z-10 leading-relaxed text-lg">"{t.quote}"</p>
              </div>
              
              <div className="flex items-center gap-4">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.author} className="w-12 h-12 rounded-full object-cover bg-zinc-800" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                    {t.author.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-white font-semibold">{t.author}</h4>
                  {t.role && <p className="text-sm text-zinc-500">{t.role}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
