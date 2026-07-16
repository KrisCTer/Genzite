import React, { useState } from 'react';
import { Button, Card, Typography, Space, Modal, Form, Input, Popconfirm, Row, Col, App, Tag, Tooltip } from 'antd';
import { 
  PlusOutlined, GlobalOutlined, DeleteOutlined, BarChartOutlined, 
  RocketOutlined, MobileOutlined, ApiOutlined, CopyOutlined, CheckCircleOutlined, InfoCircleOutlined,
  ThunderboltOutlined, ExportOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSitesApi, createSiteApi, deleteSiteApi, updateSiteApi, type Site } from '../../api/sites';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title } = Typography;

const getPublicSiteUrl = (subdomain: string) => {
  const hostname = window.location.hostname;
  if (hostname.includes('codespheree.id.vn')) return `https://${subdomain}.codespheree.id.vn`;
  if (hostname.includes('genzite.studio')) return `https://${subdomain}.genzite.studio`;
  if (hostname.includes('localhost')) return `http://${subdomain}.localhost:${window.location.port || '5173'}`;
  return `https://${subdomain}.codespheree.id.vn`;
};

const parseDescription = (rawDesc?: string | null) => {
  if (!rawDesc) return { platform: 'WEB', customInstructions: undefined, cleanText: 'No specific description provided.' };
  
  let platform = 'WEB';
  const platformMatch = rawDesc.match(/\[PLATFORM:([A-Z]+)\]/i);
  if (platformMatch) {
    platform = platformMatch[1].toUpperCase();
  }

  let customInstructions: string | undefined = undefined;
  const customMatch = rawDesc.match(/\[CUSTOM_INSTRUCTIONS:([^\]]+)\]/i);
  if (customMatch) {
    customInstructions = customMatch[1].trim();
  }

  let cleanText = rawDesc
    .replace(/\[PLATFORM:[A-Z]+\]/gi, '')
    .replace(/\[CUSTOM_INSTRUCTIONS:[^\]]+\]/gi, '')
    .trim();

  if (!cleanText) cleanText = 'No specific description provided.';

  return { platform, customInstructions, cleanText };
};

const SitesList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/workspace') || location.pathname.includes('/workspace/');
  const { message } = App.useApp();


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
      {!isWorkspace && (
        <div className="page-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button type="primary" icon={<PlusOutlined />} size="large" style={{ fontWeight: 500 }} onClick={() => handleOpenModal()}>
            Create Site
          </Button>
        </div>
      )}


      {isError && (
        <div style={{ padding: 'var(--space-16)', color: 'var(--color-error)', textAlign: 'center', background: 'var(--color-error-bg)', borderRadius: 'var(--radius-sm)' }}>
          Failed to load sites. Make sure Site Service is running.
        </div>
      )}

      <Row gutter={[24, 24]}>
        {(sites || []).map((site: Site) => {
          const { platform, customInstructions, cleanText } = parseDescription(site.description);
          const publicUrl = getPublicSiteUrl(site.subdomain);
          const cleanDomain = publicUrl.replace(/^https?:\/\//, '');

          return (
            <Col xs={24} sm={12} lg={8} key={site.id}>
              <Card 
                hoverable
                variant="outlined"
                styles={{ body: { padding: 24, display: 'flex', flexDirection: 'column', height: '100%' } }}
                style={{
                  borderRadius: 16,
                  borderColor: 'var(--color-border)',
                  background: 'linear-gradient(145deg, rgba(20, 30, 48, 0.6) 0%, rgba(10, 15, 28, 0.8) 100%)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Top Badge Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Space size={8}>
                    <Tag 
                      color={platform === 'APP' ? 'purple' : platform === 'API' ? 'blue' : 'cyan'} 
                      style={{ 
                        margin: 0, padding: '2px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11,
                        display: 'flex', alignItems: 'center', gap: 4, letterSpacing: 0.5
                      }}
                    >
                      {platform === 'APP' ? <MobileOutlined /> : platform === 'API' ? <ApiOutlined /> : <GlobalOutlined />}
                      {platform}
                    </Tag>
                    {customInstructions && (
                      <Tag icon={<ThunderboltOutlined />} color="gold" style={{ margin: 0, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        Custom Rules
                      </Tag>
                    )}
                  </Space>
                  {site.isPublished ? (
                    <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0, borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                      ONLINE (PUBLIC)
                    </Tag>
                  ) : (
                    <Tag color="default" icon={<InfoCircleOutlined />} style={{ margin: 0, borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                      DRAFT (PRIVATE)
                    </Tag>
                  )}
                </div>

                {/* Title & Domain Row */}
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)',
                    letterSpacing: '-0.3px'
                  }}>
                    {site.name}
                  </h3>
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(0, 180, 216, 0.08)', padding: '4px 10px', borderRadius: 6,
                    border: '1px solid rgba(0, 180, 216, 0.2)', maxWidth: '100%'
                  }}>
                    <a 
                      href={publicUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-info)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {cleanDomain}
                      <ExportOutlined style={{ fontSize: 11 }} />
                    </a>
                    <Tooltip title="Copy Live Preview URL">
                      <CopyOutlined 
                        style={{ cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: 12, marginLeft: 2 }} 
                        onClick={() => {
                          navigator.clipboard.writeText(publicUrl);
                          message.success('URL copied to clipboard!');
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>

                {/* Clean Description */}
                {cleanText && cleanText !== 'No specific description provided.' && (
                  <p style={{ 
                    margin: '0 0 20px 0', color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    flexGrow: 1
                  }}>
                    {cleanText}
                  </p>
                )}

                {/* Custom Perfectly Aligned Footer */}
                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 14 }}>
                  {/* Row 1: Created date and Delete button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                      Created {new Date(site.createdAt).toLocaleDateString()}
                    </span>
                    <Popconfirm
                      title="Delete the project"
                      description="Are you sure you want to permanently remove this site and its data?"
                      onConfirm={() => deleteMutation.mutate(site.id)}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        size="small"
                        style={{ fontWeight: 500 }}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>

                  {/* Row 2: Prominent Action Buttons side-by-side with equal 50-50 width and clean spacing */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Tooltip title={site.isPublished ? 'View live health probes & observability metrics' : 'Must publish project to view observability & health probes'}>
                      <Button 
                        type="default" 
                        icon={<BarChartOutlined />} 
                        disabled={!site.isPublished}
                        onClick={() => navigate(`/workspace/observability/${site.id}`)}
                        style={{ 
                          width: '100%', 
                          borderRadius: 8, 
                          fontWeight: 500, 
                          fontSize: 13, 
                          height: 38,
                          background: site.isPublished ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                          borderColor: 'rgba(255,255,255,0.12)',
                          color: site.isPublished ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)'
                        }}
                      >
                        Observability
                      </Button>
                    </Tooltip>
                    <Button 
                      type="primary" 
                      icon={<RocketOutlined />} 
                      onClick={() => navigate(`/project/${site.id}`)}
                      style={{ 
                        width: '100%', 
                        borderRadius: 8, 
                        fontWeight: 600, 
                        fontSize: 13, 
                        height: 38,
                        background: 'linear-gradient(90deg, #00B4D8 0%, #0077B6 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 180, 216, 0.3)'
                      }}
                    >
                      Open Canvas
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
        {sites?.length === 0 && !isLoading && (
          <Col span={24}>
            <div style={{ textAlign: 'center', padding: 'var(--space-48)', background: 'var(--color-background)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-disabled)' }}>
              <GlobalOutlined style={{ fontSize: 48, color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-16)' }} />
              <Title level={4} style={{ color: 'var(--color-text-secondary)', margin: 0 }}>No sites found</Title>
              <p style={{ color: 'var(--color-text-tertiary)', margin: '8px 0 24px 0' }}>Get started by creating your first website.</p>
              {!isWorkspace ? (
                <Button type="primary" onClick={() => handleOpenModal()}>Create Site</Button>
              ) : (
                <Button type="primary" onClick={() => navigate('/project')}>Open AI Canvas</Button>
              )}

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
