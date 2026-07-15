import React from 'react';
import { motion } from 'framer-motion';
import { LucideShoppingCart } from 'lucide-react';

export interface ProductGridProps {
  heading?: string;
  title?: string;
  subtitle?: string;
  products?: Array<{
    id?: string;
    name?: string;
    title?: string;
    price?: number | string;
    image?: string;
    category?: string;
    description?: string;
  }>;
  items?: Array<{
    id?: string;
    name?: string;
    title?: string;
    price?: number | string;
    image?: string;
    category?: string;
    description?: string;
  }>;
  showcaseItems?: Array<any>;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  heading,
  title,
  subtitle,
  products,
  items,
  showcaseItems
}) => {
  const mainTitle = heading || title || 'Showcase & Products';
  const rawProducts = products || items || showcaseItems || [
    { id: '1', name: 'NEON PRO HEADSET X1', price: '$299', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', category: 'CYBER AUDIO' },
    { id: '2', name: 'QUANTUM CORE CHIP', price: '$450', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', category: 'HARDWARE' },
    { id: '3', name: 'NEON MECH KEYBOARD V2', price: '$180', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', category: 'PERIPHERALS' },
    { id: '4', name: 'CYBERNETIC VISION DISPLAY', price: '$899', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80', category: 'DISPLAYS' },
  ];

  return (
    <section className="py-28 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-purple-200">
            {mainTitle}
          </h2>
          {subtitle && <p className="text-lg text-zinc-400 font-light">{subtitle}</p>}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {rawProducts.map((product: any, index: number) => {
            const pName = product.name || product.title || `Item #${index + 1}`;
            const pPrice = typeof product.price === 'number' ? `$${product.price}` : product.price || '$199';
            const pImg = product.image || product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
            const pCat = product.category || 'PREMIUM SPEC';

            return (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/50 rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 shadow-xl hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col justify-between"
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-900">
                  <img 
                    src={pImg} 
                    alt={pName}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                  
                  <span className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full">
                    {pCat}
                  </span>

                  <button className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm tracking-wide opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
                    <LucideShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg text-zinc-100 group-hover:text-cyan-400 transition-colors tracking-wide mb-2 line-clamp-1">
                    {pName}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-black text-cyan-400">{pPrice}</span>
                    <span className="text-xs text-zinc-500 font-semibold group-hover:text-zinc-300 transition-colors">Details →</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
