import React from 'react';
import { Card, Typography, Button, Space, Divider } from 'antd';
import {
  AppstoreOutlined,
  PictureOutlined,
  StarOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface WidgetRendererProps {
  type: string;
  config: any;
  isActive?: boolean;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ type, config = {}, isActive }) => {
  const containerStyle: React.CSSProperties = {
    padding: '24px',
    background: 'transparent',
    border: `2px solid ${isActive ? '#6D28D9' : 'transparent'}`,
    borderRadius: '4px',
    boxShadow: isActive ? '0 4px 12px rgba(109,40,217,0.25)' : 'none',
    transition: 'all 0.2s ease',
    cursor: 'default',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const Overlay = () => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isActive ? 'rgba(22, 119, 255, 0.05)' : 'transparent',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    />
  );

  switch (type.toUpperCase()) {
    case 'HEADER':
      return (
        <div style={{ ...containerStyle, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#161B22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Overlay />
          <Title level={4} style={{ margin: 0, color: '#E5E7EB' }}>{config.title || 'Brand Name'}</Title>
          <Space size="large">
            {(config.items || []).map((item: any, i: number) => (
              <Text key={i} style={{ cursor: 'pointer', color: '#C9D1D9' }}>{item.text || 'Link'}</Text>
            ))}
          </Space>
        </div>
      );

    case 'HERO':
      return (
        <div style={{ ...containerStyle, textAlign: 'center', padding: '80px 24px', background: 'linear-gradient(135deg, #0D1117 0%, #161B22 100%)' }}>
          <Overlay />
          <Title level={1} style={{ color: '#E5E7EB', marginBottom: '24px' }}>{config.title || 'Hero Title'}</Title>
          <Paragraph style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px', color: '#8B949E' }}>
            {config.subtitle || 'Hero subtitle text goes here. Make it catchy.'}
          </Paragraph>
          <Button type="primary" size="large" style={{ background: '#6D28D9', borderColor: '#6D28D9' }}>{config.ctaText || 'Get Started'}</Button>
        </div>
      );

    case 'TEXT':
    case 'TEXTCONTENT':
      return (
        <div style={{ ...containerStyle }}>
          <Overlay />
          <Title level={3} style={{ color: '#E5E7EB' }}>{config.title || 'Section Title'}</Title>
          <Paragraph style={{ fontSize: '16px', lineHeight: 1.8, color: '#C9D1D9' }}>
            {config.subtitle || 'Content paragraph goes here.'}
          </Paragraph>
        </div>
      );

    case 'FEATURES':
    case 'FEATURELIST':
      return (
        <div style={{ ...containerStyle }}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: '#E5E7EB' }}>{config.title || 'Features'}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {(config.items || []).map((item: any, i: number) => (
              <Card key={i} variant="borderless" style={{ background: '#21262D', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                <StarOutlined style={{ fontSize: '32px', color: '#8B5CF6', marginBottom: '16px' }} />
                <Title level={5} style={{ color: '#E5E7EB' }}>{item.title || 'Feature'}</Title>
                <Text style={{ color: '#8B949E' }}>{item.description || 'Description'}</Text>
              </Card>
            ))}
          </div>
        </div>
      );

    case 'IMAGE':
    case 'IMAGEGALLERY':
    case 'GALLERY':
      return (
        <div style={{ ...containerStyle }}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', color: '#E5E7EB' }}>{config.title || 'Gallery'}</Title>
          {config.subtitle && <Paragraph style={{ textAlign: 'center', color: '#8B949E' }}>{config.subtitle}</Paragraph>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
            {(config.items || [1, 2, 3]).map((_item: any, i: number) => (
              <div key={i} style={{ height: '150px', background: '#21262D', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PictureOutlined style={{ fontSize: '32px', color: '#8B5CF6' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'CTA':
      return (
        <div style={{ ...containerStyle, textAlign: 'center', background: 'linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)', color: '#fff' }}>
          <Overlay />
          <Title level={2} style={{ color: '#fff' }}>{config.title || 'Call to Action'}</Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>
            {config.subtitle || 'Ready to dive in?'}
          </Paragraph>
          <Space>
            {(config.items || []).map((item: any, i: number) => (
              <Button key={i} size="large" style={i === 0 ? { color: '#6D28D9', fontWeight: 600 } : {}} ghost={i !== 0}>{item.text || 'Click Here'}</Button>
            ))}
          </Space>
        </div>
      );

    case 'FOOTER':
      return (
        <div style={{ ...containerStyle, padding: '24px', background: '#0D1117', color: '#fff', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Overlay />
          <Title level={5} style={{ color: '#E5E7EB', margin: 0 }}>{config.title || 'Footer Text'}</Title>
          <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <Space>
            {(config.items || []).map((item: any, i: number) => (
              <Text key={i} style={{ color: '#8B949E' }}>{item.text || 'Link'}</Text>
            ))}
          </Space>
        </div>
      );

    case 'TESTIMONIAL':
      return (
        <div style={{ ...containerStyle }}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', marginBottom: '32px', color: '#E5E7EB' }}>{config.title || 'Testimonials'}</Title>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {(config.items || []).map((item: any, i: number) => (
              <Card key={i} style={{ background: '#21262D', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Paragraph italic style={{ color: '#C9D1D9' }}>"{item.quote || 'Great service!'}"</Paragraph>
                <Text strong style={{ color: '#E5E7EB' }}>- {item.author || 'Customer'}</Text>
              </Card>
            ))}
          </div>
        </div>
      );

    case 'STATS':
    case 'CARD':
      return (
        <div style={{ ...containerStyle }}>
          <Overlay />
          <Title level={3} style={{ textAlign: 'center', color: '#E5E7EB' }}>{config.title || 'Stats'}</Title>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '24px' }}>
            {(config.items || []).map((item: any, i: number) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#8B5CF6', margin: 0 }}>{item.value || item.title || '100'}</Title>
                <Text style={{ color: '#8B949E' }}>{item.label || item.description || 'Metric'}</Text>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div style={{ ...containerStyle }}>
          <Overlay />
          <Space>
            <AppstoreOutlined style={{ fontSize: '24px', color: '#1677ff' }} />
            <Title level={5} style={{ margin: 0 }}>{type}</Title>
          </Space>
          <pre style={{ marginTop: '16px', background: '#f5f5f5', padding: '8px', fontSize: '12px' }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      );
  }
};

export default WidgetRenderer;
