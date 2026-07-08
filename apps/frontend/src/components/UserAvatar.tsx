import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/auth';

type UserAvatarProps = {
  size?: number;
  className?: string;
};

const UserAvatar: React.FC<UserAvatarProps> = ({ size = 34, className }) => {
  const user = useAuthStore((s) => s.user);
  const displayName = (user?.metadata as any)?.displayName || user?.name;

  if (user?.avatarUrl) {
    return (
      <Avatar
        key={user.avatarUrl}
        src={user.avatarUrl}
        size={size}
        className={className}
        style={{ cursor: 'pointer', flexShrink: 0 }}
      />
    );
  }

  return (
    <Avatar
      size={size}
      className={className}
      icon={!displayName ? <UserOutlined /> : undefined}
      style={{
        backgroundColor: 'var(--color-accent)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: Math.max(12, Math.round(size * 0.38)),
        flexShrink: 0,
      }}
    >
      {displayName?.charAt(0)?.toUpperCase()}
    </Avatar>
  );
};

export default UserAvatar;
