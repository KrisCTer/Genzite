import React from 'react';
import { Card, Form, Input, Button, Typography, Row, Col, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/auth';

const { Title } = Typography;

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();

  const handleUpdate = (_values: any) => {
    // In a real app, this would call an API like updateUserProfileApi
    message.success('Profile updated successfully! (Mocked)');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>My Profile</Title>
        <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Manage your account settings and personal information</div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center' }}>
            <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#2563EB', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>{user?.name || 'Admin User'}</Title>
            <div style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>{user?.email || 'admin@example.com'}</div>
            <div>
              <Button style={{ width: '100%' }}>Change Avatar</Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={16}>
          <Card 
            title={<span style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>Personal Information</span>}
          >
            <Form 
              form={form} 
              layout="vertical" 
              initialValues={{ name: user?.name, email: user?.email }}
              onFinish={handleUpdate}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <Form.Item name="name" label={<span style={{ fontWeight: 500, color: '#111827' }}>Full Name</span>} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                <Input placeholder="Enter your full name" />
              </Form.Item>
              <Form.Item name="email" label={<span style={{ fontWeight: 500, color: '#111827' }}>Email Address</span>} rules={[{ required: true, type: 'email' }]} style={{ marginBottom: 0 }}>
                <Input disabled />
              </Form.Item>
              <Form.Item name="password" label={<span style={{ fontWeight: 500, color: '#111827' }}>New Password <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></span>} style={{ marginBottom: 0 }}>
                <Input.Password placeholder="Leave blank to keep current password" />
              </Form.Item>
              <Form.Item name="confirmPassword" label={<span style={{ fontWeight: 500, color: '#111827' }}>Confirm Password</span>} style={{ marginBottom: 24 }}>
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
