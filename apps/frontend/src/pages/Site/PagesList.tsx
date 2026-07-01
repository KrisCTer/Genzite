import React, { useState } from 'react';
import { Row, Col, Button, Card, Typography, Space, Modal, Form, Input, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, FileTextOutlined, ArrowLeftOutlined, EditOutlined, DeleteOutlined, LayoutOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPagesApi, createPageApi, updatePageApi, deletePageApi, type Page } from '../../api/sites';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

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

      {isError && (
        <div style={{ padding: 16, color: '#EF4444', textAlign: 'center', background: '#FEF2F2', borderRadius: 8 }}>
          Failed to load pages. Make sure Site Service is running.
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {(pages || []).sort((a, b) => a.sortOrder - b.sortOrder).map((page) => (
            <Col xs={24} sm={12} md={8} lg={6} key={page.id}>
              <Card
                hoverable
                variant="outlined"
                onClick={() => navigate(`/admin/site/pages/${page.id}/builder`)}
                styles={{ body: { padding: 0 } }}
                style={{ overflow: 'hidden', borderRadius: 12, display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' }}
              >
                <div style={{ height: 160, background: 'var(--gz-dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--color-border-subtle)', transition: 'background 0.3s ease' }} className="page-card-cover">
                  <LayoutOutlined style={{ fontSize: 48, color: 'var(--color-accent)', opacity: 0.5 }} />
                </div>
                <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <Title level={5} style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center' }}>
                      <FileTextOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                      {page.title}
                    </Title>
                    <Text style={{ color: 'var(--color-text-secondary)' }}>/{page.slug}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }} onClick={(e) => e.stopPropagation()}>
                    <Text style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Created: {new Date(page.createdAt).toLocaleDateString()}</Text>
                    <Space size="small">
                      <Button icon={<EditOutlined />} type="text" onClick={(e) => { e.stopPropagation(); handleOpenModal(page); }} />
                      <Popconfirm
                        title="Delete page"
                        description="Are you sure to delete this page?"
                        onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(page.id); }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button icon={<DeleteOutlined />} type="text" danger onClick={(e) => e.stopPropagation()} />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

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
