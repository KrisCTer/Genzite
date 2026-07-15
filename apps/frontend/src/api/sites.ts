import apiClient from './client';

export interface Site {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  ownerId: string;
  settings: Record<string, unknown>;
  isPublished: boolean;
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

export const updateSiteApi = async (id: string, data: { name?: string; subdomain?: string; description?: string; settings?: any; isPublished?: boolean }) => {
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

/** Public version — no auth token required. Used by the /live viewer for anonymous access. */
export const fetchWidgetsPublicApi = async (pageId: string) => {
  const response = await apiClient.get<Widget[]>(`/sites/pages/${pageId}/widgets/public`);
  return response.data;
};

export const replaceWidgetsApi = async (pageId: string, widgets: Array<{ type: string; contentConfig: Record<string, unknown>; sortOrder: number }>) => {
  const response = await apiClient.put<Widget[]>(`/sites/pages/${pageId}/widgets`, { widgets });
  return response.data;
};

export const checkSubdomainAvailabilityApi = async (subdomain: string, excludeSiteId?: string) => {
  const url = excludeSiteId ? `/sites/check-subdomain?subdomain=${subdomain}&excludeSiteId=${excludeSiteId}` : `/sites/check-subdomain?subdomain=${subdomain}`;
  const response = await apiClient.get<{ available: boolean }>(url);
  return response.data;
};

export const submitFeedbackApi = async (siteId: string, email: string, bugReportText: string) => {
  const response = await apiClient.post(`/sites/${siteId}/feedback`, { email, bugReportText });
  return response.data;
};

export const duplicateSiteApi = async (id: string) => {
  const response = await apiClient.post<Site>(`/sites/${id}/duplicate`);
  return response.data;
};

export const fetchTrashSitesApi = async () => {
  const response = await apiClient.get<Site[]>('/sites/trash/list');
  return response.data;
};

export const restoreSiteApi = async (id: string) => {
  const response = await apiClient.post(`/sites/${id}/restore`);
  return response.data;
};

export const fetchSiteMetricsApi = async (siteId: string, range: string = '24h') => {
  const response = await apiClient.get(`/sites/${siteId}/observability/metrics`, { params: { range } });
  return response.data;
};

export const fetchSiteLogsApi = async (siteId: string, severity?: string) => {
  const response = await apiClient.get(`/sites/${siteId}/observability/logs`, { params: { severity } });
  return response.data;
};


