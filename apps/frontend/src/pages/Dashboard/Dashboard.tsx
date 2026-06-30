import React from 'react';
import { Row, Col, Card, Statistic, Typography, Progress } from 'antd';
import { TeamOutlined, DatabaseOutlined, GlobalOutlined, RocketOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsersApi } from '../../api/users';
import { fetchCollectionsApi } from '../../api/cms';
import { fetchSitesApi } from '../../api/sites';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: fetchUsersApi });
  const { data: collections } = useQuery({ queryKey: ['cms-collections'], queryFn: fetchCollectionsApi });
  const { data: sites } = useQuery({ queryKey: ['sites'], queryFn: fetchSitesApi });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      <div className="page-header">
        <Title level={2} className="page-title">Dashboard Overview</Title>
        <div className="page-description">Monitor your platform's key metrics and health status.</div>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TeamOutlined style={{ color: 'var(--color-info)', fontSize: 24 }} />
              </div>
              <Statistic
                title={<span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Total Users</span>}
                value={Array.isArray(users) ? users.length : 0}
                valueStyle={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 28 }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DatabaseOutlined style={{ color: 'var(--color-success)', fontSize: 24 }} />
              </div>
              <Statistic
                title={<span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>CMS Collections</span>}
                value={Array.isArray(collections) ? collections.length : 0}
                valueStyle={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 28 }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--color-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GlobalOutlined style={{ color: 'var(--color-info)', fontSize: 24 }} />
              </div>
              <Statistic
                title={<span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Active Sites</span>}
                value={Array.isArray(sites) ? sites.length : 0}
                valueStyle={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 28 }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}>
          <Card 
            title={<span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>System Health</span>} 
            style={{ height: '100%' }}
            styles={{ body: { display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' } }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Identity Service</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 14 }}>Operational</span>
              </div>
              <Progress percent={100} strokeColor="var(--color-success)" showInfo={false} size="small" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Data CMS Service</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 14 }}>Operational</span>
              </div>
              <Progress percent={100} strokeColor="var(--color-success)" showInfo={false} size="small" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>Site Builder Service</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 14 }}>Operational</span>
              </div>
              <Progress percent={100} strokeColor="var(--color-success)" showInfo={false} size="small" />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card 
            title={<span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Quick Actions</span>} 
            style={{ height: '100%' }}
          >
            <Paragraph style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>Ready to extend your platform? Launch new services instantly.</Paragraph>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
              <div style={{ 
                padding: 'var(--space-16)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', 
                display: 'flex', alignItems: 'center', gap: 'var(--space-16)', cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--color-info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RocketOutlined style={{ fontSize: 20, color: 'var(--color-info)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Generate AI Site</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Create a new site using Gemini</div>
                </div>
              </div>

              <div style={{ 
                padding: 'var(--space-16)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', 
                display: 'flex', alignItems: 'center', gap: 'var(--space-16)', cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--color-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DatabaseOutlined style={{ fontSize: 20, color: 'var(--color-warning)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>New CMS Collection</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Define a new data schema</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
