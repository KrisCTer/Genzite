export interface IMediaLookup {
  findByS3Key(s3Key: string): Promise<{ id: string; filename: string; mimeType: string } | null>;
}
