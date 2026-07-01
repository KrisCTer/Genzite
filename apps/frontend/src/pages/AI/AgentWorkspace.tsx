import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Avatar, List, Radio, message } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { getAgentJobApi, agentChatApi, agentPlanApi, agentUiApi } from '../../api/ai';

const { Title, Text } = Typography;

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  jobId?: string;
  status?: 'waiting' | 'active' | 'completed' | 'failed';
}

const AgentWorkspace: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'chat' | 'plan' | 'ui'>('chat');

  const chatMutation = useMutation({
    mutationFn: (msg: string) => agentChatApi({ message: msg }),
    onSuccess: (data) => {
      message.success('Agent task queued!');
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: `[Chat Task Queued] Job ID: ${data.jobId}`, jobId: data.jobId, status: 'waiting' }]);
    },
    onError: (error: any) => message.error(error.response?.data?.message || 'Failed to send message')
  });

  const planMutation = useMutation({
    mutationFn: (msg: string) => agentPlanApi({ message: msg }),
    onSuccess: (data) => {
      message.success('Planning task queued!');
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: `[Plan Task Queued] Job ID: ${data.jobId}`, jobId: data.jobId, status: 'waiting' }]);
    },
    onError: (error: any) => message.error(error.response?.data?.message || 'Failed to start planning')
  });

  const uiMutation = useMutation({
    mutationFn: (msg: string) => agentUiApi({ message: msg }),
    onSuccess: (data) => {
      message.success('UI Generation task queued!');
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: `[UI Task Queued] Job ID: ${data.jobId}`, jobId: data.jobId, status: 'waiting' }]);
    },
    onError: (error: any) => message.error(error.response?.data?.message || 'Failed to start UI generation')
  });

  React.useEffect(() => {
    const activeMessages = messages.filter(m => m.jobId && (m.status === 'waiting' || m.status === 'active'));
    if (activeMessages.length === 0) return;

    const interval = setInterval(async () => {
      for (const msg of activeMessages) {
        try {
          const job = await getAgentJobApi(msg.jobId!);
          if (job.state === 'completed') {
            setMessages(prev => prev.map(m => m.id === msg.id ? { 
              ...m, 
              status: 'completed', 
              text: job.result?.message || JSON.stringify(job.result) 
            } : m));
          } else if (job.state === 'failed') {
            setMessages(prev => prev.map(m => m.id === msg.id ? { 
              ...m, 
              status: 'failed', 
              text: `[Task Failed] ${job.failedReason}` 
            } : m));
          } else if (job.state === 'active' && msg.status !== 'active') {
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'active', text: 'Agent is thinking...' } : m));
          }
        } catch (e) {
          console.error('Error polling job', e);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: inputValue }]);
    
    if (mode === 'chat') {
      chatMutation.mutate(inputValue);
    } else if (mode === 'plan') {
      planMutation.mutate(inputValue);
    } else if (mode === 'ui') {
      uiMutation.mutate(inputValue);
    }
    
    setInputValue('');
  };

  const isPending = chatMutation.isPending || planMutation.isPending || uiMutation.isPending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, height: 'calc(100vh - 120px)' }}>
      <div>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>Agent Workspace</Title>
        <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Interact with the multi-agent system</div>
      </div>

      <Card 
        bordered
        title={
          <Space>
            <span>Agent Mode:</span>
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
              <Radio.Button value="chat">Chat</Radio.Button>
              <Radio.Button value="plan">Planning</Radio.Button>
              <Radio.Button value="ui">UI Design</Radio.Button>
            </Radio.Group>
          </Space>
        }
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }} 
        style={{ flex: 1, overflow: 'hidden' }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 20, color: '#9CA3AF' }}>
              Select a mode and start interacting with the Agent.
            </div>
          )}
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
                    <Text style={{ color: 'inherit', whiteSpace: 'pre-wrap', fontSize: 14 }}>{msg.text}</Text>
                    {msg.status === 'active' && <div style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic', opacity: 0.8 }}>Thinking...</div>}
                    {msg.status === 'waiting' && <div style={{ fontSize: 12, marginTop: 4, fontStyle: 'italic', opacity: 0.8 }}>In queue...</div>}
                  </div>
                  {msg.sender === 'user' && <Avatar style={{ backgroundColor: '#22C55E' }} icon={<UserOutlined />} />}
                </Space>
              </List.Item>
            )}
          />
          {isPending && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 0' }}>
              <Avatar style={{ backgroundColor: '#2563EB' }} icon={<RobotOutlined />} />
              <div style={{ background: '#F3F4F6', padding: '12px 16px', borderRadius: 16 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>Sending task to agent...</Text>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: 16, borderTop: '1px solid #E5E7EB', background: '#FAFAFB' }}>
          <Input
            size="large"
            placeholder={`Type your instructions for ${mode} mode...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSend}
            suffix={
              <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={isPending} />
            }
          />
        </div>
      </Card>
    </div>
  );
};

export default AgentWorkspace;
