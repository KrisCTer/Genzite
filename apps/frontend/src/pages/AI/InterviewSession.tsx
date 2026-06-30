import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Avatar, List, Form, Select, message, Row, Col } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, PlayCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { startInterviewApi, interviewChatApi, endInterviewApi } from '../../api/ai';

const { Title, Text } = Typography;
const { Option } = Select;

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

const InterviewSession: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string>(''); // in real app, we'd get this after start, but for now we'll mock a sessionId or ask user
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [form] = Form.useForm();

  const startMutation = useMutation({
    mutationFn: startInterviewApi,
    onSuccess: (data) => {
      message.success('Mock Interview Job Queued!');
      // Assuming we get a sessionId or we just generate a random one to test chat
      const mockSessionId = `sess-${Date.now()}`;
      setSessionId(mockSessionId);
      setIsSessionActive(true);
      setMessages([{ id: Date.now(), sender: 'ai', text: `Session started. Job ID: ${data.jobId}. How are you today?` }]);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to start interview');
    }
  });

  const chatMutation = useMutation({
    mutationFn: (msg: string) => interviewChatApi(sessionId, { message: msg }),
    onSuccess: (data) => {
      message.success('Chat job queued!');
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: `[Async Job ${data.jobId} Queued] I will process your message.` }]);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to send message');
    }
  });

  const endMutation = useMutation({
    mutationFn: () => endInterviewApi(sessionId),
    onSuccess: () => {
      message.info('Interview session ended.');
      setIsSessionActive(false);
      setSessionId('');
    }
  });

  const handleStart = (values: any) => {
    startMutation.mutate({
      resumeId: values.resumeId,
      jobDescription: values.jobDescription,
      sessionType: values.sessionType,
    });
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: inputValue }]);
    chatMutation.mutate(inputValue);
    setInputValue('');
  };

  const handleEnd = () => {
    endMutation.mutate();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, height: 'calc(100vh - 120px)' }}>
      <div>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>AI Mock Interview</Title>
        <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Practice your interviewing skills with our Agent</div>
      </div>

      {!isSessionActive ? (
        <Card title="Setup Interview Session" bordered>
          <Form form={form} layout="vertical" onFinish={handleStart}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Form.Item name="resumeId" label="Resume ID" rules={[{ required: true }]}>
                  <Input placeholder="Enter your Resume UUID" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="sessionType" label="Interview Type" rules={[{ required: true }]} initialValue="MIXED">
                  <Select>
                    <Option value="TECHNICAL">Technical</Option>
                    <Option value="BEHAVIORAL">Behavioral</Option>
                    <Option value="MIXED">Mixed</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="jobDescription" label="Job Description" rules={[{ required: true }]}>
              <Input.TextArea rows={4} placeholder="Paste the target job description..." />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlayCircleOutlined />} loading={startMutation.isPending} size="large">
              Start Interview
            </Button>
          </Form>
        </Card>
      ) : (
        <Card 
          bordered
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Active Interview Session</span>
              <Button danger size="small" icon={<CloseCircleOutlined />} onClick={handleEnd} loading={endMutation.isPending}>
                End Session
              </Button>
            </div>
          }
          styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }} 
          style={{ flex: 1, overflow: 'hidden' }}
        >
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <List
              split={false}
              dataSource={messages}
              renderItem={(msg) => (
                <List.Item style={{ justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', padding: '8px 0' }}>
                  <Space align="start">
                    {msg.sender === 'ai' && <Avatar style={{ backgroundColor: '#2563EB' }} icon={<RobotOutlined />} />}
                    <div style={{
                      background: msg.sender === 'user' ? '#2563EB' : '#F3F4F6',
                      color: msg.sender === 'user' ? '#FFFFFF' : '#111827',
                      padding: '12px 16px',
                      borderRadius: 16,
                      borderTopRightRadius: msg.sender === 'user' ? 4 : 16,
                      borderTopLeftRadius: msg.sender === 'ai' ? 4 : 16,
                      maxWidth: 400
                    }}>
                      <Text style={{ color: 'inherit', fontSize: 14 }}>{msg.text}</Text>
                    </div>
                    {msg.sender === 'user' && <Avatar style={{ backgroundColor: '#22C55E' }} icon={<UserOutlined />} />}
                  </Space>
                </List.Item>
              )}
            />
            {chatMutation.isPending && (
              <div style={{ display: 'flex', gap: 8, padding: '8px 0' }}>
                <Avatar style={{ backgroundColor: '#2563EB' }} icon={<RobotOutlined />} />
                <div style={{ background: '#F3F4F6', padding: '12px 16px', borderRadius: 16 }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>Sending job...</Text>
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: 16, borderTop: '1px solid #E5E7EB', background: '#FAFAFB' }}>
            <Input
              size="large"
              placeholder="Type your answer..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              suffix={
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={chatMutation.isPending} />
              }
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default InterviewSession;
