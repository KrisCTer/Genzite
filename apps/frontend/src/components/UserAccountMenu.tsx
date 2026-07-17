import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserPopover } from '@genzite/shared-ui';
import UserAvatar from '../components/UserAvatar';
import { Button, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { logoutApi } from '../api/auth';
import { getMeApi } from '../api/users';
import './UserAccountMenu.css';

interface UserAccountMenuProps {
  signInClassName?: string;
  variant?: 'landing' | 'default';
  avatarSize?: number;
}

const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  signInClassName = '',
  variant = 'default',
  avatarSize = 40,
}) => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, right: 0 });
  const { modal } = App.useApp();
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (token && !user) {
      getMeApi()
        .then((me) => setAuth(token, me as Parameters<typeof setAuth>[1], refreshToken ?? undefined))
        .catch(() => logout());
    }
  }, [token, user, setAuth, refreshToken, logout]);

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsPopoverOpen((prev) => !prev);
  };

  const handleLogout = () => {
    modal.confirm({
      centered: true,
      title: 'Confirm Logout',
      content: 'Are you sure you want to log out?',
      okText: 'Logout',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      zIndex: 9999999,
      styles: {
        mask: {
          backgroundColor: 'rgba(3, 7, 18, 0.6)',
          backdropFilter: 'blur(8px)'
        }
      },
      onOk: async () => {
        setIsLoggingOut(true);
        try {
          await logoutApi();
        } catch {
          // clear local session even if API fails
        }
        setTimeout(() => {
          logout();
          navigate('/login', { replace: true });
        }, 800);
      },
    });
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const popoverEl = document.querySelector('.user-popover-menu');
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        (!popoverEl || !popoverEl.contains(target))
      ) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen]);

  if (!token) {
    return (
      <Button
        type="primary"
        size="large"
        className={signInClassName}
        onClick={() => navigate('/login')}
      >
        Sign In
      </Button>
    );
  }

  const triggerClass =
    variant === 'landing'
      ? 'user-account-menu__trigger user-account-menu__trigger--landing'
      : 'user-account-menu__trigger';

  return (
    <div className="user-account-menu-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {isLoggingOut && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(3, 7, 18, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div style={{ color: 'white', fontWeight: 500, letterSpacing: '0.5px' }}>Logging out...</div>
        </div>,
        document.body
      )}

      <button
        type="button"
        className={triggerClass}
        aria-label="Account"
        ref={triggerRef}
        onClick={handleOpen}
      >
        <UserAvatar size={avatarSize} />
      </button>

      {isPopoverOpen && createPortal(
        <UserPopover
          isOpen={isPopoverOpen}
          onClose={() => setIsPopoverOpen(false)}
          onLogout={() => { setIsPopoverOpen(false); handleLogout(); }}
          user={{
            name: (user?.metadata as any)?.displayName || user?.name || 'User',
            email: user?.email,
            avatarUrl: user?.avatarUrl
          }}
          style={{
            position: 'fixed',
            top: popoverPos.top,
            right: popoverPos.right,
            zIndex: 99999,
          }}
        />,
        document.body
      )}
    </div>
  );
};

export default UserAccountMenu;
