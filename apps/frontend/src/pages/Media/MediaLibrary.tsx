import React, { useState } from 'react';
import { Card, Button, Typography, Modal, Upload, Progress, message, Row, Col, Empty, Spin } from 'antd';
import { UploadOutlined, InboxOutlined, FileOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMediaFilesApi, uploadMediaFileApi, type MediaFile } from '../../api/media';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const MediaLibrary: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const { data: mediaFiles, isLoading, isError } = useQuery({
    queryKey: ['media'],
    queryFn: fetchMediaFilesApi,
    retry: 1, // Only retry once since backend might not exist yet
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => 
      uploadMediaFileApi(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        setUploadProgress(percentCompleted);
      }),
    onSuccess: () => {
      message.success('File uploaded successfully');
      setIsModalOpen(false);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to upload file');
      setUploadProgress(0);
    },
  });

  const customUploadRequest = (options: any) => {
    const { file, onSuccess, onError } = options;
    uploadMutation.mutate(file as File, {
      onSuccess: () => {
        onSuccess('ok');
      },
      onError: (err) => {
        onError(err);
      }
    });
  };

  const renderMediaGrid = () => {
    if (isLoading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    if (isError || !mediaFiles || mediaFiles.length === 0) {
      return (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description={<span>No media files found. Upload some files to get started!</span>} 
        />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {mediaFiles.map((file: MediaFile) => (
          <Col xs={12} sm={8} md={6} lg={4} key={file.id}>
            <Card
              hoverable
              styles={{ body: { padding: '8px', textAlign: 'center' } }}
              cover={
                file.mimeType.startsWith('image/') ? (
                  <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f5f5f5' }}>
                    <img alt={file.filename} src={file.url} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                ) : (
                  <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                    <FileOutlined style={{ fontSize: '48px', color: '#bfbfbf' }} />
                  </div>
                )
              }
            >
              <div style={{ padding: '12px 16px', textAlign: 'left', borderTop: '1px solid #F1F5F9' }}>
                <Text ellipsis style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 4 }} title={file.filename}>
                  {file.filename}
                </Text>
                <Text type="secondary" style={{ fontSize: 13, color: '#6B7280' }}>
                  {(file.size / 1024).toFixed(2)} KB • {file.mimeType.split('/')[1]?.toUpperCase()}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>Media Library</Title>
          <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Manage all your uploaded images and files in AWS S3</div>
        </div>
        <Button type="primary" icon={<UploadOutlined />} size="large" style={{ fontWeight: 500 }} onClick={() => setIsModalOpen(true)}>
          Upload Media
        </Button>
      </div>

      <Card 
        bordered
        styles={{ body: { padding: 24 } }}
      >
        {renderMediaGrid()}
      </Card>

      <Modal
        title="Upload Media Files"
        open={isModalOpen}
        onCancel={() => !uploadMutation.isPending && setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Dragger 
          name="file" 
          multiple={false} 
          customRequest={customUploadRequest}
          showUploadList={false}
          disabled={uploadMutation.isPending}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single image or document upload.
          </p>
        </Dragger>

        {uploadMutation.isPending && (
          <div style={{ marginTop: '20px' }}>
            <Text>Uploading...</Text>
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MediaLibrary;
