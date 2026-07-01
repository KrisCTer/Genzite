import React from 'react';
import { motion } from 'framer-motion';
import { LucideMinus, LucidePlus, LucideTrash2 } from 'lucide-react';

export interface CartProps {
  heading?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

export const Cart: React.FC<CartProps> = ({
  heading = 'Your Cart',
  items = [
    { id: '1', name: 'Minimalist Vase', price: 45, quantity: 1, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=200&q=80' },
    { id: '3', name: 'Linen Tablecloth', price: 85, quantity: 2, image: 'https://images.unsplash.com/photo-1584483733059-4d6402ecf042?auto=format&fit=crop&w=200&q=80' }
  ]
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="py-24 bg-white text-zinc-900 min-h-[60vh]">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl font-bold mb-10">{heading}</h2>
        
        {items.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 rounded-2xl">
            <p className="text-zinc-500 mb-4">Your cart is empty.</p>
            <button className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium">Continue Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                >
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <button className="text-zinc-400 hover:text-red-500 transition-colors">
                        <LucideTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-lg border border-zinc-200">
                        <button className="text-zinc-500 hover:text-zinc-900"><LucideMinus className="w-4 h-4" /></button>
                        <span className="font-medium w-4 text-center">{item.quantity}</span>
                        <button className="text-zinc-500 hover:text-zinc-900"><LucidePlus className="w-4 h-4" /></button>
                      </div>
                      <p className="font-semibold">${item.price * item.quantity}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 h-fit">
              <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
              <div className="space-y-3 text-zinc-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-zinc-200 pt-4 mb-6 flex justify-between font-bold text-lg text-zinc-900">
                <span>Total</span>
                <span>${subtotal}</span>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-medium transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
