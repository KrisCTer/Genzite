import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './CanvasLayout.css';

import { FileText, Gamepad2, PenTool, Gift, MoreVertical, X, Settings } from 'lucide-react';
import { UserPopover } from '@genzite/shared-ui';
import { useAuthStore } from '../store/auth';

/**
 * CanvasLayout — Full-bleed layout for PageBuilder & AI Canvas.
 * No sidebar, no header chrome. Just the canvas experience.
 */
const CanvasLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProjectWorkspace = location.pathname.startsWith('/project/') && location.pathname.length > 9;
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty('--mouse-x', `${x}px`);
    target.style.setProperty('--mouse-y', `${y}px`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="canvas-layout" onMouseMove={handleMouseMove}>
      <div className="canvas-spotlight"></div>
      {/* Top Header Bar - Only show on project list/welcome screen */}
      {!isProjectWorkspace && (
        <div className="canvas-topbar">
          <div className="canvas-topbar-left">
            <div className="canvas-brand" onClick={() => navigate('/home')} title="Back to workspace">
              <span className="canvas-brand-name">Genzite</span>
              <span className="canvas-brand-beta">BETA</span>
            </div>
          </div>
          
          <div className="canvas-topbar-right">
            <button className="canvas-icon-btn with-text">
              <FileText size={18} />
              <span>Docs</span>
            </button>
            <button className="canvas-icon-btn">
              <Gamepad2 size={20} />
            </button>
            <button className="canvas-icon-btn">
              <PenTool size={20} />
            </button>
            <button className="canvas-icon-btn with-badge">
              <Gift size={20} />
              <span className="notification-dot"></span>
            </button>
            <button className="canvas-icon-btn">
              <MoreVertical size={20} />
            </button>
            
            <div className="canvas-avatar-wrapper">
              <div 
                className="canvas-avatar" 
                ref={avatarRef}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {user?.name ? (
                  <div className="avatar-initials">{user.name.charAt(0).toUpperCase()}</div>
                ) : (
                  <img src="https://i.pravatar.cc/150?img=33" alt="User" />
                )}
              </div>

              {isUserMenuOpen && (
                <UserPopover
                  isOpen={isUserMenuOpen}
                  onClose={() => setIsUserMenuOpen(false)}
                  onLogout={handleLogout}
                  user={user}
                  menuRef={menuRef}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="canvas-content">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default CanvasLayout;
