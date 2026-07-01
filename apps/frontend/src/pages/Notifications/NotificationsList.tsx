import React from 'react';
import { Card, Typography, List, Button, Space, Badge, message } from 'antd';
import { BellOutlined, CheckOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationsApi, markNotificationAsReadApi, markAllNotificationsAsReadApi, type AppNotification } from '../../api/notifications';

const { Title, Text } = Typography;

const NotificationsList: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotificationsApi,
    retry: 1,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsReadApi,
    onSuccess: () => {
      message.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>Notification Center</Title>
          <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>View all your system alerts and messages</div>
        </div>
        <Button 
          icon={<CheckSquareOutlined />} 
          size="large"
          style={{ fontWeight: 500 }}
          onClick={() => markAllReadMutation.mutate()}
          loading={markAllReadMutation.isPending}
        >
          Mark All as Read
        </Button>
      </div>

      <Card 
        bordered
        styles={{ body: { padding: 0 } }}
      >
        {isError && (
          <div style={{ padding: 16, color: '#EF4444', textAlign: 'center', background: '#FEF2F2' }}>
            Failed to load notifications. Make sure Notification Service is running.
          </div>
        )}
        <List
          loading={isLoading}
          itemLayout="horizontal"
          dataSource={notifications || []}
          renderItem={(item: AppNotification) => (
            <List.Item
              style={{ 
                padding: '24px', 
                borderBottom: '1px solid #E5E7EB',
                background: item.isRead ? '#FFFFFF' : '#F9FAFB',
              }}
              actions={[
                <Space>
                  <Text type="secondary" style={{ fontSize: 14, color: '#9CA3AF' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                  {!item.isRead && (
                    <Button 
                      type="link" 
                      icon={<CheckOutlined />} 
                      onClick={() => markReadMutation.mutate(item.id)}
                      style={{ color: '#2563EB' }}
                    >
                      Mark Read
                    </Button>
                  )}
                </Space>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={!item.isRead} offset={[-4, 4]} color="#2563EB">
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 12, 
                      background: item.isRead ? '#F3F4F6' : '#EFF6FF', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: item.isRead ? '#9CA3AF' : '#2563EB'
                    }}>
                      <BellOutlined style={{ fontSize: 20 }} />
                    </div>
                  </Badge>
                }
                title={<span style={{ fontWeight: item.isRead ? 500 : 600, color: '#111827', fontSize: 16 }}>{item.title}</span>}
                description={<span style={{ color: '#4B5563', fontSize: 14, marginTop: 4, display: 'block' }}>{item.content}</span>}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'You have no notifications' }}
        />
      </Card>
    </div>
  );
};

export default NotificationsList;
