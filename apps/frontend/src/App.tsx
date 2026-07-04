import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { genziteDarkTheme } from './styles/theme';
import AdminLayout from './layouts/AdminLayout';
import CanvasLayout from './layouts/CanvasLayout';
import Login from './pages/Auth/Login';
import UserManagement from './pages/Identity/UserManagement';
import MediaLibrary from './pages/Media/MediaLibrary';
import Collections from './pages/CMS/Collections';
import DataGrid from './pages/CMS/DataGrid';
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Identity/Profile';
import SitesList from './pages/Site/SitesList';
import PagesList from './pages/Site/PagesList';
import PageBuilder from './pages/Site/PageBuilder';
import { AdminNotificationsPage } from './pages/AdminNotificationsPage';
import ResumeBuilder from './pages/AI/ResumeBuilder';
import InterviewSession from './pages/AI/InterviewSession';
import AgentLogs from './pages/AI/AgentLogs';
import AgentWorkspace from './pages/AI/AgentWorkspace';
import LandingPage from './pages/Public/LandingPage';
import ContactPage from './pages/Public/ContactPage';
import FeaturesPage from './pages/Public/FeaturesPage';
import LiveViewer from './pages/Public/LiveViewer';
import { AuthProvider } from './contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Temporary bypass for UI redesign testing
  return children;
};

import ErrorBoundary from './components/ErrorBoundary';

const LegacyBuilderRedirect = () => {
  const { pageId } = useParams();
  return <Navigate to={`/admin/site/canvas/${pageId}`} replace />;
};

import { Toaster } from '@genzite/shared-ui';
import '@genzite/shared-ui/styles.css';


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

const App: React.FC = () => {
  const hostname = window.location.hostname;
  
  let subdomain: string | null = null;
  if (hostname.endsWith('.genzite.com')) {
    const potentialSubdomain = hostname.replace('.genzite.com', '');
    if (potentialSubdomain && potentialSubdomain !== 'www' && potentialSubdomain !== 'app') {
      subdomain = potentialSubdomain;
    }
  } else if (hostname.includes('localhost')) {
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2 && domainParts[0] !== 'www' && domainParts[0] !== 'app' && domainParts[0] !== 'localhost') {
      subdomain = domainParts[0];
    }
  }

  if (subdomain) {
    return (
      <ConfigProvider theme={genziteDarkTheme}>
        <AntdApp>
          <Toaster>
            <ErrorBoundary>
              <Routes>
                <Route path="*" element={<LiveViewer siteId={subdomain} />} />
              </Routes>
            </ErrorBoundary>
          </Toaster>
        </AntdApp>
      </ConfigProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
    <ConfigProvider theme={genziteDarkTheme}>
      <AntdApp>
      <AuthProvider>
        <Toaster>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/live/:pageId" element={<LiveViewer />} />
              <Route path="/login" element={<Login />} />

              {/* Canvas routes — full-bleed, no admin shell */}
              <Route
                path="/admin/site/canvas"
                element={
                  <ProtectedRoute>
                    <CanvasLayout />
                  </ProtectedRoute>
                }
              >
                {/* New unified route: AI Generate + Canvas Builder */}
                <Route index element={<PageBuilder />} />
                <Route path=":siteId" element={<PageBuilder />} />
              </Route>

              {/* Legacy canvas route — redirect for backwards compatibility */}
              <Route
                path="/admin/site/pages/:pageId/builder"
                element={<LegacyBuilderRedirect />}
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="identity" element={<UserManagement />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="cms">
                  <Route index element={<Collections />} />
                  <Route path=":collectionId" element={<DataGrid />} />
                </Route>
                <Route path="site">
                  <Route index element={<SitesList />} />
                  <Route path=":siteId/pages" element={<PagesList />} />
                </Route>
                <Route path="notifications" element={<AdminNotificationsPage />} />

                <Route path="ai">
                  <Route path="resume" element={<ResumeBuilder />} />
                  <Route path="interview" element={<InterviewSession />} />
                  {/* AI Generate now redirects to unified canvas */}
                  <Route path="generate" element={<Navigate to="/admin/site/canvas" replace />} />
                  <Route path="agent" element={<AgentWorkspace />} />
                  <Route path="logs" element={<AgentLogs />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </ErrorBoundary>
        </Toaster>
      </AuthProvider>
      </AntdApp>
    </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
