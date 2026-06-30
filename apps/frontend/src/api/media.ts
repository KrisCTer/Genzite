import apiClient from './client';

export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export const fetchMediaFilesApi = async () => {
  const response = await apiClient.get<MediaFile[]>('/media');
  return response.data;
};

export const uploadMediaFileApi = async (file: File, onUploadProgress?: (progressEvent: any) => void) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<MediaFile>('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};
