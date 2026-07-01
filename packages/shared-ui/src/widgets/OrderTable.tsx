import React from 'react';
import { motion } from 'framer-motion';

export interface OrderTableProps {
  heading?: string;
  orders?: Array<{
    id: string;
    customerName: string;
    date: string;
    total: number;
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED';
  }>;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  heading = 'Recent Orders',
  orders = [
    { id: '#ORD-8923', customerName: 'Alice Smith', date: '2026-06-29', total: 130, status: 'PAID' },
    { id: '#ORD-8924', customerName: 'Bob Johnson', date: '2026-06-28', total: 45, status: 'PENDING' },
    { id: '#ORD-8925', customerName: 'Charlie Brown', date: '2026-06-27', total: 210, status: 'SHIPPED' },
  ]
}) => {
  return (
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <h3 className="text-xl font-bold text-zinc-900">{heading}</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 text-sm">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <motion.tr 
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
              >
                <td className="p-4 font-medium text-zinc-900">{order.id}</td>
                <td className="p-4 text-zinc-600">{order.customerName}</td>
                <td className="p-4 text-zinc-500 text-sm">{order.date}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : ''}
                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : ''}
                  `}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-right font-semibold text-zinc-900">${order.total}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
