import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      // Simulated login
      const dummyToken = btoa(`${email}:${Date.now()}`);
      login(dummyToken);
      navigate('/cms');
    }
  };

  return (
    <div 
      className="min-h-screen bg-black flex flex-col items-center justify-between p-4 md:p-6 font-sans select-none relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Background Aurora Glows (Stitch style) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[400px] bg-gradient-to-t from-purple-900/10 via-blue-900/5 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-16 left-1/4 w-[50%] h-[250px] bg-gradient-to-r from-purple-600/20 via-indigo-600/20 to-blue-500/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute -bottom-24 right-1/4 w-[45%] h-[220px] bg-gradient-to-r from-blue-500/15 via-cyan-500/20 to-teal-400/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Spacer to push card to center vertically */}
      <div className="flex-1 flex items-center justify-center w-full max-w-[448px] z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full bg-[#0d0e12]/85 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Logo */}
            <div className="flex items-center gap-1.5 mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#3B82F6" />
              </svg>
              <span className="text-[22px] font-semibold text-white tracking-tight">Genzite</span>
            </div>

            <h1 className="text-2xl font-normal text-white mb-2 tracking-tight">Sign in</h1>
            <p className="text-base font-normal text-zinc-400">to continue to your AI workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="relative group">
              <input
                type="email"
                id="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="peer w-full px-4 py-3.5 text-base text-[#F4F4F5] bg-zinc-950/60 border border-zinc-800 rounded-[8px] outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <label
                htmlFor="email"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 origin-[0] bg-[#0d0e12] px-1 text-base text-zinc-400 transition-all duration-200 transform pointer-events-none
                  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:left-4
                  peer-focus:scale-75 peer-focus:-translate-y-[28px] peer-focus:left-3 peer-focus:text-blue-400
                  -translate-y-[28px] scale-75 left-3"
              >
                Email or phone
              </label>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <input
                type="password"
                id="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="peer w-full px-4 py-3.5 text-base text-[#F4F4F5] bg-zinc-950/60 border border-zinc-800 rounded-[8px] outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <label
                htmlFor="password"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 origin-[0] bg-[#0d0e12] px-1 text-base text-zinc-400 transition-all duration-200 transform pointer-events-none
                  peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:left-4
                  peer-focus:scale-75 peer-focus:-translate-y-[28px] peer-focus:left-3 peer-focus:text-blue-400
                  -translate-y-[28px] scale-75 left-3"
              >
                Password
              </label>
            </div>

            {/* Forgot Credentials Link */}
            <div className="flex justify-start">
              <a
                href="#"
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors focus:underline outline-none"
              >
                Forgot password?
              </a>
            </div>

            <div className="pt-2 text-xs text-zinc-400 leading-relaxed">
              Not your computer? Use Guest mode to sign in privately.{' '}
              <a href="#" className="text-blue-400 font-semibold hover:underline">
                Learn more
              </a>
            </div>

            {/* Submit & Creation Bar */}
            <div className="flex items-center justify-between pt-4">
              <a
                href="#"
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors focus:underline outline-none"
              >
                Create account
              </a>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-600 text-white text-sm font-semibold rounded-[8px] transition-colors shadow-lg shadow-blue-500/20 outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                Sign in
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Footer / Selector */}
      <footer className="w-full max-w-[448px] flex items-center justify-between text-xs text-zinc-400 mt-6 px-1 z-10">
        <div className="relative">
          <select className="bg-transparent pr-4 py-1 text-zinc-400 outline-none cursor-pointer hover:bg-zinc-800/50 rounded px-1.5 transition-colors">
            <option className="bg-black text-white">English (United States)</option>
            <option className="bg-black text-white">Tiếng Việt</option>
          </select>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </footer>
    </div>
  );
};


