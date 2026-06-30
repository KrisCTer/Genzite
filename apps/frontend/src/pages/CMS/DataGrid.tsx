import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRecordsApi, createRecordApi, deleteRecordApi, type RecordData, fetchCollectionsApi } from '../../api/cms';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const DataGrid: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch Collections to get Schema
  const { data: collections } = useQuery({
    queryKey: ['cms-collections'],
    queryFn: fetchCollectionsApi,
  });

  const activeCollection = collections?.find(c => c.id === collectionId);
  const schema = activeCollection?.schema || {};

  // Fetch Records
  const { data: records, isLoading, isError } = useQuery({
    queryKey: ['cms-records', collectionId],
    queryFn: () => fetchRecordsApi(collectionId!),
    enabled: !!collectionId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createRecordApi(collectionId!, { data }),
    onSuccess: () => {
      message.success('Record created successfully');
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['cms-records', collectionId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create record');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (recordId: string) => deleteRecordApi(collectionId!, recordId),
    onSuccess: () => {
      message.success('Record deleted');
      queryClient.invalidateQueries({ queryKey: ['cms-records', collectionId] });
    },
  });

  const handleCreate = (values: any) => {
    createMutation.mutate(values);
  };

  // Generate dynamic columns from schema
  const columns: any[] = Object.keys(schema).slice(0, 5).map(key => ({
    title: key.charAt(0).toUpperCase() + key.slice(1),
    dataIndex: ['data', key],
    key,
    render: (text: any) => {
      if (typeof text === 'object') return JSON.stringify(text);
      if (typeof text === 'boolean') return text ? 'Yes' : 'No';
      return <Text ellipsis style={{ maxWidth: 200 }}>{String(text || '')}</Text>;
    }
  }));

  columns.push({
    title: 'Action',
    dataIndex: 'action',
    key: 'action',
    render: (_: any, record: RecordData) => (
      <Space size="middle">
        <Button icon={<EditOutlined />} type="text" />
        <Button 
          icon={<DeleteOutlined />} 
          type="text" 
          danger 
          onClick={() => deleteMutation.mutate(record.id)} 
        />
      </Space>
    ),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate('/admin/cms')} />
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>
              {activeCollection ? activeCollection.name : 'Data Grid'}
            </Title>
            <div style={{ color: '#6B7280', fontSize: 16, marginTop: 4 }}>Manage records for this collection</div>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} size="large" style={{ fontWeight: 500 }} onClick={() => setIsModalOpen(true)}>
          New Record
        </Button>
      </div>

      <Card 
        bordered
        styles={{ body: { padding: 0 } }}
      >
        {isError && (
          <div style={{ padding: 16, color: '#EF4444', textAlign: 'center', background: '#FEF2F2' }}>
            Failed to load records. Make sure Data Service is running.
          </div>
        )}
        <Table
          columns={columns}
          dataSource={records || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10, style: { padding: '16px 24px', margin: 0 } }}
        />
      </Card>

      <Modal
        title="Create New Record"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          {Object.entries(schema).map(([key, type]) => (
            <Form.Item 
              key={key} 
              name={key} 
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              rules={[{ required: true }]}
            >
              {type === 'text' ? <Input.TextArea /> : <Input />}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default DataGrid;
