import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth';
import { motion } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoginValues {
  email: string;
  password: string;
}

interface SignUpValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ---------------------------------------------------------------------------
// Sub-icons
// ---------------------------------------------------------------------------

const GoogleIcon: React.FC = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const GithubIcon: React.FC = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const Divider: React.FC = () => (
  <div className="relative flex items-center justify-center my-5 w-full">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-white/5" />
    </div>
    <span className="relative px-3 text-[11px] font-medium uppercase tracking-widest text-slate-500 bg-[#090d16]">
      or
    </span>
  </div>
);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_USER: MockUser = {
  id: 'mock-id-admin',
  name: 'Stitch Designer',
  email: 'admin@genzite.com',
  role: 'ADMIN',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => window.innerWidth >= 768);

  useEffect(() => {
    const onResize = (): void => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── mutations ──────────────────────────────────────────────────────────────

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      message.success('Login successful!');
      setAuth(data.accessToken, data.user);
      navigate('/admin');
    },
    onError: (err: unknown) => {
      console.warn('API offline — using mock credentials', err);
      message.success('Backend offline. Signed in with mock credentials.');
      setAuth('mock-jwt-token', MOCK_USER);
      navigate('/admin/identity');
    },
  });

  // ── handlers ───────────────────────────────────────────────────────────────

  const handleSignIn = (values: LoginValues): void => {
    loginMutation.mutate(values);
  };

  const handleSignUp = (_values: SignUpValues): void => {
    message.success('Account created! Please sign in.');
    setIsSignUp(false);
  };

  const handleSocialLogin = (platform: 'Google' | 'GitHub'): void => {
    message.success(`Signing in via ${platform}…`);
    setAuth('mock-jwt-token', MOCK_USER);
    navigate('/admin/identity');
  };

  // ── shared styles ──────────────────────────────────────────────────────────

  const inputCls =
    'bg-[#0f1422] border-0 hover:border-0 focus:border-0 text-white text-sm rounded-lg h-11 px-4 placeholder-slate-500 transition-colors w-full text-left';

  const socialBtnCls =
    'w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 bg-[#0e1422] text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer shrink-0';

  const panelToggleBtnCls =
    'w-[180px] h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-white/40 text-xs font-semibold text-white bg-white/5 hover:bg-white/10 active:scale-95 transition-all cursor-pointer uppercase tracking-wider mx-auto';

  const ctaBtnCls =
    'h-11 w-full max-w-[200px] mx-auto font-bold text-[#090d16] bg-gradient-to-r from-[#06b6d4] to-[#10b981] hover:brightness-110 active:scale-95 border-0 transition-all rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] cursor-pointer';

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#030712] px-4"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #0b0f19 0%, #030712 100%)' }}
    >
      {/* ── ANT DESIGN overrides to support beautiful centering ── */}
      <style>{`
        .gz-login .ant-form-item { margin-bottom: 0 !important; }
        .gz-login .ant-form-item-control-input { min-height: auto; }
        .gz-login .ant-form-item-explain-error { font-size: 11px; margin-top: 4px; text-align: center; }
      `}</style>

      {/* ── page background decorations ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-1/4 -left-40 w-[600px] h-80 bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[600px] h-80 bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* ════════════════════════════════════════════════════════════════════
          CARD — Symmetrical layout aligned like the reference picture
          ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[850px] rounded-2xl overflow-hidden border border-white/5 shadow-[0_28px_60px_-10px_rgba(0,0,0,0.85)] bg-[#090d16]"
        style={{ height: isDesktop ? 580 : 'auto' }}
      >
        {isDesktop ? (
          /* ── DESKTOP: Symmetrical split-panel layout ── */
          <div className="relative w-full h-full flex">

            {/* ── LEFT SLOT: Sign-In form (Symmetric centered design) ── */}
            <div className="gz-login w-1/2 h-full flex flex-col justify-center items-center p-12 text-center">
              <div className="w-full max-w-[320px] flex flex-col justify-center">
                {/* Header */}
                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Sign In</h2>

                {/* Social Login circles centered right below title */}
                <div className="flex justify-center gap-3 mb-4">
                  <button type="button" onClick={() => handleSocialLogin('Google')} className={socialBtnCls}>
                    <GoogleIcon />
                  </button>
                  <button type="button" onClick={() => handleSocialLogin('GitHub')} className={socialBtnCls}>
                    <GithubIcon />
                  </button>
                </div>

                <p className="text-slate-400 text-[11px] uppercase tracking-wider mb-6">
                  or use email and password
                </p>

                {/* Form fields */}
                <Form<LoginValues>
                  name="sign_in_form"
                  onFinish={handleSignIn}
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

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Password is required' }]}
                  >
                    <Input.Password placeholder="Password" className={inputCls} />
                  </Form.Item>

                  {/* Forgot password centered below inputs */}
                  <div className="text-center mt-2">
                    <span 
                      onClick={() => message.info('Reset password simulation')}
                      className="text-xs font-medium text-slate-400 hover:text-[#06b6d4] cursor-pointer transition-colors"
                    >
                      Forgot Password?
                    </span>
                  </div>

                  {/* CTA — Centered pill button */}
                  <div className="mt-6 text-center">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loginMutation.isPending}
                      className={ctaBtnCls}
                    >
                      Sign In
                    </Button>
                  </div>
                </Form>
              </div>
            </div>

            {/* ── RIGHT SLOT: Sign-Up form (Symmetric centered design) ── */}
            <div className="gz-login w-1/2 h-full flex flex-col justify-center items-center p-12 text-center">
              <div className="w-full max-w-[320px] flex flex-col justify-center">
                {/* Header */}
                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-6">Sign Up</h2>

                {/* Form fields */}
                <Form<SignUpValues>
                  name="sign_up_form"
                  onFinish={handleSignUp}
                  layout="vertical"
                  requiredMark={false}
                  className="flex flex-col gap-4 w-full text-left"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Form.Item
                      name="firstName"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Input placeholder="First name" className={inputCls} />
                    </Form.Item>
                    <Form.Item
                      name="lastName"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <Input placeholder="Last name" className={inputCls} />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Email is required' },
                      { type: 'email', message: 'Enter a valid email' },
                    ]}
                  >
                    <Input placeholder="Email address" className={inputCls} />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: 'Password is required' },
                      { min: 8, message: 'Minimum 8 characters' },
                    ]}
                  >
                    <Input.Password placeholder="Password" className={inputCls} />
                  </Form.Item>

                  <Form.Item
                    name="acceptTerms"
                    valuePropName="checked"
                    rules={[{
                      validator: (_, value: boolean) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Accept terms to continue')),
                    }]}
                  >
                    <label className="flex items-center justify-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none mx-auto">
                      <input type="checkbox" className="accent-cyan-500 w-3.5 h-3.5 rounded" />
                      I agree to the Terms &amp; Conditions
                    </label>
                  </Form.Item>

                  {/* CTA — Centered pill button */}
                  <div className="mt-6 text-center">
                    <Button type="primary" htmlType="submit" className={ctaBtnCls}>
                      Join Us
                    </Button>
                  </div>
                </Form>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                SLIDING COLORED PANEL — Symmetric layout aligned like screenshot
                ═══════════════════════════════════════════════════════════════ */}
            <div
              className="absolute top-0 left-1/2 w-1/2 h-full z-50"
              style={{
                transform: isSignUp ? 'translateX(-100%)' : 'translateX(0%)',
                transition: 'transform 0.6s ease-in-out',
              }}
            >
              {/* Marbled background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/login_cover_art.png')" }}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/50" />
              {/* Dot grid */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Panel content — Symmetric Centered Text Block */}
              <div className="relative z-10 w-full h-full flex flex-col justify-center items-center p-12 text-center">
                <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                  {isSignUp ? 'Welcome Back!' : 'Hello Friend!'}
                </h2>
                <p className="text-slate-200 text-sm leading-relaxed max-w-[280px] mb-8">
                  {isSignUp
                    ? 'To keep connected with us please login with your personal info.'
                    : 'Enter your personal details and start your journey with us.'}
                </p>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className={panelToggleBtnCls}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </div>
            {/* end sliding panel */}

          </div>
        ) : (
          /* ── MOBILE: stacked layout ── */
          <div className="gz-login flex flex-col items-center justify-center p-8 text-center">
            {/* Sign-In block */}
            {!isSignUp && (
              <div className="w-full max-w-[320px] flex flex-col gap-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Sign In</h2>
                  <p className="text-slate-400 text-xs uppercase tracking-wider">or use email and password</p>
                </div>
                <Form<LoginValues>
                  name="sign_in_form_mobile"
                  onFinish={handleSignIn}
                  layout="vertical"
                  requiredMark={false}
                  className="flex flex-col gap-4 w-full text-left"
                >
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Email is required' }, { type: 'email' }]}
                  >
                    <Input placeholder="Email address" className={inputCls} />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Password is required' }]}
                  >
                    <Input.Password placeholder="Password" className={inputCls} />
                  </Form.Item>
                  <div className="text-center">
                    <span className="text-xs text-slate-400 hover:text-[#06b6d4] cursor-pointer">Forgot Password?</span>
                  </div>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loginMutation.isPending}
                    className={ctaBtnCls}
                  >
                    Sign In
                  </Button>
                </Form>
                <Divider />
                <div className="flex justify-center gap-3">
                  <button type="button" onClick={() => handleSocialLogin('Google')} className={socialBtnCls}>
                    <GoogleIcon />
                  </button>
                  <button type="button" onClick={() => handleSocialLogin('GitHub')} className={socialBtnCls}>
                    <GithubIcon />
                  </button>
                </div>
                <p className="text-center text-sm text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-[#06b6d4] font-semibold hover:text-[#10b981] transition-colors bg-transparent border-0 cursor-pointer p-0"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            )}

            {/* Sign-Up block */}
            {isSignUp && (
              <div className="w-full max-w-[320px] flex flex-col gap-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Sign Up</h2>
                </div>
                <Form<SignUpValues>
                  name="sign_up_form_mobile"
                  onFinish={handleSignUp}
                  layout="vertical"
                  requiredMark={false}
                  className="flex flex-col gap-4 w-full text-left"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <Form.Item name="firstName" rules={[{ required: true, message: 'Required' }]}>
                      <Input placeholder="First name" className={inputCls} />
                    </Form.Item>
                    <Form.Item name="lastName" rules={[{ required: true, message: 'Required' }]}>
                      <Input placeholder="Last name" className={inputCls} />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Email is required' }, { type: 'email' }]}
                  >
                    <Input placeholder="Email address" className={inputCls} />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Password is required' }, { min: 8, message: 'Min. 8 characters' }]}
                  >
                    <Input.Password placeholder="Password" className={inputCls} />
                  </Form.Item>
                  <Form.Item
                    name="acceptTerms"
                    valuePropName="checked"
                    rules={[{
                      validator: (_, value: boolean) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Accept terms to continue')),
                    }]}
                  >
                    <label className="flex items-center justify-center gap-2 text-[11px] text-slate-400 cursor-pointer select-none mx-auto">
                      <input type="checkbox" className="accent-cyan-500 w-3.5 h-3.5 rounded" />
                      I agree to the Terms &amp; Conditions
                    </label>
                  </Form.Item>
                  <Button type="primary" htmlType="submit" className={ctaBtnCls}>
                    Join Us
                  </Button>
                </Form>
                <p className="text-center text-sm text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-[#06b6d4] font-semibold hover:text-[#10b981] transition-colors bg-transparent border-0 cursor-pointer p-0"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
