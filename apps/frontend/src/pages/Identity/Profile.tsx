import React, { useEffect, useState } from 'react';
import { Form, Input, message, Modal } from 'antd';
import { 
  User, 
  Mail, 
  Wallet, 
  CalendarDays,
  Lock,
  ShieldCheck,
  Camera,
  Link
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeApi, updateMeApi } from '../../api/users';
import { changePasswordApi } from '../../api/auth';
import '../NotificationsStyle.css';

const Profile: React.FC = () => {
  const { user, patchUser } = useAuthStore();
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const queryClient = useQueryClient();
  const [isModified, setIsModified] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: getMeApi,
  });

  useEffect(() => {
    document.title = 'Profile | Genzite';
  }, []);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({ 
        name: profile.name, 
        displayName: profile.metadata?.displayName || '',
        email: profile.email 
      });
    } else if (user) {
      form.setFieldsValue({ 
        name: user.name, 
        displayName: user.metadata?.displayName || '',
        email: user.email 
      });
    }
    setIsModified(false);
  }, [profile, user, form]);

  useEffect(() => {
    if (!profile) return;
    useAuthStore.getState().patchUser({
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      metadata: profile.metadata,
    });
  }, [profile?.id, profile?.name, profile?.avatarUrl, profile?.metadata]);

  const updateMutation = useMutation({
    mutationFn: updateMeApi,
    onSuccess: (updatedUser) => {
      message.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      patchUser({
        name: updatedUser.name ?? user?.name,
        avatarUrl: updatedUser.avatarUrl ?? user?.avatarUrl,
        metadata: updatedUser.metadata ?? user?.metadata,
      });
      setIsModified(false);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Update failed');
    }
  });

  const passwordMutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      message.success('Password changed successfully!');
      pwdForm.resetFields();
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === 'AUTH_INVALID_OLD_PASSWORD') {
        message.error('Current password is incorrect.');
      } else {
        message.error(error.response?.data?.message || 'Failed to change password. Please check again.');
      }
    }
  });

  const handleUpdateBasicInfo = async (values: any) => {
    const currentName = profile?.name || user?.name;
    const currentDisplayName = profile?.metadata?.displayName || user?.metadata?.displayName;
    
    const updates: any = {};
    if (values.name !== currentName) updates.name = values.name;
    if (values.displayName !== currentDisplayName) {
      updates.metadata = { 
        ...profile?.metadata, 
        ...user?.metadata,
        displayName: values.displayName 
      };
    }
    
    if (Object.keys(updates).length > 0) {
      updateMutation.mutate(updates);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      message.error('New passwords do not match!');
      return;
    }
    passwordMutation.mutate({ 
      oldPassword: values.oldPassword, 
      newPassword: values.password 
    });
  };

  const handleUpdateAvatar = () => {
    if (avatarUrlInput.trim()) {
      updateMutation.mutate({ avatarUrl: avatarUrlInput.trim() }, {
        onSuccess: () => {
          setIsAvatarModalVisible(false);
          setAvatarUrlInput('');
        }
      });
    }
  };

  const displayName = profile?.metadata?.displayName || user?.metadata?.displayName || profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayAvatar = profile?.avatarUrl || user?.avatarUrl;
  const userRoles = profile?.roles || user?.roles || ['USER'];
  const isActive = (profile?.status || user?.status) === 'ACTIVE';
  const createdAt = profile?.createdAt || user?.createdAt;
  const credits = profile?.credits ?? 0;
  
  const rawId = profile?.id || user?.id || '';
  const displayUid = rawId ? `UID: ${rawId.substring(0, 8).toUpperCase()}` : 'UID: UNKNOWN';

  // Custom styles for Antd Input inside Glassmorphism
  const inputStyle = {
    background: 'rgba(15,23,42,0.6)', 
    border: '1px solid rgba(255,255,255,0.1)', 
    color: '#fff', 
    padding: '10px 14px', 
    borderRadius: '10px',
    boxShadow: 'none'
  };

  const labelStyle = { color: '#a1a1aa', fontSize: 13, fontWeight: 600, paddingBottom: 6, display: 'inline-block' };

  return (
    <div className="hub-root">
      <div className="hub-wrapper" style={{ maxWidth: '100%' }}>
        
        {/* Header */}
        <div className="hub-header">
          <h1 className="hub-header-title">Personal Profile</h1>
          <p className="hub-header-desc">Manage your identity and account security in the Genzite workspace.</p>
        </div>

        {/* Main Content Layout */}
        <div className="hub-main">
          
          {/* LEFT COLUMN: Sidebar */}
          <div className="hub-sidebar">
            <div className="hub-categories" style={{ alignItems: 'center', textAlign: 'center', padding: '32px 16px' }}>
              <div 
                className="relative group cursor-pointer" 
                style={{ marginBottom: 20 }}
                onClick={() => setIsAvatarModalVisible(true)}
                title="Change Avatar"
                aria-label="Change Avatar"
              >
                <div style={{ width: 120, height: 120, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'rgba(0,229,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff' }}>
                      <User size={48} />
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div 
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ transition: 'opacity 0.2s ease-in-out', zIndex: 5 }}
                  >
                    <Camera size={24} color="#ffffff" />
                  </div>
                </div>
                {isActive && (
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#10b981] border-2 border-[#0f172a] rounded-full z-10" />
                )}
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px 0' }}>{displayName}</h2>
              <span style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{displayUid}</span>

              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                {userRoles.map((role: string) => {
                  const isAuth = role === 'ADMIN';
                  return (
                    <span key={role} className="hub-tag" style={{ color: isAuth ? '#f59e0b' : '#00e5ff', borderColor: isAuth ? 'rgba(245,158,11,0.2)' : 'rgba(0,229,255,0.2)', background: isAuth ? 'rgba(245,158,11,0.1)' : 'rgba(0,229,255,0.1)' }}>
                      {role}
                    </span>
                  )
                })}
              </div>

              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 24, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#a1a1aa', fontSize: 13, textAlign: 'left', width: '100%' }}>
                  <Mail size={16} style={{ flexShrink: 0 }} /> <span style={{ wordBreak: 'break-all' }}>{displayEmail}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#a1a1aa', fontSize: 13, textAlign: 'left' }}>
                  <Wallet size={16} /> <span>{credits.toLocaleString()} Credits</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#a1a1aa', fontSize: 13, textAlign: 'left' }}>
                  <CalendarDays size={16} /> <span>Joined: {createdAt ? new Date(createdAt).toLocaleDateString('en-US') : '--'}</span>
                </div>
              </div>
            </div>

            <div className="hub-categories">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Security Status</span>
                <span className="hub-tag" style={{ color: '#00e5ff', borderColor: 'rgba(0,229,255,0.2)', background: 'rgba(0,229,255,0.1)' }}>Strong</span>
              </div>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ background: '#00e5ff', height: '100%', width: '100%', borderRadius: 3 }}></div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Feed / Forms */}
          <div className="hub-feed">
            
            {/* Basic Info Card */}
            <div className="hub-card" style={{ flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="hub-card-icon cyan"><User size={24} /></div>
                <div>
                  <h3 className="hub-card-title" style={{ color: '#fff' }}>Basic Information</h3>
                  <p className="hub-card-desc">Update your display identity</p>
                </div>
              </div>

              <Form 
                form={form} 
                layout="vertical"
                onFinish={handleUpdateBasicInfo}
                onValuesChange={() => setIsModified(true)}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <Form.Item name="name" label={<span style={labelStyle}>Full Name</span>} style={{ marginBottom: 0 }}>
                    <Input style={inputStyle} aria-label="Full Name" />
                  </Form.Item>
                  <Form.Item name="displayName" label={<span style={labelStyle}>Display Name</span>} style={{ marginBottom: 0 }}>
                    <Input placeholder="Nickname" style={inputStyle} aria-label="Display Name" />
                  </Form.Item>
                </div>

                <div style={{ marginTop: 24 }}>
                  <Form.Item name="email" label={<span style={labelStyle}>Email Address</span>} style={{ marginBottom: 0 }}>
                    <Input disabled suffix={<Lock size={16} style={{ color: '#64748b' }} />} style={{ ...inputStyle, background: 'rgba(255,255,255,0.02)', color: '#64748b', cursor: 'not-allowed' }} aria-label="Email Address" />
                  </Form.Item>
                  <p style={{ color: '#64748b', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                    This email is linked to your security identity and cannot be changed directly.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <button 
                    type="submit" 
                    className="hub-card-action-btn"
                    disabled={!isModified || updateMutation.isPending}
                    aria-label="Update Information"
                    style={{ opacity: (!isModified || updateMutation.isPending) ? 0.5 : 1, cursor: (!isModified || updateMutation.isPending) ? 'not-allowed' : 'pointer' }}
                  >
                    Update Information
                  </button>
                </div>
              </Form>
            </div>

            {/* Security Card */}
            <div className="hub-card" style={{ flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="hub-card-icon rose"><ShieldCheck size={24} /></div>
                <div>
                  <h3 className="hub-card-title" style={{ color: '#fff' }}>Change Password</h3>
                  <p className="hub-card-desc">Enhance your account protection</p>
                </div>
              </div>

              <Form 
                form={pwdForm} 
                layout="vertical"
                onFinish={handleChangePassword}
              >
                <Form.Item 
                  name="oldPassword" 
                  label={<span style={labelStyle}>Current Password</span>} 
                  rules={[{ required: true, message: 'Please enter your current password' }]}
                  style={{ marginBottom: 20 }}
                >
                  <Input.Password placeholder="••••••••" style={inputStyle} aria-label="Current Password" />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <Form.Item 
                    name="password" 
                    label={<span style={labelStyle}>New Password</span>} 
                    rules={[{ required: true, message: 'Please enter a new password' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input.Password placeholder="••••••••" style={inputStyle} aria-label="New Password" />
                  </Form.Item>

                  <Form.Item 
                    name="confirmPassword" 
                    label={<span style={labelStyle}>Confirm New Password</span>} 
                    rules={[{ required: true, message: 'Please confirm your new password' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input.Password placeholder="••••••••" style={inputStyle} aria-label="Confirm New Password" />
                  </Form.Item>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <button 
                    type="submit" 
                    className="hub-card-action-btn"
                    disabled={passwordMutation.isPending}
                    aria-label="Change Password"
                    style={{ 
                      opacity: passwordMutation.isPending ? 0.5 : 1, 
                      cursor: passwordMutation.isPending ? 'not-allowed' : 'pointer', 
                      background: 'linear-gradient(135deg, #f43f5e, #8b5cf6)' 
                    }}
                  >
                    Change Password
                  </button>
                </div>
              </Form>
            </div>

          </div>
        </div>
      </div>

      {/* Update Avatar Modal */}
      <Modal
        title={<span style={{ color: '#fff', fontWeight: 'bold' }}>Update Avatar</span>}
        open={isAvatarModalVisible}
        onCancel={() => setIsAvatarModalVisible(false)}
        footer={null}
        styles={{ 
          content: { backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' },
          header: { backgroundColor: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' },
          mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.6)' }
        }}
        closeIcon={<span style={{ color: '#a1a1aa' }}>✕</span>}
      >
        <div style={{ paddingTop: 16 }}>
          <p style={{ color: '#a1a1aa', marginBottom: 16, fontSize: 14 }}>Please enter the URL of the image you want to use as your avatar.</p>
          <Input 
            value={avatarUrlInput}
            onChange={(e) => setAvatarUrlInput(e.target.value)}
            placeholder="https://example.com/avatar.jpg" 
            style={{ ...inputStyle, marginBottom: 24 }}
            prefix={<Link size={16} style={{ color: '#64748b', marginRight: 8 }} />}
            onPressEnter={handleUpdateAvatar}
            aria-label="Avatar URL"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button 
              onClick={() => setIsAvatarModalVisible(false)}
              className="hub-tab-btn"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdateAvatar}
              disabled={!avatarUrlInput.trim() || updateMutation.isPending}
              className="hub-card-action-btn"
              style={{ opacity: (!avatarUrlInput.trim() || updateMutation.isPending) ? 0.5 : 1 }}
            >
              Apply
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
