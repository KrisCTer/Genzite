export interface IMediaEntity {
  id: string;
  filename: string;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
  ownerId: string;
  createdAt: Date;
}
