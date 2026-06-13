import { Injectable } from '@nestjs/common';

@Injectable()
export class DataProducer {
  async emitCollectionCreated(payload: { collectionId: string; siteId: string; name: string }) {
    console.log('[Data] Event emitted: collection.created', payload);
  }

  async emitRecordCreated(payload: { recordId: string; collectionId: string; createdBy: string }) {
    console.log('[Data] Event emitted: record.created', payload);
  }
}
