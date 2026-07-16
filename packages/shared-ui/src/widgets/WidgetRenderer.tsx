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

  // Sort by sortOrder
  const sortedWidgets = [...widgets].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col min-h-screen">
      {sortedWidgets.map((widget, index) => {
        switch (widget.type.toUpperCase()) {
          case 'HEADER':
            return <Header key={index} {...widget.contentConfig} />;
            
          case 'HERO':
          case 'HERO_SECTION':
          case 'HEROSECTION':
          case 'BANNER':
            return <HeroSection key={index} {...widget.contentConfig} />;
            
          case 'FEATURES':
          case 'FEATURELIST':
          case 'KEY_FEATURES':
          case 'HIGHLIGHTS':
          case 'CARDS':
          case 'CARD':
          case 'BENEFITS':
          case 'SERVICES':
          case 'WHY_US':
            return <Features key={index} {...widget.contentConfig} />;
            
          case 'TEXT':
          case 'TEXTCONTENT':
          case 'ABOUT':
          case 'INFO':
          case 'INTRO':
          case 'SUMMARY':
          case 'OVERVIEW':
            return <Text key={index} {...widget.contentConfig} />;
            
          case 'IMAGE':
          case 'IMAGEGALLERY':
          case 'GALLERY':
          case 'SHOWREEL':
          case 'MEDIA':
            return <Image key={index} {...widget.contentConfig} />;
            
          case 'FORM':
          case 'LEAD_FORM':
            return <Form key={index} {...widget.contentConfig} />;
            
          case 'PRICING':
          case 'PRICING_TABLE':
          case 'TIERS':
          case 'PLANS':
            return <Pricing key={index} {...widget.contentConfig} />;
            
          case 'TESTIMONIAL':
          case 'TESTIMONIALS':
          case 'REVIEWS':
            return <Testimonial key={index} {...widget.contentConfig} />;
            
          case 'CTA':
          case 'CALL_TO_ACTION':
          case 'ACTION_BANNER':
            return <Cta key={index} {...widget.contentConfig} />;
            
          case 'STATS':
          case 'NUMBERS':
          case 'METRICS':
            return <Stats key={index} {...widget.contentConfig} />;
            
          case 'FAQ':
          case 'QUESTIONS':
            return <Faq key={index} {...widget.contentConfig} />;
            
          case 'CONTACT':
          case 'CONTACT_US':
            return <Contact key={index} {...widget.contentConfig} />;
          
          case 'FOOTER':
          case 'BOTTOMBAR':
            return <Footer key={index} {...widget.contentConfig} />;
            
          case 'PRODUCT_GRID':
          case 'PRODUCT_SHOWCASE':
          case 'PRODUCTGRID':
          case 'PRODUCTS':
          case 'SHOWCASE':
          case 'CATALOG':
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
            // Graceful cyber fallback: Render Features or Text instead of error box
            if (widget.contentConfig && (widget.contentConfig.items || widget.contentConfig.features || widget.contentConfig.products)) {
              return <Features key={index} {...widget.contentConfig} heading={widget.contentConfig.title || widget.type} />;
            }
            return <Text key={index} {...widget.contentConfig} title={widget.contentConfig.title || widget.type} content={widget.contentConfig.content || widget.contentConfig.description || JSON.stringify(widget.contentConfig)} />;
        }
      })}
    </div>
  );
};
