import React, { useState } from 'react';
import { Typography, Card, Button, List, Popconfirm, App, Space } from 'antd';
import { DeleteOutlined, UndoOutlined, GlobalOutlined, PictureOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTrashSitesApi, restoreSiteApi, type Site } from '../../api/sites';
import { fetchTrashMediaApi, restoreMediaApi, type MediaFile } from '../../api/media';
import './TrashPage.css';

const { Title, Text } = Typography;

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


      <Card variant="outlined" styles={{ body: { padding: 0 } }}>
        <div className="trash-tabs-container">
          <button 
            className={`trash-tab ${activeTab === 'sites' ? 'active' : ''}`}
            onClick={() => setActiveTab('sites')}
          >
            <GlobalOutlined /> Sites ({trashSites?.length || 0})
          </button>
          <button 
            className={`trash-tab ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => setActiveTab('media')}
          >
            <PictureOutlined /> Media ({trashMedia?.length || 0})
          </button>
        </div>

        <div style={{ padding: '0 24px 24px 24px' }}>
          {activeTab === 'sites' && (
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
          )}

          {activeTab === 'media' && (
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
          )}
        </div>
      </Card>
    </div>
  );
};

export default TrashPage;
