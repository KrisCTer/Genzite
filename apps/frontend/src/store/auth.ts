import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  avatarUrl?: string | null;
  status: 'ACTIVE' | 'LOCKED' | 'INACTIVE';
  createdAt: string;
  metadata?: any;
  credits?: number;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User, refreshToken?: string) => void;
  setTokens: (token: string, refreshToken?: string) => void;
  patchUser: (partial: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('gz_token') || null,
  refreshToken: localStorage.getItem('gz_refresh_token') || null,
  user: (() => {
    try {
      const data = localStorage.getItem('user_data');
      if (!data || data === 'undefined') return null;
      const parsed = JSON.parse(data);
      if (!parsed?.roles || !Array.isArray(parsed.roles)) return null;
      return parsed;
    } catch {
      return null;
    }
  })(),
  setAuth: (token, user, refreshToken) => {
    localStorage.setItem('gz_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem('gz_refresh_token', refreshToken);
    }
    set({ token, user, refreshToken: refreshToken ?? localStorage.getItem('gz_refresh_token') });
  },
  setTokens: (token, refreshToken) => {
    localStorage.setItem('gz_token', token);
    if (refreshToken) {
      localStorage.setItem('gz_refresh_token', refreshToken);
    }
    set({
      token,
      refreshToken: refreshToken ?? localStorage.getItem('gz_refresh_token'),
    });
  },
  patchUser: (partial) =>
    set((state) => {
      if (!state.user) return state;
      const hasChange = (Object.keys(partial) as (keyof User)[]).some(
        (key) => state.user![key] !== partial[key],
      );
      if (!hasChange) return state;
      const user = { ...state.user, ...partial };
      localStorage.setItem('user_data', JSON.stringify(user));
      return { user };
    }),
  logout: () => {
    localStorage.removeItem('gz_token');
    localStorage.removeItem('gz_refresh_token');
    localStorage.removeItem('user_data');

    // Call Amplify sign out if configured
    const cognitoUserPoolId = import.meta.env.VITE_COGNITO_AUTHORITY?.split('/').pop() || '';
    if (cognitoUserPoolId && !cognitoUserPoolId.includes('xxxxxx')) {
      import('aws-amplify/auth').then(({ signOut }) => signOut()).catch(err => {
        console.warn('Amplify sign out failed', err);
      });
    }

    set({ token: null, refreshToken: null, user: null });
  },
}));
