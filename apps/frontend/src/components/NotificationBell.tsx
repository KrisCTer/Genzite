import React, { useState } from 'react';
import { Badge, Popover, Button, List, Spin } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';

import { Sparkles, Info, Shield, DollarSign, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationsApi, markNotificationAsReadApi, markAllNotificationsAsReadApi } from '../api/notifications';
import { useAuthStore } from '../store/auth';
import { resolveUserRoles } from '../utils/jwt';
import { getNotificationsPath } from '../utils/userNav';

const getNotificationIcon = (metadata?: { event?: string }) => {
  const event = metadata?.event;
  switch (event) {
    case 'user.registered':
      return <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0"><Info size={14} /></span>;
    case 'site.generated':
    case 'site.created':
      return <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0"><Sparkles size={14} /></span>;
    case 'cms.generated':
      return <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0"><DatabaseOutlined style={{ fontSize: 14 }} /></span>;
    case 'security.alert':
    case 'auth.failed':
      return <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0"><Shield size={14} /></span>;
    case 'commerce.payment':
    case 'payment.succeeded':
      return <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center shrink-0"><DollarSign size={14} /></span>;
    default:
      return <span className="p-2 rounded-lg bg-zinc-700/30 text-zinc-400 border border-zinc-700/55 flex items-center justify-center shrink-0"><Bell size={14} /></span>;
  }
};

const NotificationBell: React.FC = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const effectiveRoles = resolveUserRoles(user?.roles, token);
  const notificationsPath = getNotificationsPath(effectiveRoles);

  const queryClient = useQueryClient();
  const { data: notifications, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotificationsApi(),
    retry: 1,
  });

  const displayNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = displayNotifications.filter(n => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notificationContent = (
    <div style={{ width: 340, padding: '4px' }} className="gz-notif-popover">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--gz-border, rgba(255,255,255,0.08))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: '#fff', fontSize: '15px' }}>Notifications</strong>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: 'var(--color-accent, #3b82f6)' }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <Button
              type="text"
              size="small"
              onClick={() => markAllReadMutation.mutate()}
              style={{ fontSize: '11px', color: 'var(--gz-text-secondary, #a1a1aa)', padding: '0 4px' }}
            >
              Mark all as read
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => { setNotifOpen(false); navigate(notificationsPath); }}
            style={{ fontSize: '11px', padding: 0, fontWeight: 'bold' }}
          >
            View all
          </Button>
        </div>
      </div>
      {notifLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><Spin size="small" /></div>
      ) : !displayNotifications || displayNotifications.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gz-text-muted, #71717a)' }}>
          <Bell size={24} style={{ marginBottom: '8px', opacity: 0.5, display: 'inline-block' }} />
          <div>No new notifications</div>
        </div>
      ) : (
        <div style={{ maxHeight: '320px', overflowY: 'auto' }} className="gz-scrollbar">
          <List
            itemLayout="horizontal"
            dataSource={displayNotifications.slice(0, 5)}
            renderItem={(item) => (
              <div
                style={{
                  background: item.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  padding: '10px 8px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                  border: item.isRead ? '1px solid transparent' : '1px solid rgba(59, 130, 246, 0.15)'
                }}
                className="hover:bg-zinc-800/40"
                onClick={() => {
                  if (!item.isRead) markReadMutation.mutate(item.id);
                  setNotifOpen(false);
                  navigate(notificationsPath);
                }}
              >
                {getNotificationIcon(item.metadata)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: item.isRead ? 500 : 700, color: item.isRead ? 'var(--gz-text-secondary, #d4d4d8)' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--gz-text-muted, #71717a)', whiteSpace: 'nowrap' }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gz-text-muted, #a1a1aa)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.body}
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );

  return (
    <Popover placement="bottomRight" content={notificationContent} trigger="click" open={notifOpen} onOpenChange={setNotifOpen}>
      <Badge count={unreadCount} size="small" style={{ cursor: 'pointer' }}>
        <Button
          type="text"
          shape="circle"
          icon={<Bell size={20} color="var(--color-text-secondary, #a1a1aa)" />}
          style={{ width: 36, height: 36 }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
