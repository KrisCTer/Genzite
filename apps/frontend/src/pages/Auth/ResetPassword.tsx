import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPasswordApi } from '../../api/auth';
import { motion } from 'framer-motion';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      message.error('Invalid or missing reset token.');
    }

    // SEO setup
    document.title = "Reset Password | Genzite Identity";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Create a new, secure password for your Genzite account.');
  }, [location]);

  const resetMutation = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      message.success('Password has been reset successfully!');
      navigate('/login');
    },
    onError: (err: any) => {
      console.error('Reset password error', err);
      message.error(err.response?.data?.message || 'Failed to reset password. Token might be expired.');
    },
  });

  const handleFinish = (values: any) => {
    if (!token) {
      message.error('Cannot reset password without a valid token.');
      return;
    }
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    resetMutation.mutate({ token, newPassword: values.password });
  };

  const inputCls =
    'bg-[#0f1422] border-0 hover:border-0 focus:border-0 text-white text-sm rounded-lg h-11 px-4 placeholder-slate-500 transition-colors w-full text-left';

  const ctaBtnCls =
    'h-11 w-full font-bold text-[#090d16] bg-gradient-to-r from-[#06b6d4] to-[#10b981] hover:brightness-110 active:scale-95 border-0 transition-all rounded-lg text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] cursor-pointer';

  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#030712] px-4"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #0b0f19 0%, #030712 100%)' }}
    >
      <style>{`
        .gz-login .ant-form-item { margin-bottom: 0 !important; }
        .gz-login .ant-form-item-control-input { min-height: auto; }
        .gz-login .ant-form-item-explain-error { font-size: 11px; margin-top: 4px; text-align: center; }
      `}</style>

      {/* Background decorations */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-1/4 -left-40 w-[600px] h-80 bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[600px] h-80 bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[450px] rounded-2xl overflow-hidden border border-white/5 shadow-[0_28px_60px_-10px_rgba(0,0,0,0.85)] bg-[#090d16] p-10 gz-login text-center"
      >
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Reset Password</h2>
        <p className="text-slate-400 mb-8 text-sm">
          Please enter your new password below.
        </p>
        <Form
          name="reset_password_form"
          onFinish={handleFinish}
          layout="vertical"
          requiredMark={false}
          className="flex flex-col gap-4 w-full text-left"
        >
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'New password is required' }]}
          >
            <Input.Password placeholder="New Password" className={inputCls} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[{ required: true, message: 'Confirm password is required' }]}
          >
            <Input.Password placeholder="Confirm Password" className={inputCls} />
          </Form.Item>

          <div className="mt-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={resetMutation.isPending}
              disabled={!token}
              className={ctaBtnCls}
            >
              Reset Password
            </Button>
          </div>
        </Form>
        <div className="mt-6 text-sm text-slate-500">
          <Link to="/login" className="text-[#06b6d4] hover:text-[#10b981] font-semibold transition-colors">
            Return to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
