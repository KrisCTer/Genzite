import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaProducer {
  async emitMediaUploaded(payload: { mediaId: string; s3Key: string; filename: string; mimeType: string; ownerId: string }) {
    console.log('[Media] Event emitted: media.uploaded', payload);
  }
}
