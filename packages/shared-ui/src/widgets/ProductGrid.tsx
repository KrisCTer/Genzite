import React from 'react';
import { motion } from 'framer-motion';
import { LucideShoppingCart } from 'lucide-react';

export interface ProductGridProps {
  heading?: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  }>;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  heading = 'Featured Products',
  products = [
    { id: '1', name: 'Minimalist Vase', price: 45, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=400&q=80', category: 'Decor' },
    { id: '2', name: 'Ceramic Bowl', price: 32, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80', category: 'Kitchen' },
    { id: '3', name: 'Linen Tablecloth', price: 85, image: 'https://images.unsplash.com/photo-1584483733059-4d6402ecf042?auto=format&fit=crop&w=400&q=80', category: 'Dining' },
    { id: '4', name: 'Artisan Mug', price: 24, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=400&q=80', category: 'Kitchen' },
  ]
}) => {
  return (
    <section className="py-24 bg-zinc-50 text-zinc-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">{heading}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl bg-zinc-200">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <button className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm text-zinc-900 py-3 rounded-xl font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-zinc-900 hover:text-white">
                  <LucideShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">{product.category}</p>
                  <h3 className="font-medium text-lg">{product.name}</h3>
                </div>
                <p className="font-semibold">${product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
