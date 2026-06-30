import React, { useState } from 'react';
import { Card, Typography, Button, message, Form, Input, Row, Col, Divider, Space } from 'antd';
import { RobotOutlined, UserOutlined, CompassOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { analyzeCvApi, careerCoachingApi } from '../../api/ai';

const { Title, Text } = Typography;

const ResumeBuilder: React.FC = () => {
  const [form] = Form.useForm();
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const [coachingJobId, setCoachingJobId] = useState<string | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: analyzeCvApi,
    onSuccess: (data) => {
      message.success('CV Analysis job submitted!');
      setAnalysisJobId(data.jobId);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to submit analysis');
    }
  });

  const coachingMutation = useMutation({
    mutationFn: careerCoachingApi,
    onSuccess: (data) => {
      message.success('Career Coaching job submitted!');
      setCoachingJobId(data.jobId);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to submit coaching request');
    }
  });

  const handleAnalyze = (values: any) => {
    analyzeMutation.mutate({
      resumeId: values.resumeId,
      jobDescription: values.jobDescription,
    });
  };

  const handleCoaching = () => {
    const resumeId = form.getFieldValue('resumeId');
    if (!resumeId) {
      message.error('Please enter a Resume ID first');
      return;
    }
    coachingMutation.mutate({ resumeId });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>AI Career & CV Assistant</Title>
        <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Analyze your CV against job descriptions and get career coaching</div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="1. CV Analysis" bordered>
            <Form form={form} layout="vertical" onFinish={handleAnalyze}>
              <Form.Item 
                name="resumeId" 
                label="Resume ID" 
                rules={[{ required: true, message: 'Please enter Resume ID' }]}
              >
                <Input placeholder="Enter your Resume UUID" prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item 
                name="jobDescription" 
                label="Job Description" 
                rules={[{ required: true, message: 'Please enter Job Description' }]}
              >
                <Input.TextArea rows={4} placeholder="Paste the job description here..." />
              </Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<RobotOutlined />}
                loading={analyzeMutation.isPending}
                block
              >
                Analyze CV
              </Button>
            </Form>

            {analysisJobId && (
              <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                <Text type="success">Analysis Job ID: {analysisJobId}</Text>
                <br/>
                <Text type="secondary" style={{ fontSize: 12 }}>Check your notifications or email for the result.</Text>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="2. Career Coaching Roadmap" bordered>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Text>
                Generate a personalized career progression roadmap based on your current resume.
              </Text>
              <Button 
                onClick={handleCoaching} 
                icon={<CompassOutlined />}
                loading={coachingMutation.isPending}
                block
              >
                Generate Career Roadmap
              </Button>
            </Space>

            {coachingJobId && (
              <div style={{ marginTop: 16, padding: 12, background: '#e6f4ff', border: '1px solid #91caff', borderRadius: 6 }}>
                <Text type="info" style={{ color: '#1677ff' }}>Coaching Job ID: {coachingJobId}</Text>
                <br/>
                <Text type="secondary" style={{ fontSize: 12 }}>Your personalized roadmap is being generated.</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResumeBuilder;
