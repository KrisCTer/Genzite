/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const authStoreToken = useAuthStore((state) => state.token);
  const logoutAuthStore = useAuthStore((state) => state.logout);

  // 1. Sync token from Zustand store to context state
  useEffect(() => {
    if (authStoreToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(authStoreToken);
    } else {
      const storedToken = localStorage.getItem('gz_token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        // Auto-login for local development (AUTH_BYPASS=true on backend)
        const devToken = btoa(`admin@genzite.local:${Date.now()}`);
        setToken(devToken);
        localStorage.setItem('gz_token', devToken);
      }
    }
  }, [authStoreToken]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('gz_token', newToken);
  };

  const logout = async () => {
    setToken(null);
    localStorage.removeItem('gz_token');
    logoutAuthStore();

    // Call Amplify sign out if configured
    const cognitoUserPoolId = import.meta.env.VITE_COGNITO_AUTHORITY?.split('/').pop() || '';
    if (cognitoUserPoolId && !cognitoUserPoolId.includes('xxxxxx')) {
      try {
        const { signOut } = await import('aws-amplify/auth');
        await signOut();
      } catch (err) {
        console.warn('Amplify sign out failed', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
