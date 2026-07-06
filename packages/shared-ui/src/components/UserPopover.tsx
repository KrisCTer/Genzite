import React from 'react';
import { X, Settings } from 'lucide-react';

export interface UserPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  menuRef?: React.RefObject<HTMLDivElement> | null;
  style?: React.CSSProperties;
}

export const UserPopover: React.FC<UserPopoverProps> = ({
  isOpen,
  onClose,
  onLogout,
  user,
  menuRef,
  style
}) => {
  if (!isOpen) return null;

  return (
    <div className="user-popover-menu" ref={menuRef} style={style}>
      <div className="user-popover-header">
        <div className="user-popover-logo">Genzite</div>
        <button className="user-popover-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      
      <div className="user-popover-info">
        <div className="user-popover-avatar">
          {user?.name ? (
            <div className="avatar-initials">{user.name.charAt(0).toUpperCase()}</div>
          ) : (
            <img src={user?.avatarUrl || "https://i.pravatar.cc/150?img=33"} alt="User" />
          )}
        </div>
        <div className="user-popover-details">
          <div className="user-popover-name">{user?.name || 'Châu Phúc Lợi'}</div>
          <div className="user-popover-email">{user?.email || 'phucloidanghoconline@gmail.com'}</div>
        </div>
      </div>

      <div className="user-popover-actions">
        <button className="user-popover-btn">
          <Settings size={16} /> Cài đặt Genzite
        </button>
        <button className="user-popover-btn">
          Quản lý tài khoản
        </button>
        <button className="user-popover-btn">
          Chuyển đổi tài khoản
        </button>
        <button className="user-popover-btn" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>

      <div className="user-popover-footer">
        <a href="#">Chính sách quyền riêng tư</a> • <a href="#">Điều khoản dịch vụ</a>
      </div>
    </div>
  );
};
