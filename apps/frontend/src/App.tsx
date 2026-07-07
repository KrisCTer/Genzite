import React, { useEffect } from 'react';
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { genziteDarkTheme } from './styles/theme';
import { useAuthStore } from './store/auth';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from '@genzite/shared-ui';
import '@genzite/shared-ui/styles.css';
import { getMeApi } from './api/users';
import { resolveUserRoles } from './utils/jwt';
import {
  normalizeRoles,
  STAFF_ROLES,
  VIEWER_ROLES,
  getMemberFallbackPath,
  getPostLoginPath,
  hasStaffAccess,
  ADMIN_BASE,
  WORKSPACE_BASE,
} from './utils/userNav';

const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const CanvasLayout = lazy(() => import('./layouts/CanvasLayout'));

const LandingPage = lazy(() => import('./pages/Public/LandingPage'));
const LiveViewer = lazy(() => import('./pages/Public/LiveViewer'));
const PreviewViewer = lazy(() => import('./pages/Site/PreviewViewer'));
const Login = lazy(() => import('./pages/Auth/Login'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

const StaffDashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const MemberDashboard = lazy(() => import('./pages/Dashboard/MemberDashboard'));
const Profile = lazy(() => import('./pages/Identity/Profile'));
const UserManagement = lazy(() => import('./pages/Identity/UserManagement'));
const MediaLibrary = lazy(() => import('./pages/Media/MediaLibrary'));
const Collections = lazy(() => import('./pages/CMS/Collections'));
const DataGrid = lazy(() => import('./pages/CMS/DataGrid'));
const SitesList = lazy(() => import('./pages/Site/SitesList'));
const PagesList = lazy(() => import('./pages/Site/PagesList'));
const PageBuilder = lazy(() => import('./pages/Site/PageBuilder'));

const ResumeBuilder = lazy(() => import('./pages/AI/ResumeBuilder'));
const InterviewSession = lazy(() => import('./pages/AI/InterviewSession'));
const AgentLogs = lazy(() => import('./pages/AI/AgentLogs'));
const AgentWorkspace = lazy(() => import('./pages/AI/AgentWorkspace'));
const AdminNotificationsPage = lazy(() => import('./pages/AdminNotificationsPage'));

const FullPageLoader = () => (
  <div className="min-h-screen bg-[#030712] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireViewer = false,
  requireRoles,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireViewer?: boolean;
  requireRoles?: string[];
}) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  useEffect(() => {
    if (token && !user) {
      getMeApi()
        .then((me) => setAuth(token, me as any, refreshToken ?? undefined))
        .catch(() => useAuthStore.getState().logout());
    }
  }, [token, user, setAuth, refreshToken]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const effectiveRoles = normalizeRoles(resolveUserRoles(user?.roles, token));

  let rolesToCheck = requireRoles;
  if (!rolesToCheck) {
    if (requireAdmin) rolesToCheck = [...STAFF_ROLES];
    else if (requireViewer) rolesToCheck = [...VIEWER_ROLES];
  }

  if (rolesToCheck?.length && !user && !effectiveRoles.length) {
    return <FullPageLoader />;
  }

  if (rolesToCheck?.length) {
    const allowed = effectiveRoles.some((r) => rolesToCheck!.includes(r));
    if (!allowed) {
      return <Navigate to={getMemberFallbackPath(effectiveRoles)} replace state={{ from: 'forbidden' }} />;
    }
  }

  if (requireAdmin && !hasStaffAccess(effectiveRoles)) {
    return <Navigate to={WORKSPACE_BASE} replace />;
  }

  if (requireViewer && hasStaffAccess(effectiveRoles)) {
    return <Navigate to={ADMIN_BASE} replace />;
  }

  return <>{children}</>;
};

const LegacyBuilderRedirect = () => {
  const { pageId } = useParams();
  return <Navigate to={`${ADMIN_BASE}/site/canvas/${pageId}`} replace />;
};

const AuthenticatedHomeRedirect = () => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  if (!token) return <Navigate to="/login" replace />;
  const roles = normalizeRoles(resolveUserRoles(user?.roles, token));
  return <Navigate to={getPostLoginPath(roles)} replace />;
};

const memberAiRoutes = (
  <>
    <Route path="ai">
      <Route path="resume" element={<ResumeBuilder />} />
      <Route path="interview" element={<InterviewSession />} />
      <Route path="generate" element={<Navigate to={`${WORKSPACE_BASE}/site/canvas`} replace />} />
      <Route path="agent" element={<AgentWorkspace />} />
    </Route>
  </>
);

const staffAiRoutes = (
  <>
    <Route path="ai">
      <Route path="resume" element={<ResumeBuilder />} />
      <Route path="interview" element={<InterviewSession />} />
      <Route path="generate" element={<Navigate to={`${ADMIN_BASE}/site/canvas`} replace />} />
      <Route path="agent" element={<AgentWorkspace />} />
      <Route path="logs" element={<AgentLogs />} />
    </Route>
  </>
);

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
              <Suspense fallback={<FullPageLoader />}>
                <Routes>
                  <Route path="*" element={<LiveViewer siteId={subdomain} />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Toaster>
        </AntdApp>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={genziteDarkTheme}>
      <AntdApp>
        <Toaster>
          <ErrorBoundary>
            <Suspense fallback={<FullPageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/features" element={<LandingPage />} />
                <Route path="/contact" element={<LandingPage />} />
                <Route path="/live/:pageId" element={<LiveViewer />} />
                <Route path="/preview/:siteId" element={<PreviewViewer />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Canvas Builder (Global for all authenticated users) */}
                <Route
                  path="/project"
                  element={
                    <ProtectedRoute requireViewer>
                      <CanvasLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<PageBuilder />} />
                  <Route path=":siteId" element={<PageBuilder />} />
                </Route>

                <Route
                  path={WORKSPACE_BASE}
                  element={
                    <ProtectedRoute requireViewer>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<MemberDashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  {memberAiRoutes}
                </Route>



                <Route path={`${ADMIN_BASE}/site/pages/:pageId/builder`} element={<LegacyBuilderRedirect />} />

                <Route
                  path={ADMIN_BASE}
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StaffDashboard />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  <Route
                    path="identity"
                    element={
                      <ProtectedRoute requireRoles={['ADMIN']}>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="cms">
                    <Route index element={<Collections />} />
                    <Route path=":collectionId" element={<DataGrid />} />
                  </Route>
                  <Route path="site">
                    <Route index element={<SitesList />} />
                    <Route path=":siteId/pages" element={<PagesList />} />
                  </Route>
                  {staffAiRoutes}
                </Route>

                <Route path="*" element={<AuthenticatedHomeRedirect />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Toaster>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
