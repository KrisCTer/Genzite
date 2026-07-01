import apiClient from './client';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  schema: Record<string, any>; // JSON schema
  createdAt: string;
}

export interface RecordData {
  id: string;
  collectionId: string;
  data: Record<string, any>; // JSONB data
  createdAt: string;
}

// ================= Collections API =================
export const fetchCollectionsApi = async () => {
  const response = await apiClient.get<Collection[]>('/cms/collections');
  return response.data;
};

export const createCollectionApi = async (data: { name: string; slug: string; schema: any }) => {
  const response = await apiClient.post<Collection>('/cms/collections', data);
  return response.data;
};

export const deleteCollectionApi = async (id: string) => {
  const response = await apiClient.delete(`/cms/collections/${id}`);
  return response.data;
};

// ================= Records API =================
export const fetchRecordsApi = async (collectionId: string) => {
  const response = await apiClient.get<RecordData[]>(`/cms/collections/${collectionId}/records`);
  return response.data;
};

export const createRecordApi = async (collectionId: string, data: { data: any }) => {
  const response = await apiClient.post<RecordData>(`/cms/collections/${collectionId}/records`, data);
  return response.data;
};

export const deleteRecordApi = async (collectionId: string, recordId: string) => {
  const response = await apiClient.delete(`/cms/collections/${collectionId}/records/${recordId}`);
  return response.data;
};
