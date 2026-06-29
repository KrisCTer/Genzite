import React from 'react';
import { motion } from 'framer-motion';

export interface PricingProps {
  title?: string;
  subtitle?: string;
  plans?: Array<{
    name: string;
    price: string;
    period?: string;
    description?: string;
    features: string[];
    isPopular?: boolean;
    buttonLabel?: string;
  }>;
}

export const Pricing: React.FC<PricingProps> = ({ title, subtitle, plans = [] }) => {
  return (
    <section className="w-full py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          {title && <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">{title}</h2>}
          {subtitle && <p className="text-xl text-zinc-400">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-3xl p-8 border ${plan.isPopular ? 'bg-zinc-900 border-blue-500 shadow-2xl shadow-blue-900/20 md:scale-105 z-10' : 'bg-zinc-950 border-zinc-800'}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                {plan.description && <p className="text-sm text-zinc-400 mb-6">{plan.description}</p>}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500">/{plan.period}</span>}
                </div>
              </div>

              <ul className="flex flex-col gap-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-semibold transition-all ${plan.isPopular ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                {plan.buttonLabel || 'Get Started'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
