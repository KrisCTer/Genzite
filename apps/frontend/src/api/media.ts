import axios from 'axios';
import apiClient from './client';

export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

const BUCKET_NAME = 'genzite-media-dev-khoa-811046140260-us-east-1-an';
const REGION = 'us-east-1';

export const fetchMediaFilesApi = async () => {
  const response = await apiClient.get<any[]>('/media');
  return response.data.map((file) => ({
    id: file.id,
    filename: file.filename,
    mimeType: file.mimeType,
    size: file.sizeBytes ?? file.size ?? 0,
    uploadedAt: file.createdAt ?? file.uploadedAt ?? new Date().toISOString(),
    url: file.url ?? `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${file.s3Key}`,
  })) as MediaFile[];
};

export const uploadMediaFileApi = async (file: File, onUploadProgress?: (progressEvent: any) => void) => {
  // 1. Get presigned URL from Genzite Media Service
  const presignedResponse = await apiClient.post<{ uploadUrl: string; s3Key: string }>('/media/presigned-url', {
    filename: file.name,
    mimeType: file.type,
  });

  const { uploadUrl, s3Key } = presignedResponse.data;

  // 2. Upload file directly to AWS S3 using plain axios (no authorization bearer header interceptor)
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: onUploadProgress ? (progressEvent) => {
      onUploadProgress(progressEvent);
    } : undefined,
  });

  // 3. Confirm upload to Genzite Media Service
  const confirmResponse = await apiClient.post<any>('/media/confirm', {
    s3Key,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  const confirmedFile = confirmResponse.data;

  return {
    id: confirmedFile.id,
    filename: confirmedFile.filename,
    mimeType: confirmedFile.mimeType,
    size: confirmedFile.sizeBytes ?? confirmedFile.size ?? 0,
    uploadedAt: confirmedFile.createdAt ?? confirmedFile.uploadedAt ?? new Date().toISOString(),
    url: confirmedFile.url ?? `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${confirmedFile.s3Key}`,
  } as MediaFile;
};
