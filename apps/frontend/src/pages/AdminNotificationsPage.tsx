import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Inbox, Eye, EyeOff, Check, CheckCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi
} from '../api/notifications';

import './NotificationsStyle.css';

function formatDistanceToNowEn(dateString: string) {
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

// UI Helpers
const getIconForType = (type: string) => {
  switch (type) {
    case 'EMAIL': return <div className="hub-card-icon amber"><Inbox size={24} /></div>;
    case 'PUSH': return <div className="hub-card-icon cyan"><Bell size={24} /></div>;
    case 'IN_APP': return <div className="hub-card-icon green"><Bell size={24} /></div>;
    default: return <div className="hub-card-icon slate"><Bell size={24} /></div>;
  }
};

const getBadgeForType = (type: string) => {
  switch (type) {
    case 'EMAIL': return 'SYSTEM';
    case 'PUSH': return 'SECURITY';
    case 'IN_APP': return 'USER';
    default: return 'NOTIFICATION';
  }
};

export const AdminNotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  // Fetch real data
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotificationsApi(),
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsReadApi,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  // Calculate KPI
  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  const totalCount = notifications.length;

  // Filter data
  const filteredList = useMemo(() => {
    let list = [...notifications];
    if (filter === 'read') list = list.filter(n => n.isRead);
    if (filter === 'unread') list = list.filter(n => !n.isRead);

    list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [notifications, filter, sort]);

  return (
    <div className="hub-root">
      <div className="hub-wrapper">


        {/* KPI Stats */}
        <div className="hub-stats">
          <div className="hub-stat-card">
            <div className="hub-stat-icon cyan"><Bell size={28} /></div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Unread</span>
              <span className="hub-stat-value">{unreadCount}</span>
            </div>
          </div>
          <div className="hub-stat-card">
            <div className="hub-stat-icon slate"><Inbox size={28} /></div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Total</span>
              <span className="hub-stat-value">{totalCount}</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="hub-main">

          {/* Sidebar */}
          <div className="hub-sidebar">
            <div className="hub-categories">
              <div className="hub-cat-title">Categories</div>

              <button
                className={`hub-cat-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <div className="hub-cat-left">
                  <Inbox className="hub-cat-icon" /> Inbox
                </div>
                {unreadCount > 0 && <div className="hub-cat-badge">{unreadCount}</div>}
              </button>

              <button
                className={`hub-cat-btn ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                <div className="hub-cat-left">
                  <Eye className="hub-cat-icon" /> Read
                </div>
              </button>

              <button
                className={`hub-cat-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                <div className="hub-cat-left">
                  <EyeOff className="hub-cat-icon" /> Unread
                </div>
              </button>
            </div>
          </div>

          {/* Feed */}
          <div className="hub-feed">
            <div className="hub-feed-header">
              <div className="hub-tabs">
                <button
                  className={`hub-tab-btn ${sort === 'newest' ? 'active' : ''}`}
                  onClick={() => setSort('newest')}
                >
                  Newest
                </button>
                <button
                  className={`hub-tab-btn ${sort === 'oldest' ? 'active' : ''}`}
                  onClick={() => setSort('oldest')}
                >
                  Oldest
                </button>
              </div>
              <button
                className="hub-mark-all-btn"
                onClick={() => markAllReadMutation.mutate()}
                disabled={unreadCount === 0 || markAllReadMutation.isPending}
              >
                <CheckCheck size={16} /> Mark all as read
              </button>
            </div>

            {isLoading && (
              <div className="hub-loading">
                <div className="hub-spinner"></div>
                <span className="hub-empty-title">Loading data...</span>
              </div>
            )}

            {!isLoading && filteredList.length === 0 && (
              <div className="hub-empty">
                <Inbox size={48} className="hub-empty-icon" />
                <span className="hub-empty-title">Empty Inbox</span>
                <span className="hub-empty-desc">No notifications in this category.</span>
              </div>
            )}

            {filteredList.map((notif) => (
              <div
                key={notif.id}
                className={`hub-card ${!notif.isRead ? 'unread' : ''} cursor-pointer`}
                onClick={(e) => {
                  // Prevent navigation if clicking on action buttons (if any)
                  if ((e.target as HTMLElement).closest('.hub-card-action-btn, .hub-card-mark-btn')) return;
                  if (!notif.isRead) markReadMutation.mutate(notif.id);
                  if (notif.metadata?.siteId) {
                    navigate(`/project/${notif.metadata.siteId}`);
                  }
                }}
              >
                {getIconForType(notif.type)}

                <div className="hub-card-content">
                  <h3 className="hub-card-title">{notif.title}</h3>
                  <p className="hub-card-desc">{notif.body}</p>

                  <div className="hub-card-meta">
                    <div className="hub-card-tags">
                      <span className="hub-tag">{getBadgeForType(notif.type)}</span>
                      {notif.metadata?.source && (
                        <span className="hub-tag">SRC:{notif.metadata.source}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hub-card-right">
                  <span className="hub-card-time">
                    {formatDistanceToNowEn(notif.createdAt)}
                  </span>

                  {notif.isRead && (
                    <div className="hub-card-mark-btn" title="Read">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminNotificationsPage;
