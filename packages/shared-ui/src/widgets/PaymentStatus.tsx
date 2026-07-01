import React from 'react';
import { motion } from 'framer-motion';
import { LucideCheckCircle2, LucideXCircle, LucideArrowRight } from 'lucide-react';

export interface PaymentStatusProps {
  status?: 'SUCCESS' | 'FAILED';
  orderId?: string;
  message?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status = 'SUCCESS',
  orderId = '#ORD-8923',
  message = 'Your payment has been processed successfully.'
}) => {
  const isSuccess = status === 'SUCCESS';

  return (
    <section className="py-24 bg-zinc-50 min-h-[70vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-3xl border border-zinc-100 shadow-xl max-w-md w-full text-center"
      >
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
          {isSuccess ? (
            <LucideCheckCircle2 className="w-10 h-10 text-green-600" />
          ) : (
            <LucideXCircle className="w-10 h-10 text-red-600" />
          )}
        </div>
        
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        
        <p className="text-zinc-500 mb-8">{message}</p>
        
        {isSuccess && (
          <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mb-8">
            <p className="text-sm text-zinc-500 mb-1">Order Reference</p>
            <p className="font-mono font-medium text-lg text-zinc-900">{orderId}</p>
          </div>
        )}
        
        <button className={`w-full py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
          isSuccess ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-white'
        }`}>
          {isSuccess ? 'Track Order' : 'Try Again'}
          <LucideArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </section>
  );
};
