import React from 'react';
import { Card, Typography, Button, Space, Divider } from 'antd';
import {
  AppstoreOutlined,
  PictureOutlined,
  StarOutlined,
  CheckCircleOutlined,
  MailOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Collapse, Input, message } from 'antd';
import { useCartStore } from '../../../store/cart';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

interface WidgetRendererProps {
  type: string;
  config: any;
  isActive?: boolean;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ type, config = {}, isActive }) => {
  const { addItem } = useCartStore();
  const [messageApi, contextHolder] = message.useMessage();

  const containerStyle: React.CSSProperties = {
    border: `2px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
    boxShadow: isActive ? '0 4px 12px var(--color-accent-glow)' : 'none',
    transition: 'all 0.2s ease',
    cursor: 'default',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const sanitizeValue = (val: any, defaultVal: string) => {
    if (!val) return defaultVal;
    return String(val).split(';')[0].trim();
  };

  const getStyle = (defaultBg: string, defaultPadding: string): React.CSSProperties => ({
    ...containerStyle,
    background: sanitizeValue(config.bgColor, defaultBg),
    padding: config.padding ? sanitizeValue(config.padding, '').replace(/px$/, '') + 'px' : defaultPadding,
    borderRadius: config.borderRadius ? sanitizeValue(config.borderRadius, '').replace(/px$/, '') + 'px' : 'var(--radius-sm)',
    color: sanitizeValue(config.textColor, 'var(--color-text-primary)')
  });

  const Overlay = () => (
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

  switch (type.toUpperCase()) {
    case 'HEADER':
      return (
        <div style={{ ...getStyle('var(--gz-dark-3)', '16px 24px'), display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          {contextHolder}
          <Overlay />
          <Title level={4} style={{ margin: 0, color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Brand Name'}</Title>
          <Space size="large">
            {(config.items || []).map((item: any, i: number) => (
              <Text key={i} style={{ cursor: 'pointer', color: config.textColor || 'var(--color-text-secondary)' }}>{item.text || 'Link'}</Text>
            ))}
          </Space>
        </div>
      );

    case 'HERO':
      return (
        <div style={{ ...getStyle('linear-gradient(135deg, var(--gz-dark-1) 0%, var(--gz-dark-3) 100%)', '80px 24px'), textAlign: 'center' }}>
          <Overlay />
          <Title level={1} style={{ color: config.textColor || 'var(--gz-white)', marginBottom: '24px' }}>{config.title || 'Hero Title'}</Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px', color: config.textColor || 'var(--color-text-secondary)' }}>
            {config.subtitle || 'Hero subtitle text goes here. Make it catchy.'}
          </Paragraph>
          <Button type="primary" size="large" style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>{config.ctaText || 'Get Started'}</Button>
        </div>
      );

    case 'TEXT':
    case 'TEXTCONTENT':
      return (
        <div style={getStyle('transparent', '24px')}>
          <Overlay />
          <Title level={3} style={{ color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Section Title'}</Title>
          <Paragraph style={{ fontSize: '16px', lineHeight: 1.8, color: config.textColor || 'var(--color-text-secondary)' }}>
            {config.subtitle || 'Content paragraph goes here.'}
          </Paragraph>
        </div>
      );

    case 'FEATURES':
    case 'FEATURELIST':
      return (
        <div style={getStyle('transparent', '24px')}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Features'}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {(config.items || []).map((item: any, i: number) => (
              <Card key={i} variant="borderless" style={{ background: 'var(--gz-dark-4)', textAlign: 'center', border: '1px solid var(--color-border-subtle)' }}>
                <StarOutlined style={{ fontSize: '32px', color: 'var(--color-accent)', marginBottom: '16px' }} />
                <Title level={5} style={{ color: config.textColor || 'var(--color-text-primary)' }}>{item.title || 'Feature'}</Title>
                <Text style={{ color: config.textColor || 'var(--color-text-muted)' }}>{item.description || 'Description'}</Text>
              </Card>
            ))}
          </div>
        </div>
      );

    case 'IMAGE':
    case 'IMAGEGALLERY':
    case 'GALLERY':
      return (
        <div style={getStyle('transparent', '24px')}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Gallery'}</Title>
          {config.subtitle && <Paragraph style={{ textAlign: 'center', color: config.textColor || 'var(--color-text-muted)' }}>{config.subtitle}</Paragraph>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
            {(config.items || [1, 2, 3]).map((_item: any, i: number) => (
              <div key={i} style={{ height: '150px', background: 'var(--gz-dark-4)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PictureOutlined style={{ fontSize: '32px', color: 'var(--color-accent)' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'CTA':
      return (
        <div style={{ ...getStyle('var(--gradient-accent)', '24px'), textAlign: 'center' }}>
          <Overlay />
          <Title level={2} style={{ color: config.textColor || '#fff' }}>{config.title || 'Call to Action'}</Title>
          <Paragraph style={{ color: config.textColor || 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
            {config.subtitle || 'Ready to dive in?'}
          </Paragraph>
          <Space>
            {(config.items || []).map((item: any, i: number) => (
              <Button key={i} size="large" style={i === 0 ? { color: 'var(--gz-dark-1)', fontWeight: 600 } : {}} ghost={i !== 0}>{item.text || 'Click Here'}</Button>
            ))}
          </Space>
        </div>
      );

    case 'FOOTER':
      return (
        <div style={{ ...getStyle('var(--gz-dark-1)', '24px'), textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
          <Overlay />
          <Title level={5} style={{ color: config.textColor || 'var(--color-text-primary)', margin: 0 }}>{config.title || 'Footer Text'}</Title>
          <Divider style={{ borderColor: 'var(--color-border)' }} />
          <Space>
            {(config.items || []).map((item: any, i: number) => (
              <Text key={i} style={{ color: config.textColor || 'var(--color-text-muted)' }}>{item.text || 'Link'}</Text>
            ))}
          </Space>
        </div>
      );

    case 'TESTIMONIAL':
      return (
        <div style={getStyle('transparent', '24px')}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Testimonials'}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {(config.items || []).map((item: any, i: number) => (
              <Card key={i} variant="borderless" style={{ background: 'var(--gz-dark-4)', border: '1px solid var(--color-border-subtle)' }}>
                <Paragraph italic style={{ color: 'var(--color-text-secondary)' }}>"{item.quote || 'Great service!'}"</Paragraph>
                <Text strong style={{ color: 'var(--color-text-primary)' }}>- {item.author || 'Customer'}</Text>
              </Card>
            ))}
          </div>
        </div>
      );

    case 'STATS':
    case 'CARD':
      return (
        <div style={getStyle('transparent', '24px')}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Stats'}</Title>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '24px' }}>
            {(config.items || []).map((item: any, i: number) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: 'var(--color-accent)', margin: 0 }}>{item.value || item.title || '100'}</Title>
                <Text style={{ color: config.textColor || 'var(--color-text-muted)' }}>{item.label || item.description || 'Metric'}</Text>
              </div>
            ))}
          </div>
        </div>
      );

    case 'PRICING':
      return (
        <div style={getStyle('transparent', '24px')}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Pricing Plans'}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {(config.items || []).map((item: any, i: number) => (
              <Card key={i} variant="borderless" style={{ background: item.isPopular ? 'var(--color-accent-glow)' : 'var(--gz-dark-4)', border: `1px solid ${item.isPopular ? 'var(--color-accent)' : 'var(--color-border-subtle)'}` }}>
                <Title level={4} style={{ color: config.textColor || 'var(--color-text-primary)' }}>{item.title || 'Plan'}</Title>
                <Title level={2} style={{ color: config.textColor || 'var(--color-text-primary)', margin: '16px 0' }}>{item.price || '$0'}<Text style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>/mo</Text></Title>
                <Divider style={{ borderColor: 'var(--color-border-subtle)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {(item.features || []).map((feat: string, j: number) => (
                    <Text key={j} style={{ color: config.textColor || 'var(--color-text-secondary)' }}><CheckCircleOutlined style={{ color: 'var(--color-accent)', marginRight: '8px' }}/>{feat}</Text>
                  ))}
                </div>
                <Button type={item.isPopular ? "primary" : "default"} block size="large" style={item.isPopular ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)' } : {}}>{item.ctaText || 'Choose Plan'}</Button>
              </Card>
            ))}
          </div>
        </div>
      );

    case 'FAQ':
      return (
        <div style={getStyle('transparent', '24px')}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Frequently Asked Questions'}</Title>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Collapse ghost expandIconPosition="end">
              {(config.items || []).map((item: any, i: number) => (
                <Panel header={<Text style={{ color: config.textColor || 'var(--color-text-primary)', fontSize: '16px', fontWeight: 500 }}>{item.question || 'Question?'}</Text>} key={i}>
                  <Paragraph style={{ color: config.textColor || 'var(--color-text-secondary)' }}>{item.answer || 'Answer goes here.'}</Paragraph>
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      );

    case 'CONTACT':
      return (
        <div style={getStyle('transparent', '24px')}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Contact Us'}</Title>
          {config.subtitle && <Paragraph style={{ textAlign: 'center', color: config.textColor || 'var(--color-text-muted)', marginBottom: '32px' }}>{config.subtitle}</Paragraph>}
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--gz-dark-4)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: 'var(--color-text-secondary)' }}>Name</Text>
                <Input placeholder="Your Name" size="large" style={{ background: 'var(--gz-dark-1)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <Text style={{ color: 'var(--color-text-secondary)' }}>Email</Text>
                <Input placeholder="your@email.com" size="large" style={{ background: 'var(--gz-dark-1)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <div>
                <Text style={{ color: 'var(--color-text-secondary)' }}>Message</Text>
                <TextArea rows={4} placeholder="How can we help you?" style={{ background: 'var(--gz-dark-1)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              </div>
              <Button type="primary" size="large" block icon={<MailOutlined />} style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>{config.ctaText || 'Send Message'}</Button>
            </Space>
          </div>
        </div>
      );

    case 'GRAPESJS':
      return (
        <div style={{ ...containerStyle, padding: 0 }}>
          <Overlay />
          {config.css && <style dangerouslySetInnerHTML={{ __html: config.css }} />}
          <div dangerouslySetInnerHTML={{ __html: config.html || '' }} />
        </div>
      );

    case 'PRODUCT_GRID':
    case 'PRODUCTGRID':
      return (
        <div style={getStyle('transparent', '24px')}>
          {contextHolder}
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: config.textColor || 'var(--color-text-primary)' }}>{config.title || 'Our Products'}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {(config.products || []).map((product: any, i: number) => (
              <Card 
                key={product.id || i} 
                hoverable
                variant="borderless" 
                style={{ background: 'var(--gz-dark-4)', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}
                cover={
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gz-dark-2)' }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <PictureOutlined style={{ fontSize: '48px', color: 'var(--color-border)' }} />
                    )}
                  </div>
                }
              >
                <Title level={5} style={{ color: config.textColor || 'var(--color-text-primary)', marginBottom: '8px' }}>{product.name || 'Product Name'}</Title>
                <Title level={4} style={{ color: 'var(--color-accent)', margin: '0 0 16px 0' }}>{Number(product.price || 0).toLocaleString()}đ</Title>
                <Button 
                  type="primary" 
                  block 
                  icon={<ShoppingCartOutlined />}
                  style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
                  onClick={() => {
                    addItem({
                      id: product.id || `temp-${i}`,
                      name: product.name || 'Product',
                      price: Number(product.price || 0),
                      quantity: 1,
                      imageUrl: product.image
                    });
                    messageApi.success(`Đã thêm ${product.name || 'sản phẩm'} vào giỏ!`);
                  }}
                >
                  Thêm vào giỏ
                </Button>
              </Card>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div style={getStyle('transparent', '24px')}>
          {contextHolder}
          <Overlay />
          <Space>
            <AppstoreOutlined style={{ fontSize: '24px', color: 'var(--color-accent)' }} />
            <Title level={5} style={{ margin: 0, color: config.textColor || 'var(--color-text-primary)' }}>{type}</Title>
          </Space>
          <pre style={{ marginTop: '16px', background: 'var(--gz-dark-4)', padding: '8px', fontSize: '12px', color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-md)' }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      );
  }
};

export default WidgetRenderer;
