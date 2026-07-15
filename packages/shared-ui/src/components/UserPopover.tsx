import React from 'react';
import { Settings, LayoutDashboard, Palette } from 'lucide-react';
import './UserPopover.css';

export interface UserPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  menuRef?: React.RefObject<HTMLDivElement | null> | null;
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

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isWorkspace = pathname.startsWith('/workspace');
  const isProject = pathname.startsWith('/project');

  return (
    <div className="user-popover-menu" ref={menuRef} style={style}>
      <div className="user-popover-header">
        <div className="user-popover-logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>Genzite</div>
      </div>

      <div className="user-popover-info">
        <div className="user-popover-avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User" />
          ) : user?.name ? (
            <div className="avatar-initials">{user.name.charAt(0).toUpperCase()}</div>
          ) : (
            <img src="https://i.pravatar.cc/150?img=33" alt="User" />
          )}
        </div>
        <div className="user-popover-details">
          <div className="user-popover-name">{user?.name || 'Jane Doe'}</div>
          <div className="user-popover-email">{user?.email || 'jane.doe@example.com'}</div>
        </div>
      </div>

      <div className="user-popover-actions">
        {!isProject && (
          <button className="user-popover-btn" onClick={() => window.location.href = '/project'}>
            <Palette size={16} /> Canvas Project
          </button>
        )}
        {!isWorkspace && (
          <button className="user-popover-btn" onClick={() => window.location.href = '/workspace'}>
            <LayoutDashboard size={16} /> Go to Dashboard
          </button>
        )}
        <button className="user-popover-btn" onClick={() => window.location.href = '/workspace/profile'}>
          <Settings size={16} /> Profile
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
