import React from 'react';
import { HeroSection } from './HeroSection';
import { Features } from './Features';
import { Footer } from './Footer';
import { Header } from './Header';
import { Text } from './Text';
import { Image } from './Image';
import { Form } from './Form';
import { Pricing } from './Pricing';
import { Testimonial } from './Testimonial';
import { Cta } from './Cta';
import { Stats } from './Stats';
import { Faq } from './Faq';
import { Contact } from './Contact';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import { Checkout } from './Checkout';
import { Search } from './Search';
import { OrderTable } from './OrderTable';
import { AdminPanel } from './AdminPanel';
import { PaymentStatus } from './PaymentStatus';

interface WidgetData {
  type: string;
  contentConfig: Record<string, any>;
  sortOrder: number;
}

export interface WidgetRendererProps {
  widgets: WidgetData[];
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widgets }) => {
  if (!widgets || widgets.length === 0) {
    return <div className="p-10 text-center text-zinc-500">No content available.</div>;
  }

  // Sắp xếp theo sortOrder
  const sortedWidgets = [...widgets].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col min-h-screen">
      {sortedWidgets.map((widget, index) => {
        switch (widget.type.toUpperCase()) {
          case 'HEADER':
            return <Header key={index} {...widget.contentConfig} />;
            
          case 'HERO':
            return <HeroSection key={index} {...widget.contentConfig} />;
          
          case 'FEATURES':
          case 'GALLERY':
          case 'CARD':
            // We use Features.tsx to display grids for similar types
            return <Features key={index} {...widget.contentConfig} />;
            
          case 'TEXT':
            return <Text key={index} {...widget.contentConfig} />;
            
          case 'IMAGE':
            return <Image key={index} {...widget.contentConfig} />;
            
          case 'FORM':
            return <Form key={index} {...widget.contentConfig} />;
            
          case 'PRICING':
            return <Pricing key={index} {...widget.contentConfig} />;
            
          case 'TESTIMONIAL':
            return <Testimonial key={index} {...widget.contentConfig} />;
            
          case 'CTA':
            return <Cta key={index} {...widget.contentConfig} />;
            
          case 'STATS':
            return <Stats key={index} {...widget.contentConfig} />;
            
          case 'FAQ':
            return <Faq key={index} {...widget.contentConfig} />;
            
          case 'CONTACT':
            return <Contact key={index} {...widget.contentConfig} />;
          
          case 'FOOTER':
            return <Footer key={index} {...widget.contentConfig} />;
            
          case 'PRODUCT_GRID':
            return <ProductGrid key={index} {...widget.contentConfig} />;
            
          case 'CART':
            return <Cart key={index} {...widget.contentConfig} />;
            
          case 'CHECKOUT':
            return <Checkout key={index} {...widget.contentConfig} />;
            
          case 'SEARCH':
            return <Search key={index} {...widget.contentConfig} />;
            
          case 'ORDER_TABLE':
            return <OrderTable key={index} {...widget.contentConfig} />;
            
          case 'ADMIN_PANEL':
            return <AdminPanel key={index} {...widget.contentConfig} />;
            
          case 'PAYMENT_STATUS':
            return <PaymentStatus key={index} {...widget.contentConfig} />;
            
          default:
            return (
              <div key={index} className="p-10 border border-dashed border-zinc-700 text-center text-zinc-400 bg-zinc-900/50">
                [Unrecognized Widget Type: {widget.type}]
              </div>
            );
        }
      })}
    </div>
  );
};
