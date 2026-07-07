import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMeApi, updateMeApi } from '../../api/users';
import { changePasswordApi } from '../../api/auth';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user, patchUser } = useAuthStore();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [isModified, setIsModified] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: getMeApi,
  });

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({ name: profile.name, email: profile.email });
    } else if (user) {
      form.setFieldsValue({ name: user.name, email: user.email });
    }
    setIsModified(false);
  }, [profile, user, form]);

  useEffect(() => {
    if (!profile) return;
    useAuthStore.getState().patchUser({
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    });
  }, [profile?.id, profile?.name, profile?.avatarUrl]);

  const updateMutation = useMutation({
    mutationFn: updateMeApi,
    onSuccess: (updatedUser) => {
      message.success('Cập nhật hồ sơ thành công!');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      patchUser({
        name: updatedUser.name ?? user?.name,
        avatarUrl: updatedUser.avatarUrl ?? user?.avatarUrl,
      });
      setIsModified(false);
      form.setFieldsValue({ password: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      console.error('Update profile error', error);
      message.error(error.response?.data?.message || 'Cập nhật thất bại');
    }
  });

  const passwordMutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      message.success('Đổi mật khẩu thành công!');
      form.setFieldsValue({ oldPassword: '', password: '', confirmPassword: '' });
      setIsModified(false);
    },
    onError: (error: any) => {
      console.error('Change password error', error);
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === 'AUTH_INVALID_OLD_PASSWORD') {
        message.error('Mật khẩu hiện tại không chính xác. Vui lòng nhập lại.');
      } else {
        message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
      }
    }
  });

  const handleUpdate = async (values: any) => {
    let profileUpdated = false;
    
    // 1. Update Profile (if name changed)
    const currentName = profile?.name || user?.name;
    if (values.name && values.name !== currentName) {
      updateMutation.mutate({ name: values.name });
      profileUpdated = true;
    }

    // 2. Change Password (if requested)
    if (values.password || values.oldPassword) {
      if (!values.oldPassword) {
        message.error('Vui lòng nhập mật khẩu hiện tại');
        return;
      }
      if (values.password !== values.confirmPassword) {
        message.error('Mật khẩu mới không khớp!');
        return;
      }
      passwordMutation.mutate({ oldPassword: values.oldPassword, newPassword: values.password });
    } else if (profileUpdated) {
      // If only profile was updated, we're done (mutation handles success message)
    } else {
      message.info('Không có thay đổi nào');
    }
  };

  const handleValuesChange = () => {
    setIsModified(true);
  };

  const displayName = profile?.name || user?.name || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayAvatar = profile?.avatarUrl || user?.avatarUrl;
  const userRoles = profile?.roles || user?.roles || ['VIEWER'];
  
  // Real active status and creation date if available
  const isActive = (profile?.status || user?.status) === 'ACTIVE';
  const createdAt = profile?.createdAt || user?.createdAt;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto flex flex-col w-full text-left font-sans text-sm text-[#94a3b8] px-4 md:px-6 py-4 select-none"
    >
      <style>{`
        .custom-input {
          background-color: #050816 !important;
          border: 1px solid #1A2235 !important;
          border-radius: 8px !important;
          color: #fff !important;
        }
        .custom-input:hover, .custom-input:focus {
          border-color: #06b6d4 !important;
        }
        .custom-input:focus-visible {
          outline: 2px solid #06b6d4 !important;
          outline-offset: -1px;
        }
        .custom-input[disabled] {
          background-color: #020409 !important;
          color: #64748b !important;
          border-color: #080E1E !important;
          cursor: not-allowed !important;
        }
      `}</style>

      <div className="flex flex-col gap-1 pb-6 mb-6 border-b border-[#1A2235]">
        <span className="text-xs font-bold tracking-widest text-cyan-500 uppercase">ACCOUNT SETTINGS</span>
        <h1 className="text-3xl font-extrabold text-white">Hồ Sơ Cá Nhân</h1>
        <p className="text-[#94a3b8] text-sm mt-1">Quản lý thông tin tài khoản và bảo mật của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <div className="bg-[#080E1E] border border-[#1A2235] rounded-xl p-6 flex flex-col items-center text-center">
            <div className="relative mb-5">
              {displayAvatar ? (
                <img src={displayAvatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#1A2235]" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-[#1A2235] bg-[#050816] flex items-center justify-center text-[#94a3b8] text-4xl">
                  <UserOutlined />
                </div>
              )}
              {isActive ? (
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#10B981] border-[3px] border-[#080E1E] rounded-full" />
              ) : (
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-rose-500 border-[3px] border-[#080E1E] rounded-full" />
              )}
            </div>

            <h3 className="text-xl font-bold text-white m-0 tracking-tight">{displayName}</h3>

            <span className={`mt-3 px-3 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wider ${
              userRoles.includes('ADMIN')
                ? 'text-amber-500 border-amber-500/20 bg-amber-500/10'
                : 'text-cyan-500 border-cyan-500/20 bg-cyan-500/10'
            }`}>
              {userRoles.join(' / ')}
            </span>

            <div className="flex flex-col items-center gap-1 mt-4 pt-4 border-t border-[#1A2235] w-full">
              <span className="text-[#94a3b8] text-sm flex items-center gap-2 break-all">
                <MailOutlined className="shrink-0" /> {displayEmail}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {createdAt ? `Tham gia từ: ${new Date(createdAt).toLocaleDateString('vi-VN')}` : 'Thành viên Genzite'}
              </span>
            </div>

            <Button
              onClick={() => {
                const url = window.prompt('Nhập URL ảnh đại diện mới:');
                if (url) {
                  updateMutation.mutate({ avatarUrl: url });
                }
              }}
              loading={updateMutation.isPending}
              className="mt-5 w-full bg-[#050816] border border-[#1A2235] text-[#94a3b8] hover:text-white hover:border-slate-500 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none rounded-lg h-11 transition-all font-semibold text-xs uppercase tracking-wider"
            >
              Đổi ảnh đại diện
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#080E1E] border border-[#1A2235] rounded-xl p-6 md:p-7">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Thông Tin Cơ Bản</h3>
            
            <Form 
              form={form} 
              layout="vertical" 
              initialValues={{ name: user?.name, email: user?.email }}
              onFinish={handleUpdate}
              onValuesChange={handleValuesChange}
              requiredMark={false}
              className="flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Form.Item 
                  name="name" 
                  label={<span className="text-[#94a3b8] text-sm font-semibold mb-1 block">Họ và tên</span>} 
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                  className="mb-0"
                >
                  <Input placeholder="Nhập họ và tên" className="custom-input h-11" />
                </Form.Item>
                
                <div className="flex flex-col">
                  <Form.Item 
                    name="email" 
                    label={<span className="text-[#94a3b8] text-sm font-semibold mb-1 block">Địa chỉ Email</span>} 
                    rules={[{ required: true, type: 'email' }]} 
                    className="mb-0"
                  >
                    <Input disabled className="custom-input h-11" autoComplete="username" />
                  </Form.Item>
                  <span className="text-[11px] text-slate-500 mt-2 italic flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Email không thể thay đổi do ràng buộc bảo mật.
                  </span>
                </div>
              </div>

              <div className="border-t border-[#1A2235] pt-5 mt-1">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">Đổi Mật Khẩu</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Form.Item 
                    name="oldPassword" 
                    label={
                      <span className="text-[#94a3b8] text-sm font-semibold mb-1 flex items-baseline gap-1">
                        Mật khẩu hiện tại
                      </span>
                    }
                    className="mb-0"
                  >
                    <Input.Password autoComplete="current-password" placeholder="Nhập mật khẩu hiện tại" className="custom-input h-11" />
                  </Form.Item>

                  <div className="hidden md:block"></div>

                  <Form.Item 
                    name="password" 
                    label={
                      <span className="text-[#94a3b8] text-sm font-semibold mb-1 flex items-baseline gap-1">
                        Mật khẩu mới <span className="text-slate-600 font-normal text-xs">(không bắt buộc)</span>
                      </span>
                    }
                    className="mb-0"
                  >
                    <Input.Password autoComplete="new-password" placeholder="Để trống nếu không đổi" className="custom-input h-11" />
                  </Form.Item>

                  <Form.Item 
                    name="confirmPassword" 
                    label={<span className="text-[#94a3b8] text-sm font-semibold mb-1 block">Xác nhận mật khẩu</span>}
                    className="mb-0"
                  >
                    <Input.Password autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" className="custom-input h-11" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex justify-end pt-5 mt-1 border-t border-[#1A2235]">
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!isModified}
                  loading={updateMutation.isPending || passwordMutation.isPending}
                  className={`border-0 font-bold rounded-lg h-11 px-7 text-xs uppercase tracking-wider transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none ${
                    isModified 
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                      : 'bg-[#050816] text-slate-600 cursor-not-allowed border border-[#1A2235]'
                  }`}
                >
                  Lưu Thay Đổi
                </Button>
              </div>
            </Form>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Profile;
