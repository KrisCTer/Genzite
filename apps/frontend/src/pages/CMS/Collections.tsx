import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined, RightOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCollectionsApi, createCollectionApi, deleteCollectionApi, type Collection } from '../../api/cms';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TextArea } = Input;

const defaultSchema = JSON.stringify({
  title: "string",
  content: "text",
  isPublished: "boolean"
}, null, 2);

const Collections: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: collections, isLoading, isError } = useQuery({
    queryKey: ['cms-collections'],
    queryFn: fetchCollectionsApi,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: createCollectionApi,
    onSuccess: () => {
      message.success('Collection created successfully');
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['cms-collections'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create collection');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollectionApi,
    onSuccess: () => {
      message.success('Collection deleted');
      queryClient.invalidateQueries({ queryKey: ['cms-collections'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete collection');
    },
  });

  const handleCreate = (values: any) => {
    try {
      const schemaObj = JSON.parse(values.schema);
      createMutation.mutate({
        name: values.name,
        slug: values.slug,
        schema: schemaObj,
      });
    } catch (e) {
      message.error('Invalid JSON Schema format');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, _record: Collection) => (
        <Space>
          <DatabaseOutlined style={{ color: '#1677ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Fields Count',
      key: 'fieldsCount',
      render: (_: any, record: Collection) => (
        <span>{Object.keys(record.schema || {}).length} fields</span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Collection) => (
        <Space size="middle">
          <Button 
            type="primary" 
            ghost 
            size="small" 
            icon={<RightOutlined />} 
            onClick={() => navigate(`/admin/cms/${record.id}`)}
          >
            View Data
          </Button>
          <Button icon={<EditOutlined />} type="text" />
          <Button 
            icon={<DeleteOutlined />} 
            type="text" 
            danger 
            onClick={() => deleteMutation.mutate(record.id)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>CMS Collections</Title>
          <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Manage your dynamic database schemas (Headless CMS)</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" style={{ fontWeight: 500 }} onClick={() => setIsModalOpen(true)}>
          Create Collection
        </Button>
      </div>

      <Card 
        bordered
        styles={{ body: { padding: 0 } }}
      >
        {isError && (
          <div style={{ padding: 16, color: '#EF4444', textAlign: 'center', background: '#FEF2F2' }}>
            Failed to load collections. Make sure Data Service is running.
          </div>
        )}
        <Table
          columns={columns}
          dataSource={collections || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10, style: { padding: '16px 24px', margin: 0 } }}
        />
      </Card>

      <Modal
        title="Create New Collection"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item 
            name="name" 
            label="Collection Name" 
            rules={[{ required: true, message: 'Please enter collection name' }]}
          >
            <Input placeholder="e.g. Blog Posts" />
          </Form.Item>
          <Form.Item 
            name="slug" 
            label="Collection Slug" 
            rules={[{ required: true, message: 'Please enter collection slug' }]}
          >
            <Input placeholder="e.g. blog-posts" />
          </Form.Item>
          <Form.Item 
            name="schema" 
            label="JSON Schema Definition" 
            rules={[{ required: true, message: 'Please enter JSON schema' }]}
            initialValue={defaultSchema}
          >
            <TextArea rows={6} style={{ fontFamily: 'monospace' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Collections;
