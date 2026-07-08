import React, { useState, useMemo } from 'react';
import { 
  Bell, Inbox, TrendingUp, Eye, EyeOff, Check, CheckCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchNotificationsApi, 
  markNotificationAsReadApi, 
  markAllNotificationsAsReadApi 
} from '../api/notifications';

import './NotificationsStyle.css';

function formatDistanceToNowVi(dateString: string) {
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)} giây trước`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  return `${Math.floor(diffInDays / 365)} năm trước`;
}

// Helpers cho UI
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
    case 'EMAIL': return 'HỆ THỐNG';
    case 'PUSH': return 'BẢO MẬT';
    case 'IN_APP': return 'NGƯỜI DÙNG';
    default: return 'THÔNG BÁO';
  }
};

export const AdminNotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  // Lấy dữ liệu thật
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

  // Tính toán KPI
  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  const totalCount = notifications.length;
  const readRate = totalCount === 0 ? 100 : Math.round(((totalCount - unreadCount) / totalCount) * 100);

  // Lọc dữ liệu
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
        
        {/* Header */}
        <div className="hub-header">
          <h1 className="hub-header-title">Trung Tâm Thông Báo</h1>
          <p className="hub-header-desc">Quản lý các sự kiện thời gian thực từ mạng lưới vũ trụ của bạn.</p>
        </div>

        {/* KPI Stats */}
        <div className="hub-stats">
          <div className="hub-stat-card">
            <div className="hub-stat-icon cyan"><Bell size={28} /></div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Chưa đọc</span>
              <span className="hub-stat-value">{unreadCount}</span>
            </div>
          </div>
          <div className="hub-stat-card">
            <div className="hub-stat-icon slate"><Inbox size={28} /></div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Tổng cộng</span>
              <span className="hub-stat-value">{totalCount}</span>
            </div>
          </div>
          <div className="hub-stat-card">
            <div className="hub-stat-icon green"><TrendingUp size={28} /></div>
            <div className="hub-stat-info">
              <span className="hub-stat-label">Tỉ lệ đọc</span>
              <span className="hub-stat-value">{readRate}%</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="hub-main">
          
          {/* Sidebar */}
          <div className="hub-sidebar">
            <div className="hub-categories">
              <div className="hub-cat-title">Phân loại</div>
              
              <button 
                className={`hub-cat-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                <div className="hub-cat-left">
                  <Inbox className="hub-cat-icon" /> Hộp thư
                </div>
                {unreadCount > 0 && <div className="hub-cat-badge">{unreadCount}</div>}
              </button>

              <button 
                className={`hub-cat-btn ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
              >
                <div className="hub-cat-left">
                  <Eye className="hub-cat-icon" /> Đã đọc
                </div>
              </button>

              <button 
                className={`hub-cat-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                <div className="hub-cat-left">
                  <EyeOff className="hub-cat-icon" /> Chưa đọc
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
                  Mới nhất
                </button>
                <button 
                  className={`hub-tab-btn ${sort === 'oldest' ? 'active' : ''}`}
                  onClick={() => setSort('oldest')}
                >
                  Cũ nhất
                </button>
              </div>
              <button 
                className="hub-mark-all-btn"
                onClick={() => markAllReadMutation.mutate()}
                disabled={unreadCount === 0 || markAllReadMutation.isPending}
              >
                <CheckCheck size={16} /> Đánh dấu tất cả là đã đọc
              </button>
            </div>

            {isLoading && (
              <div className="hub-loading">
                <div className="hub-spinner"></div>
                <span className="hub-empty-title">Đang tải dữ liệu...</span>
              </div>
            )}

            {!isLoading && filteredList.length === 0 && (
              <div className="hub-empty">
                <Inbox size={48} className="hub-empty-icon" />
                <span className="hub-empty-title">Hộp Thư Trống</span>
                <span className="hub-empty-desc">Không có thông báo nào trong danh mục này.</span>
              </div>
            )}

            {filteredList.map((notif) => (
              <div key={notif.id} className={`hub-card ${!notif.isRead ? 'unread' : ''}`}>
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
                    {formatDistanceToNowVi(notif.createdAt)}
                  </span>
                  
                  {!notif.isRead ? (
                    <button 
                      className="hub-card-action-btn"
                      onClick={() => markReadMutation.mutate(notif.id)}
                      disabled={markReadMutation.isPending}
                    >
                      Xác nhận
                    </button>
                  ) : (
                    <button className="hub-card-mark-btn" title="Đã đọc">
                      <Check size={16} />
                    </button>
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
