import axios from 'axios';
import { useAuthStore } from '../store/auth';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

const isAuthEndpoint = (url?: string) =>
  !!url && (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password')
  );

apiClient.interceptors.response.use(
  (response) => {
    const d = response.data;
    
    // Guard against APIs returning HTML (e.g. 502 Bad Gateway disguised as 200 OK by proxies/CloudFront)
    if (typeof d === 'string') {
      const lowerD = d.trim().toLowerCase();
      if (lowerD.startsWith('<html') || lowerD.startsWith('<!doctype') || lowerD.includes('502 bad gateway') || lowerD.includes('504 gateway')) {
        return Promise.reject(new Error('API returned HTML/Error instead of JSON'));
      }
    }

    // Auto-unwrap backend responses when they wrap arrays in a named field
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      const ARRAY_KEYS = ['data', 'items', 'pages', 'sites', 'widgets', 'users', 'notifications', 'results', 'records'];
      for (const key of ARRAY_KEYS) {
        if (key in d && Array.isArray(d[key])) {
          // Only unwrap if this is clearly a list-wrapper (has exactly 1-3 keys with meta)
          const keys = Object.keys(d);
          if (keys.length <= 4) {
            response.data = d[key];
            break;
          }
        }
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean; _retryCount?: number };

    // Auto-retry for 504 Gateway Timeout or Network Error (server booting up)
    const isNetworkOrTimeout =
      !error.response ||
      error.response.status === 504 ||
      error.code === 'ECONNREFUSED' ||
      error.message === 'Network Error';

    if (isNetworkOrTimeout && originalRequest) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount += 1;
        console.warn(`[Auto-Retry] Backend might be booting up. Retrying ${originalRequest._retryCount}/3 in 3s...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return apiClient(originalRequest);
      }
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      const refreshToken = localStorage.getItem('gz_refresh_token');
      if (!refreshToken) {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          },
        );

        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        processQueue(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        processQueue(null);
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
