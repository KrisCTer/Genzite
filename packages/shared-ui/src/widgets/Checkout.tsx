import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface CheckoutProps {
  heading?: string;
  totalAmount?: number;
}

export const Checkout: React.FC<CheckoutProps> = ({
  heading = 'Checkout',
  totalAmount = 130
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('BANK_TRANSFER');

  return (
    <section className="py-24 bg-white text-zinc-900 min-h-[60vh]">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="text-3xl font-bold mb-10">{heading}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <input type="email" placeholder="Email address" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First name" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                <input type="text" placeholder="Last name" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                <input type="text" placeholder="Address" className="col-span-2 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                <input type="text" placeholder="City" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                <input type="text" placeholder="Postal code" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                <input type="text" placeholder="Phone" className="col-span-2 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'BANK_TRANSFER' ? 'border-blue-500 bg-blue-50/50' : 'border-zinc-200 hover:bg-zinc-50'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'BANK_TRANSFER'} onChange={() => setPaymentMethod('BANK_TRANSFER')} className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Bank Transfer (VietQR)</p>
                    <p className="text-sm text-zinc-500">Scan QR code to pay via any banking app</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50/50' : 'border-zinc-200 hover:bg-zinc-50'}`}>
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-medium">Cash on Delivery (COD)</p>
                    <p className="text-sm text-zinc-500">Pay when you receive the order</p>
                  </div>
                </label>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-medium transition-colors text-lg mt-8">
              {paymentMethod === 'BANK_TRANSFER' ? 'Generate QR Code' : 'Complete Order'}
            </button>
          </div>

          {/* Summary / QR Code */}
          <div>
            <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 sticky top-8">
              {paymentMethod === 'BANK_TRANSFER' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <h3 className="text-xl font-bold mb-2">Scan to Pay</h3>
                  <p className="text-zinc-500 mb-6">Open your banking app to scan</p>
                  <div className="bg-white p-4 rounded-2xl border border-zinc-200 inline-block mb-6 shadow-sm">
                    {/* Placeholder for actual VietQR image */}
                    <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center text-zinc-400 border border-dashed border-zinc-300">
                      [VietQR Code]
                    </div>
                  </div>
                  <div className="text-left space-y-3 bg-white p-4 rounded-xl border border-zinc-100 mb-6 text-sm">
                    <div className="flex justify-between border-b border-zinc-100 pb-2">
                      <span className="text-zinc-500">Amount</span>
                      <span className="font-bold text-blue-600">${totalAmount}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-100 pb-2">
                      <span className="text-zinc-500">Message</span>
                      <span className="font-mono bg-zinc-100 px-2 rounded">ORDER 8923</span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">Waiting for payment confirmation...</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-xl font-bold mb-6">Order Total</h3>
                  <div className="flex justify-between items-center text-2xl font-bold text-zinc-900 mb-2">
                    <span>Total to pay</span>
                    <span>${totalAmount}</span>
                  </div>
                  <p className="text-zinc-500 text-sm">You will pay in cash upon delivery.</p>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
