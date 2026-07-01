import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      message.success('Login successful!');
      setAuth(data.accessToken, data.user);
      navigate('/admin');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    },
  });

  const onFinish = (values: any) => {
    loginMutation.mutate(values);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#FAFAFB' }}>
      <Card 
        bordered
        style={{ width: 440 }}
        styles={{ body: { padding: '48px 40px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontSize: 24, fontWeight: 700 }}>
              G
            </div>
          </div>
          <Title level={2} style={{ color: '#111827', margin: '0 0 8px 0', fontWeight: 700, fontSize: 32 }}>Welcome back</Title>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>Please enter your details to sign in.</Text>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 500, color: '#111827' }}>Email address</span>}
            rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Invalid email address' }]}
            style={{ marginBottom: 24 }}
          >
            <Input 
              placeholder="name@company.com" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 500, color: '#111827' }}>Password</span>
                <span style={{ color: '#2563EB', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
              </div>
            }
            rules={[{ required: true, message: 'Please input your Password!' }]}
            style={{ marginBottom: 32 }}
          >
            <Input.Password 
              placeholder="••••••••" 
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loginMutation.isPending}
              style={{ fontWeight: 600, fontSize: 16 }}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
