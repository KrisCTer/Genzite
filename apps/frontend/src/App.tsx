import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ConfigProvider } from 'antd';
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
import NotificationsList from './pages/Notifications/NotificationsList';
import ResumeBuilder from './pages/AI/ResumeBuilder';
import InterviewSession from './pages/AI/InterviewSession';
import AgentLogs from './pages/AI/AgentLogs';
import AgentWorkspace from './pages/AI/AgentWorkspace';
import LandingPage from './pages/Public/LandingPage';
import LiveViewer from './pages/Public/LiveViewer';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Temporary bypass for UI redesign testing
  return children;
};

import ErrorBoundary from './components/ErrorBoundary';

const LegacyBuilderRedirect = () => {
  const { pageId } = useParams();
  return <Navigate to={`/admin/site/canvas/${pageId}`} replace />;
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={genziteDarkTheme}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
            <Route path=":pageId" element={<PageBuilder />} />
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
            <Route path="notifications" element={<NotificationsList />} />

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
    </ConfigProvider>
  );
};

export default App;
