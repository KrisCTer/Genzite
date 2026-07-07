import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Plus,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Users,
  Images,
  Smartphone,
} from 'lucide-react';
import { ADMIN_BASE } from '../../utils/userNav';

const QUICK_ACTIONS = [
  { label: 'Build a landing page', icon: Smartphone, path: `${ADMIN_BASE}/site` },
  { label: 'Create CMS collection', icon: LayoutGrid, path: `${ADMIN_BASE}/cms` },
  { label: 'Manage users', icon: Users, path: `${ADMIN_BASE}/identity` },
  { label: 'Media library', icon: Images, path: `${ADMIN_BASE}/media` },
] as const;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full h-full min-h-full bg-[var(--color-bg-app)] text-[#e8eaed] overflow-y-auto custom-scrollbar">
      <div className="flex-1 flex w-full items-center justify-center px-4 md:px-8 py-10 md:py-16">
        <div className="w-full max-w-[820px] flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in text-center w-full">
            <h1 className="text-[28px] md:text-[32px] font-normal text-[#e8eaed] tracking-tight leading-tight">
              Build your ideas with Genzite
            </h1>
            <Sparkles className="w-6 h-6 text-[#a8c7fa] shrink-0" strokeWidth={1.75} />
          </div>

          <div className="w-full mb-5 group">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-white/[0.12] transition-colors duration-200 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]">
            <div className="px-5 pt-5 pb-4 flex flex-col gap-4">
              <textarea
                placeholder="Describe an app and let Genzite AI do the rest"
                className="bg-transparent border-none focus:ring-0 w-full text-[15px] placeholder-[#5f6368] text-[#e8eaed] resize-none h-[104px] outline-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-0.5 text-[#9aa0a6]">
                  <button
                    type="button"
                    className="p-2 hover:bg-white/[0.06] hover:text-[#e8eaed] rounded-full transition-colors cursor-pointer"
                    aria-label="Voice input"
                  >
                    <Mic className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-white/[0.06] hover:text-[#e8eaed] rounded-full transition-colors cursor-pointer"
                    aria-label="Add attachment"
                  >
                    <Plus className="w-[18px] h-[18px]" strokeWidth={1.75} />
                  </button>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.08] transition-all duration-200 px-4 py-2 rounded-full text-[13px] font-medium text-[#e8eaed] cursor-pointer group-focus-within:bg-[#8ab4f8] group-focus-within:text-[#0b0f19] group-focus-within:border-transparent"
                >
                  <Sparkles className="w-4 h-4 text-[#a8c7fa] group-focus-within:text-[#0b0f19]" strokeWidth={1.75} />
                  I'm feeling lucky
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 w-full">
          {QUICK_ACTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 px-4 h-9 bg-white/[0.04] border border-white/[0.06] rounded-full hover:bg-white/[0.07] hover:border-white/[0.1] transition-colors duration-200 text-[13px] font-medium text-[#c4c7c5] cursor-pointer"
              >
                <Icon className="w-4 h-4 text-[#9aa0a6]" strokeWidth={1.75} />
                {item.label}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <div className="shrink-0 w-full border-t border-white/[0.06]">
        <div className="w-full max-w-[1024px] mx-auto px-4 md:px-8 pt-5 pb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-[14px] font-medium text-[#e8eaed]">Discover and remix app ideas</h2>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] rounded-xl text-[13px] font-medium transition-colors duration-200 text-[#e8eaed] cursor-pointer"
        >
          Browse the app gallery
          <ArrowRight className="w-4 h-4 text-[#9aa0a6]" strokeWidth={1.75} />
        </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
