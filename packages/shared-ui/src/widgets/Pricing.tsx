import React from 'react';
import { motion } from 'framer-motion';

export interface PricingProps {
  title?: string;
  subtitle?: string;
  plans?: Array<{
    name?: string;
    title?: string;
    price?: string | number;
    period?: string;
    description?: string;
    features?: string[] | Array<any>;
    isPopular?: boolean;
    buttonLabel?: string;
  }>;
  items?: Array<any>;
}

export const Pricing: React.FC<PricingProps> = ({ title, subtitle, plans, items }) => {
  const mainTitle = title || 'Transparent Cyber Tier Pricing';
  const mainSub = subtitle || 'Choose the ultimate computational tier for your next-generation connectivity needs.';
  
  const rawPlans = plans || items || [
    {
      name: 'STARTER CORE',
      price: '$49',
      period: 'mo',
      description: 'Essential cyber connectivity and speed processing.',
      features: ['100GB Neural Storage', 'Standard 10Gbps Bandwidth', 'Basic Firewall Shielding', '24/7 AI Automated Support'],
      isPopular: false,
      buttonLabel: 'Deploy Starter'
    },
    {
      name: 'QUANTUM PRO',
      price: '$149',
      period: 'mo',
      description: 'Advanced acceleration with zero-latency glassmorphic UI.',
      features: ['Unlimited Neural Storage', 'Dedicated 100Gbps Bandwidth', 'Military-Grade Encryption', 'Priority Quantum Nodes', 'Custom Cybernetic API'],
      isPopular: true,
      buttonLabel: 'Deploy Quantum Pro'
    },
    {
      name: 'ENTERPRISE APEX',
      price: '$499',
      period: 'mo',
      description: 'Uncapped infrastructure for global enterprise grids.',
      features: ['Multi-Region Cluster Sync', 'Unlimited Terabit Speed', 'Dedicated AI Agent Pool', 'Custom Hardware Acceleration', 'White-Glove Cyber Audit'],
      isPopular: false,
      buttonLabel: 'Contact Sales'
    }
  ];

  return (
    <section className="w-full py-28 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-purple-300">
            {mainTitle}
          </h2>
          <p className="text-lg text-zinc-400 font-light leading-relaxed">{mainSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {rawPlans.map((plan: any, index: number) => {
            const pName = plan.name || plan.title || `Tier #${index + 1}`;
            const pPrice = typeof plan.price === 'number' ? `$${plan.price}` : plan.price || '$99';
            const pPeriod = plan.period || 'mo';
            const pFeatures = Array.isArray(plan.features) ? plan.features : ['Full Access', 'High Speed', '24/7 Support'];
            const isPop = plan.isPopular || index === 1;

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
                viewport={{ once: true }}
                className={`relative rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 ${
                  isPop 
                    ? 'bg-zinc-900/90 border-cyan-500/80 shadow-[0_0_40px_rgba(6,182,212,0.25)] md:-translate-y-2 z-10 backdrop-blur-xl' 
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 backdrop-blur-md'
                }`}
              >
                {isPop && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                <div>
                  <div className="mb-8">
                    <h3 className="text-xl font-extrabold text-white mb-2 tracking-wide">{pName}</h3>
                    {plan.description && <p className="text-sm text-zinc-400 mb-6 font-light">{plan.description}</p>}
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">{pPrice}</span>
                      {pPeriod && <span className="text-zinc-400 font-medium">/{pPeriod}</span>}
                    </div>
                  </div>

                  <ul className="flex flex-col gap-4 mb-8">
                    {pFeatures.map((feature: any, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                        <span>{typeof feature === 'string' ? feature : feature.title || JSON.stringify(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all cursor-pointer shadow-lg ${
                  isPop 
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] text-white' 
                    : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/50'
                }`}>
                  {plan.buttonLabel || 'Get Started Now'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

