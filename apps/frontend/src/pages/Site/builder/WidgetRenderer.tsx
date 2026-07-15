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
  Form,
  ProductGrid,
  Cart,
  Checkout,
  Search,
  OrderTable,
  AdminPanel,
  PaymentStatus
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
      backgroundColor: isActive ? 'rgba(6, 182, 212, 0.05)' : 'transparent',
      pointerEvents: 'none',
      zIndex: 10,
    }}
  />
);

const DynamicSectionBlock: React.FC<{ html?: string; css?: string; isActive?: boolean }> = ({ html = '', css = '', isActive }) => {
  const [height, setHeight] = React.useState<number>(360);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const isReadOnlyView = typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/live/') || 
    window.location.pathname.startsWith('/preview/') ||
    window.location.pathname.startsWith('/project/')
  );

  const isFullDoc = html.includes('<!DOCTYPE html>') || html.includes('<html');
  const srcDocContent = isFullDoc
    ? html
    : `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <style>
      html, body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; overflow: hidden; background: transparent; }
      *, *::before, *::after { box-sizing: inherit; }
      ${css}
    </style>
  </head>
  <body>
    <div id="section-root">
      ${html}
    </div>
    <script>
      function updateHeight() {
        const root = document.getElementById('section-root') || document.body;
        const h = root.getBoundingClientRect().height || document.body.scrollHeight;
        if (h > 0 && window.parent) {
          window.parent.postMessage({ type: 'RESIZE_DYNAMIC_SECTION', height: Math.max(h, 60), source: 'genzite-dynamic-block' }, '*');
        }
      }
      window.addEventListener('load', updateHeight);
      window.addEventListener('resize', updateHeight);
      new ResizeObserver(updateHeight).observe(document.body);
      setTimeout(updateHeight, 200);
      setTimeout(updateHeight, 600);
      setTimeout(updateHeight, 1500);
    </script>
  </body>
</html>`;

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === 'RESIZE_DYNAMIC_SECTION' &&
        typeof event.data.height === 'number' &&
        iframeRef.current &&
        event.source === iframeRef.current.contentWindow
      ) {
        setHeight(Math.max(event.data.height, 60));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px`, transition: 'height 0.2s ease', overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        title="dynamic-section"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: (isReadOnlyView || isActive) ? 'auto' : 'none' }}
        srcDoc={srcDocContent}
      />
    </div>
  );
};

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ type, config = {}, isActive }) => {
  const containerStyle: React.CSSProperties = {
    border: `2px solid ${isActive ? '#06b6d4' : 'transparent'}`,
    boxShadow: isActive ? '0 0 25px rgba(6, 182, 212, 0.35)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
    width: '100%',
    position: 'relative'
  };

  const renderWidget = () => {
    const safeType = String(type || '').toUpperCase();
    if (config && typeof config.html === 'string' && config.html.trim().length > 0) {
      return <DynamicSectionBlock html={config.html} css={config?.css || ''} isActive={isActive} />;
    }
    if (safeType === 'CUSTOM_HTML' || safeType === 'STITCH_SECTION' || safeType === 'GRAPESJS' || safeType === 'DYNAMIC_SECTION') {
      return <DynamicSectionBlock html={config?.html || config?.content || ''} css={config?.css || ''} isActive={isActive} />;
    }
    switch (safeType) {
      case 'HEADER':
      case 'NAVBAR':
      case 'TOPBAR':
      case 'NAV':
        return <Header {...config} />;
        
      case 'HERO':
      case 'HERO_SECTION':
      case 'HEROSECTION':
      case 'BANNER':
        return <HeroSection {...config} />;
        
      case 'TEXT':
      case 'TEXTCONTENT':
      case 'ABOUT':
      case 'INFO':
      case 'INTRO':
      case 'SUMMARY':
      case 'OVERVIEW':
        return <Text {...config} />;
        
      case 'FEATURES':
      case 'FEATURELIST':
      case 'KEY_FEATURES':
      case 'HIGHLIGHTS':
      case 'CARDS':
      case 'CARD':
      case 'BENEFITS':
      case 'SERVICES':
      case 'WHY_US':
        return <Features {...config} />;
        
      case 'IMAGE':
      case 'IMAGEGALLERY':
      case 'GALLERY':
      case 'SHOWREEL':
      case 'MEDIA':
        return <Image {...config} />;
        
      case 'CTA':
      case 'CALL_TO_ACTION':
      case 'ACTION_BANNER':
        return <Cta {...config} />;
        
      case 'FOOTER':
      case 'BOTTOMBAR':
        return <Footer {...config} />;
        
      case 'TESTIMONIAL':
      case 'TESTIMONIALS':
      case 'REVIEWS':
        return <Testimonial {...config} />;
        
      case 'STATS':
      case 'NUMBERS':
      case 'METRICS':
        return <Stats {...config} />;
        
      case 'PRICING':
      case 'PRICING_TABLE':
      case 'TIERS':
      case 'PLANS':
        return <Pricing {...config} />;
        
      case 'FAQ':
      case 'QUESTIONS':
        return <Faq {...config} />;
        
      case 'CONTACT':
      case 'CONTACT_US':
        return <Contact {...config} />;
        
      case 'FORM':
      case 'LEAD_FORM':
        return <Form {...config} />;
        
      case 'PRODUCT_GRID':
      case 'PRODUCT_SHOWCASE':
      case 'PRODUCTGRID':
      case 'PRODUCTS':
      case 'SHOWCASE':
      case 'CATALOG':
        return <ProductGrid {...config} />;
        
      case 'CART':
        return <Cart {...config} />;
        
      case 'CHECKOUT':
        return <Checkout {...config} />;
        
      case 'SEARCH':
        return <Search {...config} />;
        
      case 'ORDER_TABLE':
        return <OrderTable {...config} />;
        
      case 'ADMIN_PANEL':
        return <AdminPanel {...config} />;
        
      case 'PAYMENT_STATUS':
        return <PaymentStatus {...config} />;
        
      default:
        // Graceful cyber fallback: Render Features or Text instead of error box
        if (config && (config.items || config.features || config.products)) {
          return <Features {...config} heading={config.title || type} />;
        }
        return <Text {...config} title={config.title || type} content={config.content || config.description || JSON.stringify(config)} />;
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

