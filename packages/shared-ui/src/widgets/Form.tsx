import React from 'react';
import { motion } from 'framer-motion';

export interface FormProps {
  title?: string;
  description?: string;
  fields?: Array<{ name: string; type: string; placeholder?: string; required?: boolean }>;
  submitLabel?: string;
}

export const Form: React.FC<FormProps> = ({ 
  title = 'Contact Us', 
  description, 
  fields = [], 
  submitLabel = 'Submit' 
}) => {
  return (
    <section className="w-full py-20 bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-12 shadow-xl"
        >
          <div className="text-center mb-10">
            {title && <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>}
            {description && <p className="text-zinc-400">{description}</p>}
          </div>

          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            {fields.map((field, index) => (
              <div key={index} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300 capitalize">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea 
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
                  />
                ) : (
                  <input 
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                )}
              </div>
            ))}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all"
            >
              {submitLabel}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
