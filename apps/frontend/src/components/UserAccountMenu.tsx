import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import UserAvatar from '../components/UserAvatar';
import { Button, Dropdown, App } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuthStore } from '../store/auth';
import { logoutApi } from '../api/auth';
import { getMeApi } from '../api/users';
import { getUserNavItems, hasMemberAccess } from '../utils/userNav';
import { resolveUserRoles } from '../utils/jwt';
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
  const { modal } = App.useApp();

  useEffect(() => {
    if (token && !user) {
      getMeApi()
        .then((me) => setAuth(token, me as Parameters<typeof setAuth>[1], refreshToken ?? undefined))
        .catch(() => logout());
    }
  }, [token, user, setAuth, refreshToken, logout]);

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

  const navItems = getUserNavItems(resolveUserRoles(user?.roles, token));
  const memberAccess = hasMemberAccess(resolveUserRoles(user?.roles, token));

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      className: 'user-account-menu__info-item',
      label: (
        <div className="user-account-menu__info">
          <span className="user-account-menu__name">{(user?.metadata as any)?.displayName || user?.name || 'User'}</span>
          <span className="user-account-menu__email">{user?.email}</span>
          {user?.roles?.length ? (
            <span className="user-account-menu__roles">{user.roles.join(' · ')}</span>
          ) : null}
        </div>
      ),
    },
    { type: 'divider' },
    ...(memberAccess
      ? navItems.map((item) => ({
        key: item.key,
        label: item.label,
        onClick: () => navigate(item.path),
      }))
      : [
        {
          key: 'no-access',
          label: 'No access',
          disabled: true,
        },
      ]),
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const triggerClass =
    variant === 'landing'
      ? 'user-account-menu__trigger user-account-menu__trigger--landing'
      : 'user-account-menu__trigger';

  return (
    <>
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
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottomRight"
        overlayClassName="user-account-menu__dropdown"
      >
        <button type="button" className={triggerClass} aria-label="Account">
          <UserAvatar size={avatarSize} />
        </button>
      </Dropdown>
    </>
  );
};

export default UserAccountMenu;
