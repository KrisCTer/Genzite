import React from 'react';
import { Layout, Typography, Button, Space, Row, Col, Card } from 'antd';
import { RocketOutlined, CodeOutlined, RobotOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

import useSEO from '../../hooks/useSEO';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  useSEO({ title: 'Trang chủ', description: 'Trải nghiệm nền tảng tạo website tự động bằng AI từ Genzite.' });

  return (
    <Layout style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Header className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 50px', position: 'sticky', top: 0, zIndex: 100, height: 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <RocketOutlined style={{ fontSize: 24, color: '#2563EB' }} />
          <Title level={4} style={{ margin: 0, color: '#111827', fontWeight: 700 }}>Genzite</Title>
        </div>
        <Space size="large">
          <Button type="text" style={{ fontWeight: 500, color: '#4B5563' }}>Home</Button>
          <Button type="text" style={{ fontWeight: 500, color: '#4B5563' }}>Features</Button>
          <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ fontWeight: 500, borderRadius: 8, padding: '0 24px' }}>Sign In</Button>
        </Space>
      </Header>
      
      <Content style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', padding: '120px 0 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Title style={{ fontSize: 56, fontWeight: 800, color: '#111827', marginBottom: 24, maxWidth: 800, lineHeight: 1.1 }}>
            Build the Workspace of the Future
          </Title>
          <Paragraph style={{ fontSize: 18, color: '#6B7280', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Genzite is a premium SaaS platform offering AI-driven site generation, flexible Headless CMS, and intelligent workflows.
          </Paragraph>
          <Button type="primary" size="large" icon={<RocketOutlined />} onClick={() => navigate('/login')} style={{ height: 56, padding: '0 40px', fontSize: 16, fontWeight: 600, borderRadius: 12 }}>
            Get Started for Free
          </Button>
        </div>

        <Row gutter={[32, 32]} style={{ paddingBottom: 80 }}>
          <Col xs={24} md={8}>
            <Card variant="outlined" hoverable style={{ height: '100%', borderRadius: 16 }} styles={{ body: { padding: '32px 24px' } }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <CodeOutlined style={{ fontSize: 28, color: '#2563EB' }} />
              </div>
              <Title level={4} style={{ color: '#111827', fontWeight: 600, marginBottom: 12 }}>Headless CMS</Title>
              <Paragraph style={{ color: '#6B7280', fontSize: 16, lineHeight: 1.6, margin: 0 }}>Flexible content management without structural limits. Connect seamlessly with any frontend framework.</Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card variant="outlined" hoverable style={{ height: '100%', borderRadius: 16 }} styles={{ body: { padding: '32px 24px' } }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#ECFCCB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <GlobalOutlined style={{ fontSize: 28, color: '#65A30D' }} />
              </div>
              <Title level={4} style={{ color: '#111827', fontWeight: 600, marginBottom: 12 }}>Site Builder</Title>
              <Paragraph style={{ color: '#6B7280', fontSize: 16, lineHeight: 1.6, margin: 0 }}>Drag and drop to build websites fast. Leverage AI to auto-generate layouts and optimize UX effortlessly.</Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card variant="outlined" hoverable style={{ height: '100%', borderRadius: 16 }} styles={{ body: { padding: '32px 24px' } }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <RobotOutlined style={{ fontSize: 28, color: '#9333EA' }} />
              </div>
              <Title level={4} style={{ color: '#111827', fontWeight: 600, marginBottom: 12 }}>AI Intelligence</Title>
              <Paragraph style={{ color: '#6B7280', fontSize: 16, lineHeight: 1.6, margin: 0 }}>Automated workflows with advanced AI, from generating sites to conducting realistic interview sessions.</Paragraph>
            </Card>
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#FFFFFF', color: '#94A3B8', padding: '24px 50px', borderTop: '1px solid #E2E8F0' }}>
        Genzite Platform ©{new Date().getFullYear()} - Premium SaaS Workspace
      </Footer>
    </Layout>
  );
};

export default LandingPage;
