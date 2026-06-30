import React from 'react';
import { Table, Tag, Space, Button, Typography, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsersApi, type User } from '../../api/users';

const { Title } = Typography;

const UserManagement: React.FC = () => {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsersApi,
  });

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={!record.avatarUrl ? <UserOutlined /> : undefined} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong>{record.name}</strong>
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</span>
          </div>
        </Space>
      ),
    },
    {
      title: 'Roles',
      key: 'roles',
      dataIndex: 'roles',
      render: (roles: string[]) => (
        <>
          {roles.map((role) => {
            let color = role === 'ADMIN' ? 'volcano' : 'green';
            return (
              <Tag color={color} key={role}>
                {role.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Status',
      key: 'isActive',
      dataIndex: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'blue' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button icon={<EditOutlined />} type="text" />
          <Button icon={<DeleteOutlined />} type="text" danger />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: 32 }}>Identity Management</Title>
          <div style={{ color: '#6B7280', fontSize: 16, marginTop: 8 }}>Manage system users and their roles securely.</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Add User
        </Button>
      </div>

      {isError && (
        <div style={{ padding: 16, color: '#EF4444', background: '#FEF2F2', borderRadius: 12, marginBottom: 24 }}>
          Failed to load users. Please try again.
        </div>
      )}

      <Table
        columns={columns}
        dataSource={users || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: 'none',
          border: '1px solid #E5E7EB',
        }}
      />
    </div>
  );
};

export default UserManagement;
