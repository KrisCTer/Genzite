import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AdminLayout from './layouts/AdminLayout';
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
import AIGenerateSite from './pages/AI/AIGenerateSite';
import AgentWorkspace from './pages/AI/AgentWorkspace';
import LandingPage from './pages/Public/LandingPage';
import LiveViewer from './pages/Public/LiveViewer';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Temporary bypass for UI redesign testing
  return children;
};

import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563EB',
          colorSuccess: '#22C55E',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorInfo: '#3B82F6',
          colorTextBase: '#111827',
          colorTextSecondary: '#6B7280',
          colorBgBase: '#FFFFFF',
          colorBgContainer: '#FAFAFB', /* Surface */
          colorBgLayout: '#FFFFFF', /* Background */
          colorBorder: '#E5E7EB',
          colorBorderSecondary: '#ECEEF2',
          fontFamily: "'Inter', system-ui, sans-serif",
          borderRadius: 12, /* Default radius */
          boxShadow: '0 4px 12px rgba(0,0,0,.06)', /* Elevation 2 default for dropdowns/modals */
        },
        components: {
          Layout: {
            headerBg: '#FAFAFB',
            bodyBg: '#FFFFFF',
            siderBg: '#FAFAFB',
          },
          Menu: {
            itemBorderRadius: 12,
            activeBarBorderWidth: 0,
            itemHoverBg: '#F3F4F6',
            itemSelectedBg: '#DBEAFE',
            itemSelectedColor: '#2563EB',
            itemColor: '#111827',
            itemHoverColor: '#111827',
          },
          Card: {
            boxShadow: 'none', /* Level 0 shadow */
            borderRadiusLG: 16,
            headerFontSize: 20,
            colorBorderSecondary: '#E5E7EB',
            paddingLG: 24,
            colorBgContainer: '#FAFAFB',
          },
          Button: {
            borderRadius: 12,
            controlHeight: 44, // Medium by default
            controlHeightSM: 36,
            controlHeightLG: 52,
            paddingInline: 24,
          },
          Input: {
            borderRadius: 12,
            controlHeight: 48,
            paddingInline: 16,
            colorBorder: '#E5E7EB',
          },
          Select: {
            borderRadius: 12,
            controlHeight: 48,
          },
          Table: {
            headerBg: '#FFFFFF',
            headerColor: '#111827',
            borderRadius: 12,
            borderColor: '#E5E7EB',
            rowHoverBg: '#F3F4F6',
          },
          Modal: {
            borderRadiusLG: 20,
            paddingLG: 32,
            paddingMD: 32,
          }
        }
      }}
    >
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/live/:pageId" element={<LiveViewer />} />
          <Route path="/login" element={<Login />} />
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
              <Route path="pages/:pageId/builder" element={<PageBuilder />} />
            </Route>
            <Route path="notifications" element={<NotificationsList />} />

            <Route path="ai">
              <Route path="resume" element={<ResumeBuilder />} />
              <Route path="interview" element={<InterviewSession />} />
              <Route path="logs" element={<AgentLogs />} />
              <Route path="generate" element={<AIGenerateSite />} />
              <Route path="agent" element={<AgentWorkspace />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ErrorBoundary>
    </ConfigProvider>
  );
};

export default App;
