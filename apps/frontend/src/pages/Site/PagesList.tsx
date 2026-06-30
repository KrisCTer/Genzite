import React, { useState } from 'react';
import { Table, Button, Card, Typography, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, FileTextOutlined, ArrowLeftOutlined, EditOutlined, BuildOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPagesApi, createPageApi, updatePageApi, deletePageApi, type Page } from '../../api/sites';
import { useParams, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const PagesList: React.FC = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: pages, isLoading, isError } = useQuery({
    queryKey: ['site-pages', siteId],
    queryFn: () => fetchPagesApi(siteId!),
    enabled: !!siteId,
    retry: 1,
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPage(null);
    form.resetFields();
  };

  const createMutation = useMutation({
    mutationFn: (values: any) => createPageApi(siteId!, values),
    onSuccess: () => {
      message.success('Page created successfully');
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['site-pages', siteId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create page');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => updatePageApi(editingPage!.id, values),
    onSuccess: () => {
      message.success('Page updated successfully');
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['site-pages', siteId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update page');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePageApi,
    onSuccess: () => {
      message.success('Page deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['site-pages', siteId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete page');
    },
  });

  const handleOpenModal = (page?: Page) => {
    if (page) {
      setEditingPage(page);
      form.setFieldsValue({
        title: page.title,
        slug: page.slug,
        sortOrder: page.sortOrder,
      });
    } else {
      setEditingPage(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Page Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1677ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Slug (Path)',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => `/${slug}`,
    },
    {
      title: 'Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Page) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<BuildOutlined />} 
            onClick={() => navigate(`/admin/site/pages/${record.id}/builder`)}
          >
            Page Builder
          </Button>
          <Button icon={<EditOutlined />} type="text" onClick={() => handleOpenModal(record)} />
          <Popconfirm
            title="Delete page"
            description="Are you sure to delete this page?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space size="middle">
          <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate('/admin/site')} />
          <div>
            <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>Site Pages</Title>
            <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Manage all sub-pages for this website</div>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} size="large" style={{ fontWeight: 500 }} onClick={() => handleOpenModal()}>
          Create Page
        </Button>
      </div>

      <Card 
        bordered
        styles={{ body: { padding: 0 } }}
      >
        {isError && (
          <div style={{ padding: 16, color: '#EF4444', textAlign: 'center', background: '#FEF2F2' }}>
            Failed to load pages. Make sure Site Service is running.
          </div>
        )}
        <Table
          columns={columns}
          dataSource={pages || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10, style: { padding: '16px 24px', margin: 0 } }}
        />
      </Card>

      <Modal
        title={editingPage ? "Edit Page" : "Create New Page"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={(values) => editingPage ? updateMutation.mutate(values) : createMutation.mutate(values)}
        >
          <Form.Item 
            name="title" 
            label="Page Title" 
            rules={[{ required: true, message: 'Please enter page title' }]}
          >
            <Input placeholder="e.g. About Us" />
          </Form.Item>
          <Form.Item 
            name="slug" 
            label="Page Slug" 
            rules={[{ required: true, message: 'Please enter page slug' }]}
          >
            <Input placeholder="e.g. about-us" addonBefore="/" />
          </Form.Item>
          {editingPage && (
            <Form.Item 
              name="sortOrder" 
              label="Sort Order" 
            >
              <Input type="number" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default PagesList;
