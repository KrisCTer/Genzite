import axios from 'axios';
import apiClient from './client';

const BUCKET_NAME = 'genzite-media-dev-khoa-811046140260-us-east-1-an';
const REGION = 'us-east-1';

export interface MediaFile {
  id: string;
  filename: string;
  url: string;
  s3Key: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export const fetchMediaFilesApi = async () => {
  const response = await apiClient.get<MediaFile[]>('/media');
  return response.data.map((file) => ({
    ...file,
    url: file.url ?? `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${file.s3Key}`,
  }));
};

const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // Only convert image files (excluding svg/gif where webp conversion might break animation/vector)
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif' || file.type === 'image/webp') {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return resolve(file);
        
        const newFilename = file.name.replace(/\.[^/.]+$/, "") + '.webp';
        const webpFile = new File([blob], newFilename, {
          type: 'image/webp',
          lastModified: Date.now(),
        });
        
        resolve(webpFile);
      }, 'image/webp', 0.85);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original if decoding fails
    };
    
    img.src = objectUrl;
  });
};

export const uploadMediaFileApi = async (originalFile: File, onUploadProgress?: (progressEvent: any) => void) => {
  const file = await convertToWebP(originalFile);

  // 1. Get presigned URL
  const presignedRes = await apiClient.post<{ uploadUrl: string; s3Key: string }>('/media/presigned-url', {
    filename: file.name,
    mimeType: file.type,
  });
  
  const { uploadUrl, s3Key } = presignedRes.data;

  // 2. Upload file directly to S3/MinIO using the presigned URL
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress,
  });

  // 3. Confirm upload with the backend
  const confirmRes = await apiClient.post<MediaFile>('/media/confirm', {
    s3Key,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  const confirmed = confirmRes.data;
  return {
    ...confirmed,
    url: confirmed.url ?? `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${confirmed.s3Key}`,
  };
};
