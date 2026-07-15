import React from 'react';
import { X, Settings, LayoutDashboard } from 'lucide-react';

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
        <div className="user-popover-logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>Genzite</div>
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
          <div className="user-popover-name">{user?.name || 'Jane Doe'}</div>
          <div className="user-popover-email">{user?.email || 'jane.doe@example.com'}</div>
        </div>
      </div>

      <div className="user-popover-actions">
        <button className="user-popover-btn" onClick={() => window.location.href = '/workspace'}>
          <LayoutDashboard size={16} /> Go to Dashboard
        </button>
        <button className="user-popover-btn">
          <Settings size={16} /> Genzite Settings
        </button>
        <button className="user-popover-btn">
          Account Management
        </button>
        <button className="user-popover-btn">
          Switch Account
        </button>
        <button className="user-popover-btn" onClick={onLogout}>
          Sign Out
        </button>
      </div>

      <div className="user-popover-footer">
        <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a>
      </div>
    </div>
  );
};
