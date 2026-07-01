import React from 'react';
import { AppShell, PageWrapper } from '@genzite/shared-ui';
import { Layout as LayoutIcon, Sparkles as LucideSparkles, LogOut } from 'lucide-react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/cms':
        return { title: 'CMS Dashboard', description: 'Manage and publish dynamic JSONB records.' };
      case '/builder':
        return { title: 'App Builder Canvas', description: 'Visually compose and stack application components.' };
      case '/ai':
        return { title: 'AI Generator', description: 'Describe the website you want, AI will do the rest.' };
      default:
        return { title: 'Genzite Portal', description: 'Welcome to your AI workspace.' };
    }
  };

  const { title, description } = getPageInfo();

  return (
    <AppShell
      header={
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-[var(--gz-radius-lg)] bg-[var(--gz-primary-600)] flex items-center justify-center p-2 shadow-[var(--gz-shadow-sm)]">
              <LayoutIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[var(--gz-text)] m-0 leading-none">Genzite</h1>
              <span className="text-[10px] text-[var(--gz-text-secondary)] font-medium">NestJS + React Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-[var(--gz-surface-sunken)] p-1 rounded-[var(--gz-radius-lg)] border border-[var(--gz-border)]">
              <NavLink
                to="/ai"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-[var(--gz-radius-md)] text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[var(--gz-shadow-xs)] border border-blue-500'
                      : 'text-[var(--gz-text-secondary)] hover:text-[var(--gz-text)]'
                  }`
                }
              >
                <LucideSparkles className="w-4 h-4" /> AI Site Generator
              </NavLink>
              <NavLink
                to="/cms"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-[var(--gz-radius-md)] text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--gz-surface-raised)] text-[var(--gz-text)] shadow-[var(--gz-shadow-xs)] border border-[var(--gz-border-strong)]'
                      : 'text-[var(--gz-text-secondary)] hover:text-[var(--gz-text)]'
                  }`
                }
              >
                CMS Dashboard
              </NavLink>
              <NavLink
                to="/builder"
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-[var(--gz-radius-md)] text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[var(--gz-surface-raised)] text-[var(--gz-text)] shadow-[var(--gz-shadow-xs)] border border-[var(--gz-border-strong)]'
                      : 'text-[var(--gz-text-secondary)] hover:text-[var(--gz-text)]'
                  }`
                }
              >
                App Builder Canvas
              </NavLink>
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-[var(--gz-text-muted)] hover:text-[var(--gz-danger-500)] transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      }
    >
      <PageWrapper title={title} description={description}>
        <Outlet />
      </PageWrapper>
    </AppShell>
  );
};
