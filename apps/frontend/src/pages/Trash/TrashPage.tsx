import React, { useState } from 'react';
import { Typography, Tabs, Card, Button, List, Popconfirm, App } from 'antd';
import { UndoOutlined, GlobalOutlined, PictureOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTrashSitesApi, restoreSiteApi, type Site } from '../../api/sites';
import { fetchTrashMediaApi, restoreMediaApi, type MediaFile } from '../../api/media';

const { Title } = Typography;

const TrashPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sites');
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Queries
  const { data: trashSites, isLoading: loadingSites } = useQuery({
    queryKey: ['trash-sites'],
    queryFn: fetchTrashSitesApi,
  });

  const { data: trashMedia, isLoading: loadingMedia } = useQuery({
    queryKey: ['trash-media'],
    queryFn: fetchTrashMediaApi,
  });

  // Mutations
  const restoreSiteMutation = useMutation({
    mutationFn: restoreSiteApi,
    onSuccess: () => {
      message.success('Site restored successfully');
      queryClient.invalidateQueries({ queryKey: ['trash-sites'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
    onError: () => {
      message.error('Failed to restore site');
    },
  });

  const restoreMediaMutation = useMutation({
    mutationFn: restoreMediaApi,
    onSuccess: () => {
      message.success('Media restored successfully');
      queryClient.invalidateQueries({ queryKey: ['trash-media'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: () => {
      message.error('Failed to restore media');
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      <div className="page-header">
        <Title level={2} className="page-title">Trash</Title>
        <div className="page-description">Items here will be permanently deleted after 7 days.</div>
      </div>

      <Card variant="outlined" styles={{ body: { padding: 0 } }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ padding: '0 var(--space-24)' }}
          items={[
            {
              key: 'sites',
              label: (
                <span>
                  <GlobalOutlined /> Sites ({trashSites?.length || 0})
                </span>
              ),
              children: (
                <div style={{ padding: 'var(--space-16) 0' }}>
                  <List
                    loading={loadingSites}
                    dataSource={trashSites || []}
                    locale={{ emptyText: 'No deleted sites' }}
                    renderItem={(site: Site) => (
                      <List.Item
                        actions={[
                          <Popconfirm
                            key="restore"
                            title="Restore this site?"
                            description="It will become available again in your sites list."
                            onConfirm={() => restoreSiteMutation.mutate(site.id)}
                          >
                            <Button type="primary" icon={<UndoOutlined />}>Restore</Button>
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<GlobalOutlined style={{ fontSize: 24, color: 'var(--color-text-secondary)' }} />}
                          title={site.name}
                          description={`${site.subdomain}.genzite.com`}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )
            },
            {
              key: 'media',
              label: (
                <span>
                  <PictureOutlined /> Media ({trashMedia?.length || 0})
                </span>
              ),
              children: (
                <div style={{ padding: 'var(--space-16) 0' }}>
                  <List
                    loading={loadingMedia}
                    dataSource={trashMedia || []}
                    locale={{ emptyText: 'No deleted media' }}
                    renderItem={(media: MediaFile) => (
                      <List.Item
                        actions={[
                          <Popconfirm
                            key="restore"
                            title="Restore this media?"
                            description="It will become available again in your media library."
                            onConfirm={() => restoreMediaMutation.mutate(media.id)}
                          >
                            <Button type="primary" icon={<UndoOutlined />}>Restore</Button>
                          </Popconfirm>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div style={{ width: 48, height: 48, overflow: 'hidden', borderRadius: 4, background: '#1f2937' }}>
                              <img src={media.url} alt={media.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          }
                          title={media.filename}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default TrashPage;
