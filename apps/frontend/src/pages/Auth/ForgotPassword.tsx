import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from 'aws-amplify/auth';
import { motion } from 'framer-motion';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  // @ts-ignore
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    document.title = "Forgot Password | Genzite Identity";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Recover access to your Genzite account by requesting a secure password reset link.');
  }, []);

  const forgotMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const output = await resetPassword({ username: email });
      return { email, nextStep: output.nextStep };
    },
    onSuccess: (data) => {
      message.success('Mã xác nhận đã được gửi đến email của bạn.');
      navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
    },
    onError: (err: any) => {
      console.error('Forgot password error', err);
      message.error(err.message || err.response?.data?.message || 'Failed to send reset link.');
    },
  });

  const handleFinish = (values: { email: string }) => {
    forgotMutation.mutate(values);
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
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Forgot Password</h2>
        
        {false ? (
          <div className="flex flex-col items-center">
            <p className="text-slate-400 mb-8 text-sm">
              We've sent a password reset link to your email address. Please check your inbox.
            </p>
            <div className="w-full mt-4">
              <Button
                type="primary"
                className={ctaBtnCls}
                onClick={() => navigate('/login')}
              >
                Return to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-400 mb-8 text-sm">
              Enter your email address to receive a verification code for password reset.
            </p>
            <Form
              name="forgot_password_form"
              onFinish={handleFinish}
              layout="vertical"
              requiredMark={false}
              className="flex flex-col gap-4 w-full text-left"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Email is required' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input placeholder="Email address" className={inputCls} />
              </Form.Item>

              <div className="mt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={forgotMutation.isPending}
                  className={ctaBtnCls}
                >
                  Send Reset Link
                </Button>
              </div>
            </Form>
            <div className="mt-6 text-sm text-slate-500">
              Remember your password?{' '}
              <Link to="/login" className="text-[#06b6d4] hover:text-[#10b981] font-semibold transition-colors">
                Sign In
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
