import { useEffect, useState } from 'react';
import { Card, Switch, Form, Button, message, Input, Typography, Row, Col } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import apiClient from '../../api/client';

const { Title, Text } = Typography;

export default function GlobalSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/settings');
      const initialValues: any = {};
      data.forEach((s: any) => {
        initialValues[s.key] = s.value;
      });
      form.setFieldsValue(initialValues);
    } catch (err) {
      message.error('Failed to load global settings');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      const promises = Object.keys(values).map(key => 
        apiClient.put(`/settings/${key}`, { value: values[key] })
      );
      await Promise.all(promises);
      message.success('Settings updated successfully');
    } catch (err) {
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}><SettingOutlined /> Global Platform Settings</Title>
        <Text type="secondary">Manage system-wide configurations, flags, and feature toggles.</Text>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{ registrationEnabled: true, maintenanceMode: false, aiGenerationEnabled: true }}
      >
        <Row gutter={24} style={{ display: 'flex', alignItems: 'stretch' }}>
          <Col xs={24} md={12} style={{ display: 'flex', flexDirection: 'column' }}>
            <Card title="Feature Toggles" style={{ marginBottom: 24, borderRadius: 12, flex: 1 }}>
              <Form.Item 
                name="registrationEnabled" 
                label="Allow Public Registration" 
                valuePropName="checked"
                tooltip="If disabled, new users cannot sign up."
              >
                <Switch />
              </Form.Item>

              <Form.Item 
                name="maintenanceMode" 
                label="Maintenance Mode" 
                valuePropName="checked"
                tooltip="If enabled, the public site shows a maintenance page."
              >
                <Switch checkedChildren="ON" unCheckedChildren="OFF" style={{ backgroundColor: form.getFieldValue('maintenanceMode') ? '#f5222d' : undefined }} />
              </Form.Item>

              <Form.Item 
                name="aiGenerationEnabled" 
                label="Enable AI Generation" 
                valuePropName="checked"
                tooltip="Globally turn on/off AI generation features."
              >
                <Switch />
              </Form.Item>
            </Card>

            <Card style={{ borderRadius: 12, marginBottom: 24 }} bodyStyle={{ padding: 16 }}>
              <Row gutter={16}>
                <Col span={10}>
                  <Button block onClick={fetchSettings} disabled={loading || saving} size="large">
                    Reset
                  </Button>
                </Col>
                <Col span={14}>
                  <Button block type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving} size="large">
                    Save All Settings
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={12} style={{ display: 'flex', flexDirection: 'column' }}>
            <Card title="SMTP Configuration" style={{ marginBottom: 24, borderRadius: 12, flex: 1 }}>
              <Form.Item name={['smtpConfig', 'host']} label="SMTP Host">
                <Input placeholder="smtp.gmail.com" />
              </Form.Item>
              <Form.Item name={['smtpConfig', 'port']} label="SMTP Port">
                <Input type="number" placeholder="587" />
              </Form.Item>
              <Form.Item name={['smtpConfig', 'user']} label="SMTP Username">
                <Input placeholder="hello@genzite.com" />
              </Form.Item>
              <Form.Item name={['smtpConfig', 'password']} label="SMTP Password">
                <Input.Password placeholder="Enter password or app secret" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
