import apiClient from './client';

export interface Site {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  ownerId: string;
  settings: Record<string, unknown>;
  createdAt: string;
}

export interface Page {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
}

export interface Widget {
  id: string;
  pageId: string;
  type: string;
  contentConfig: Record<string, any>;
  sortOrder: number;
}

// ============ Sites API ============
export const fetchSitesApi = async () => {
  const response = await apiClient.get<Site[]>('/sites');
  return response.data;
};

export const fetchSiteByIdApi = async (id: string) => {
  const response = await apiClient.get<Site>(`/sites/${id}`);
  return response.data;
};

export const createSiteApi = async (data: { name: string; subdomain: string; description?: string }) => {
  const response = await apiClient.post<Site>('/sites', data);
  return response.data;
};

export const updateSiteApi = async (id: string, data: { name?: string; subdomain?: string; settings?: any }) => {
  const response = await apiClient.put<Site>(`/sites/${id}`, data);
  return response.data;
};

export const deleteSiteApi = async (id: string) => {
  const response = await apiClient.delete(`/sites/${id}`);
  return response.data;
};

// ============ Pages API ============
export const fetchPagesApi = async (siteId: string) => {
  const response = await apiClient.get<Page[]>(`/sites/${siteId}/pages`);
  return response.data;
};

export const createPageApi = async (siteId: string, data: { title: string; slug: string }) => {
  const response = await apiClient.post<Page>(`/sites/${siteId}/pages`, data);
  return response.data;
};

export const updatePageApi = async (pageId: string, data: { title?: string; slug?: string; sortOrder?: number }) => {
  const response = await apiClient.put<Page>(`/sites/pages/${pageId}`, data);
  return response.data;
};

export const deletePageApi = async (pageId: string) => {
  const response = await apiClient.delete(`/sites/pages/${pageId}`);
  return response.data;
};

// ============ Widgets API ============
export const fetchWidgetsApi = async (pageId: string) => {
  const response = await apiClient.get<Widget[]>(`/sites/pages/${pageId}/widgets`);
  return response.data;
};

export const replaceWidgetsApi = async (pageId: string, widgets: Array<{ type: string; contentConfig: Record<string, unknown>; sortOrder: number }>) => {
  const response = await apiClient.put<Widget[]>(`/sites/pages/${pageId}/widgets`, { widgets });
  return response.data;
};
