import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@genzite/shared-ui';
import '@genzite/shared-ui/styles.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { CmsDashboardPage } from './pages/CmsDashboardPage';
import { AppBuilderPage } from './pages/AppBuilderPage';
import { GeneratorPage } from './pages/GeneratorPage';

// Simple protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Layout wrapper for the GeneratorPage since it doesn't use the standard AppShell header
// but still requires authentication.
const GeneratorLayout: React.FC = () => {
  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <a
          href="/cms"
          className="px-4 py-2 bg-zinc-800/80 backdrop-blur text-white rounded-full text-sm hover:bg-zinc-700 transition-colors shadow-lg border border-zinc-700"
        >
          ← Back to CMS
        </a>
      </div>
      <GeneratorPage />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes with Standard AppShell Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/cms" replace />} />
        <Route path="cms" element={<CmsDashboardPage />} />
        <Route path="builder" element={<AppBuilderPage />} />
      </Route>

      {/* Protected Route with Custom Layout */}
      <Route
        path="/ai"
        element={
          <ProtectedRoute>
            <GeneratorLayout />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster>
          <AppRoutes />
        </Toaster>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
