import React from 'react';
import {
  Header,
  HeroSection,
  Text,
  Features,
  Image,
  Cta,
  Footer,
  Testimonial,
  Stats,
  Pricing,
  Faq,
  Contact,
  Form
} from '@genzite/shared-ui';

interface WidgetRendererProps {
  type: string;
  config: any;
  isActive?: boolean;
}

const Overlay: React.FC<{ isActive?: boolean }> = ({ isActive }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isActive ? 'rgba(20, 184, 166, 0.03)' : 'transparent',
      pointerEvents: 'none',
      zIndex: 10,
    }}
  />
);

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ type, config = {}, isActive }) => {
  const containerStyle: React.CSSProperties = {
    border: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
    boxShadow: isActive ? '0 4px 12px var(--color-accent-glow)' : 'none',
    transition: 'all 0.2s ease',
    cursor: 'default',
    width: '100%',
    position: 'relative'
  };

  const renderWidget = () => {
    switch (type.toUpperCase()) {
      case 'HEADER':
        return <Header {...config} />;
      case 'HERO':
        return <HeroSection {...config} />;
      case 'TEXT':
      case 'TEXTCONTENT':
        return <Text {...config} />;
      case 'FEATURES':
      case 'FEATURELIST':
        return <Features {...config} />;
      case 'IMAGE':
      case 'IMAGEGALLERY':
      case 'GALLERY':
        return <Image {...config} />;
      case 'CTA':
        return <Cta {...config} />;
      case 'FOOTER':
        return <Footer {...config} />;
      case 'TESTIMONIAL':
        return <Testimonial {...config} />;
      case 'STATS':
        return <Stats {...config} />;
      case 'PRICING':
        return <Pricing {...config} />;
      case 'FAQ':
        return <Faq {...config} />;
      case 'CONTACT':
        return <Contact {...config} />;
      case 'FORM':
        return <Form {...config} />;
      default:
        return (
          <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unsupported Component</h3>
            <p className="text-sm text-gray-500">The component type "{type}" is not supported.</p>
          </div>
        );
    }
  };

  return (
    <div style={containerStyle}>
      <Overlay isActive={isActive} />
      {renderWidget()}
    </div>
  );
};

export default WidgetRenderer;
