import React from 'react';
import { motion } from 'framer-motion';
import { LucideTrendingUp, LucideUsers, LucideShoppingBag, LucideDollarSign } from 'lucide-react';

export interface AdminPanelProps {
  heading?: string;
  stats?: Array<{
    label: string;
    value: string;
    trend: string;
    icon: string;
  }>;
}

const iconMap: Record<string, React.ReactNode> = {
  revenue: <LucideDollarSign className="w-6 h-6 text-blue-500" />,
  orders: <LucideShoppingBag className="w-6 h-6 text-emerald-500" />,
  customers: <LucideUsers className="w-6 h-6 text-purple-500" />,
  growth: <LucideTrendingUp className="w-6 h-6 text-orange-500" />
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  heading = 'Dashboard Overview',
  stats = [
    { label: 'Total Revenue', value: '$12,450', trend: '+14%', icon: 'revenue' },
    { label: 'Total Orders', value: '156', trend: '+8%', icon: 'orders' },
    { label: 'New Customers', value: '42', trend: '+2%', icon: 'customers' },
    { label: 'Conversion Rate', value: '3.2%', trend: '+0.5%', icon: 'growth' },
  ]
}) => {
  return (
    <section className="py-12 bg-zinc-50 text-zinc-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-zinc-900">{heading}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-zinc-50`}>
                  {iconMap[stat.icon] || <LucideTrendingUp className="w-6 h-6 text-zinc-500" />}
                </div>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-zinc-500 font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
