import React, { useState } from 'react';
import { Button, Card, Typography, Space, Modal, Form, Input, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, GlobalOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSitesApi, createSiteApi, deleteSiteApi, updateSiteApi, type Site } from '../../api/sites';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const SitesList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: sites, isLoading, isError } = useQuery({
    queryKey: ['sites'],
    queryFn: fetchSitesApi,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: createSiteApi,
    onSuccess: () => {
      message.success('Site created successfully');
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create site');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => updateSiteApi(editingSite!.id, values),
    onSuccess: () => {
      message.success('Site updated successfully');
      handleCloseModal();
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update site');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSiteApi,
    onSuccess: () => {
      message.success('Site deleted');
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to delete site');
    },
  });

  const handleOpenModal = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      form.setFieldsValue({
        name: site.name,
        subdomain: site.subdomain,
        description: site.description,
      });
    } else {
      setEditingSite(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSite(null);
    form.resetFields();
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} className="page-title">Sites Management</Title>
          <div className="page-description">Manage your websites and domains</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" style={{ fontWeight: 500 }} onClick={() => handleOpenModal()}>
          Create Site
        </Button>
      </div>

      {isError && (
        <div style={{ padding: 'var(--space-16)', color: 'var(--color-error)', textAlign: 'center', background: 'var(--color-error-bg)', borderRadius: 'var(--radius-sm)' }}>
          Failed to load sites. Make sure Site Service is running.
        </div>
      )}

      <Row gutter={[24, 24]}>
        {(sites || []).map((site: Site) => (
          <Col xs={24} sm={12} lg={8} key={site.id}>
            <Card 
              hoverable
              bordered
              styles={{ body: { padding: 24 } }}
              actions={[
                <Button type="link" icon={<SettingOutlined />} onClick={() => handleOpenModal(site)}>Edit</Button>,
                <Popconfirm
                  title="Delete the site"
                  description="Are you sure to delete this site?"
                  onConfirm={() => deleteMutation.mutate(site.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
                </Popconfirm>
              ]}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-16)' }}>
                <Space align="start">
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--color-info-bg)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-info)'
                  }}>
                    <GlobalOutlined style={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>{site.name}</h4>
                    <a href={`https://${site.subdomain}.genzite.com`} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                      {site.subdomain}.genzite.com
                    </a>
                  </div>
                </Space>
              </div>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 14, minHeight: 44, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {site.description || 'No description provided.'}
              </p>
              <div style={{ marginTop: 'var(--space-24)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Created {new Date(site.createdAt).toLocaleDateString()}</span>
                <Button 
                  type="primary" 
                  ghost 
                  size="small" 
                  onClick={() => navigate(`/admin/site/${site.id}/pages`)}
                >
                  Manage Pages
                </Button>
              </div>
            </Card>
          </Col>
        ))}
        {sites?.length === 0 && !isLoading && (
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: 'var(--space-48)', background: 'var(--color-background)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-disabled)' }}>
              <GlobalOutlined style={{ fontSize: 48, color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-16)' }} />
              <Title level={4} style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No sites found</Title>
              <p style={{ color: 'var(--color-text-tertiary)', margin: '8px 0 24px 0' }}>Get started by creating your first website.</p>
              <Button type="primary" onClick={() => handleOpenModal()}>Create Site</Button>
            </div>
          </Col>
        )}
      </Row>

      <Modal
        title={editingSite ? "Edit Site" : "Create New Site"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={(values) => editingSite ? updateMutation.mutate(values) : createMutation.mutate(values)}
        >
          <Form.Item 
            name="name" 
            label="Site Name" 
            rules={[{ required: true, message: 'Please enter site name' }]}
          >
            <Input placeholder="e.g. My Portfolio" />
          </Form.Item>
          <Form.Item 
            name="subdomain" 
            label="Subdomain" 
            rules={[{ required: true, message: 'Please enter subdomain' }]}
          >
            <Input placeholder="e.g. my-portfolio" addonAfter=".genzite.com" />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description" 
          >
            <Input.TextArea placeholder="A short description of this site" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SitesList;
