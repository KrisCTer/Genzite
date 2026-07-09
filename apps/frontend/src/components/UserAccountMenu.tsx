import React, { useEffect } from 'react';
import UserAvatar from '../components/UserAvatar';
import { Button, Dropdown } from 'antd';
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
}

const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  signInClassName = '',
  variant = 'default',
}) => {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (token && !user) {
      getMeApi()
        .then((me) => setAuth(token, me as Parameters<typeof setAuth>[1], refreshToken ?? undefined))
        .catch(() => logout());
    }
  }, [token, user, setAuth, refreshToken, logout]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // clear local session even if API fails
    }
    logout();
    navigate('/login');
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
      label: (
        <div className="user-account-menu__info">
          <span className="user-account-menu__name">{(user?.metadata as any)?.displayName || user?.name || 'User'}</span>
          <span className="user-account-menu__email">{user?.email}</span>
          {user?.roles?.length ? (
            <span className="user-account-menu__roles">{user.roles.join(' · ')}</span>
          ) : null}
        </div>
      ),
      disabled: true,
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
            label: 'Chưa có quyền truy cập',
            disabled: true,
          },
        ]),
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
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
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['hover']}
      placement="bottomRight"
      overlayClassName="user-account-menu__dropdown"
    >
      <button type="button" className={triggerClass} aria-label="Tài khoản">
        <UserAvatar size={40} />
      </button>
    </Dropdown>
  );
};

export default UserAccountMenu;
