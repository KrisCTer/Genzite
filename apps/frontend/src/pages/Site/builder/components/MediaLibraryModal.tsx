import React, { useState, useEffect } from 'react';
import { Modal, Upload, Spin, message, Row, Col, Empty, Input, Tabs, Badge } from 'antd';
import { InboxOutlined, SearchOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { Image as ImageIcon, UploadCloud, X, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMediaFilesApi, uploadMediaFileApi, deleteMediaFileApi } from '../../../../api/media';

const { Dragger } = Upload;

export const SAMPLE_ASSETS = [
  { id: 'sample-1', filename: 'Hero Banner Gradient.webp', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', size: 145000, mimeType: 'image/webp' },
  { id: 'sample-2', filename: 'Tech Startup Team.webp', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80', size: 198000, mimeType: 'image/webp' },
  { id: 'sample-3', filename: 'Modern Workspace setup.webp', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80', size: 210000, mimeType: 'image/webp' },
  { id: 'sample-4', filename: 'Genzite Apparel Hoodie.webp', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', size: 120000, mimeType: 'image/webp' },
  { id: 'sample-5', filename: 'Abstract Neon 3D.webp', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80', size: 180000, mimeType: 'image/webp' },
  { id: 'sample-6', filename: 'Avatar Professional 1.webp', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', size: 45000, mimeType: 'image/webp' },
  { id: 'sample-7', filename: 'Avatar Professional 2.webp', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', size: 48000, mimeType: 'image/webp' },
  { id: 'sample-8', filename: 'Minimalist Architecture.webp', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80', size: 175000, mimeType: 'image/webp' },
];

interface MediaLibraryModalProps {
  globalListener?: boolean;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ globalListener = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'samples'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [onSelectCallback, setOnSelectCallback] = useState<((url: string) => void) | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileToDelete, setFileToDelete] = useState<any | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!globalListener) return;

    const handler = (e: any) => {
      const { onSelect } = e.detail || {};
      if (onSelect && typeof onSelect === 'function') {
        setOnSelectCallback(() => onSelect);
      }
      setIsOpen(true);
    };

    window.addEventListener('genzite:open-media-modal', handler);
    return () => window.removeEventListener('genzite:open-media-modal', handler);
  }, [globalListener]);

  const { data: mediaFiles, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: fetchMediaFilesApi,
    retry: 1,
    enabled: isOpen,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadMediaFileApi(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        setUploadProgress(percentCompleted);
      }),
    onSuccess: (uploadedMedia) => {
      message.success('Image uploaded to Media Service (port 3004)');
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['media'] });
      if (onSelectCallback && uploadedMedia?.url) {
        onSelectCallback(uploadedMedia.url);
        setIsOpen(false);
      } else {
        setActiveTab('library');
      }
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Upload to Media Service failed. Using sample fallback.');
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) => deleteMediaFileApi(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setFileToDelete(null);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Không thể xóa ảnh');
    },
  });

  const handleSelectAsset = (url: string) => {
    if (onSelectCallback) {
      onSelectCallback(url);
    }
    setIsOpen(false);
  };

  const customUploadRequest = (options: any) => {
    const { file, onSuccess, onError } = options;
    uploadMutation.mutate(file as File, {
      onSuccess: () => onSuccess('ok'),
      onError: (err) => onError(err),
    });
  };

  const resolveMediaUrl = (urlOrKey?: string, index = 0, file?: any) => {
    const candidate = urlOrKey || file?.url || file?.s3Key;
    if (!candidate) return SAMPLE_ASSETS[index % SAMPLE_ASSETS.length].url;
    if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('blob:') || candidate.startsWith('data:')) {
      return candidate;
    }
    if (candidate.startsWith('/uploads/') || candidate.startsWith('uploads/')) {
      const cleanKey = candidate.replace(/^\//, '');
      const bucket = 'genzite-media-dev';
      return `https://${bucket}.s3.ap-southeast-1.amazonaws.com/${cleanKey}`;
    }
    if (candidate.startsWith('/')) {
      return `http://localhost:3004${candidate}`;
    }
    return candidate;
  };

  const allLibraryFiles = mediaFiles && mediaFiles.length > 0 ? mediaFiles : SAMPLE_ASSETS;
  const filteredFiles = allLibraryFiles.filter(f =>
    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      centered
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
          <ImageIcon size={22} style={{ color: '#06B6D4' }} />
          <span>Genzite Media Asset Manager</span>
        </div>
      }
      width={820}
      footer={null}
      styles={{
        mask: { backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.75)' },
        header: { background: 'transparent', borderBottom: 'none', paddingBottom: 0, marginBottom: 4 },
        content: { 
          background: '#0F172A', 
          border: '1px solid rgba(255,255,255,0.12)', 
          borderRadius: 14, 
          padding: '16px 20px',
          maxHeight: 'calc(100vh - 60px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={k => setActiveTab(k as any)}
        tabBarStyle={{ borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 14 }}
        items={[
          {
            key: 'library',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: activeTab === 'library' ? '#06B6D4' : '#94A3B8', fontWeight: 600 }}>
                <ImageIcon size={15} /> Media Library{' '}
                <Badge count={mediaFiles?.length || SAMPLE_ASSETS.length} style={{ backgroundColor: '#06B6D4', color: '#fff' }} />
              </span>
            ),
            children: (
              <div>
                <div style={{ marginBottom: 12, display: 'flex', gap: 10 }}>
                  <Input
                    prefix={<SearchOutlined style={{ color: '#64748B' }} />}
                    placeholder="Search images by filename..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.12)', color: '#F8FAFC', borderRadius: 6 }}
                  />
                  <button
                    onClick={() => setActiveTab('upload')}
                    style={{ background: '#06B6D4', border: 'none', borderRadius: 6, color: '#fff', padding: '0 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                  >
                    <CloudUploadOutlined /> Upload New
                  </button>
                </div>

                {isLoading ? (
                  <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                    <div style={{ color: '#94A3B8', marginTop: 12, fontSize: 13 }}>Loading media library...</div>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <Empty description={<span style={{ color: '#94A3B8' }}>No assets match your search.</span>} />
                ) : (
                  <div style={{ maxHeight: 'calc(100vh - 250px)', minHeight: 220, overflowY: 'auto', overflowX: 'hidden', paddingLeft: 6, paddingRight: 8 }}>
                    <Row gutter={[12, 12]}>
                      {filteredFiles.map((file: any, idx: number) => {
                        const resolvedUrl = resolveMediaUrl(file.url || file.s3Key, idx, file);
                        return (
                          <Col xs={12} sm={8} md={6} lg={4} key={file.id || idx}>
                            <div
                              onClick={() => handleSelectAsset(resolvedUrl)}
                              style={{
                                background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                                display: 'flex', flexDirection: 'column'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#06B6D4';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,182,212,0.25)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {!file.id?.startsWith('sample-') && file.id && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFileToDelete(file);
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: 6,
                                    right: 6,
                                    zIndex: 10,
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    background: 'rgba(15, 23, 42, 0.85)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#F87171',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    padding: 0,
                                    backdropFilter: 'blur(4px)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#EF4444';
                                    e.currentTarget.style.color = '#FFFFFF';
                                    e.currentTarget.style.borderColor = '#EF4444';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.85)';
                                    e.currentTarget.style.color = '#F87171';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                  title="Xóa ảnh này"
                                >
                                  <X size={13} />
                                </button>
                              )}
                              <div style={{ height: 105, background: '#0B0F19', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <img
                                  src={resolvedUrl}
                                  alt={file.filename}
                                  onError={(e) => {
                                    const fallbackUrl = SAMPLE_ASSETS[idx % SAMPLE_ASSETS.length].url;
                                    if (e.currentTarget.src !== fallbackUrl) {
                                      e.currentTarget.src = fallbackUrl;
                                    }
                                  }}
                                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.filename}>
                                  {file.filename}
                                </div>
                                <div style={{ fontSize: 9, color: '#64748B', marginTop: 2 }}>
                                  {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Image'} • {file.mimeType?.split('/')[1]?.toUpperCase() || 'WEBP'}
                                </div>
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'upload',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: activeTab === 'upload' ? '#06B6D4' : '#94A3B8', fontWeight: 600 }}>
                <UploadCloud size={15} /> Upload New Media
              </span>
            ),
            children: (
              <div style={{ padding: '20px 0' }}>
                <Dragger
                  customRequest={customUploadRequest}
                  showUploadList={false}
                  accept="image/*"
                  style={{ background: '#1E293B', border: '2px dashed rgba(6,182,212,0.4)', borderRadius: 12, padding: 30 }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{ color: '#06B6D4', fontSize: 44 }} />
                  </p>
                  <p className="ant-upload-text" style={{ color: '#F8FAFC', fontSize: 15, fontWeight: 600 }}>
                    Click or drag image file here to upload
                  </p>
                  <p className="ant-upload-hint" style={{ color: '#94A3B8', fontSize: 12 }}>
                    Automatically converted to optimized WebP format.
                  </p>
                </Dragger>
                {uploadMutation.isPending && (
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Spin />
                    <div style={{ color: '#06B6D4', marginTop: 8 }}>Uploading media file... {uploadProgress}%</div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
      <Modal
        open={!!fileToDelete}
        onCancel={() => setFileToDelete(null)}
        footer={null}
        closable={false}
        width={440}
        zIndex={1100}
        centered
        styles={{
          content: {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)), rgba(19, 21, 29, 0.96)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 20,
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(239, 68, 68, 0.12)',
            backdropFilter: 'blur(24px) saturate(140%)',
          },
          mask: {
            backdropFilter: 'blur(6px)',
            background: 'rgba(0, 0, 0, 0.65)',
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444',
            flexShrink: 0
          }}>
            <Trash2 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'var(--font-sans)' }}>Xóa ảnh tải lên</h3>
            <p style={{ fontSize: 12.5, color: '#94A3B8', margin: '4px 0 0 0', fontFamily: 'var(--font-sans)' }}>Xác nhận xóa ảnh này khỏi hệ thống</p>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.025)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          padding: '16px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1' }}>
              <span style={{ color: '#06B6D4' }}>✦</span>
              <span>Tên file ảnh:</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileToDelete?.filename || 'Media Asset'}</span>
          </div>

          <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn xóa &quot;{fileToDelete?.filename}&quot;? Tất cả dữ liệu ảnh trên Media Service sẽ bị xóa vĩnh viễn.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={() => setFileToDelete(null)}
            style={{
              padding: '9px 18px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              color: '#CBD5E1',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              if (fileToDelete?.id) {
                deleteMutation.mutate(fileToDelete.id);
              }
            }}
            style={{
              padding: '9px 20px',
              background: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.8)',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Xóa ảnh
          </button>
        </div>
      </Modal>
    </Modal>
  );
};
