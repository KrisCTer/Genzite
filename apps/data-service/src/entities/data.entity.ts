export interface ICmsCollectionEntity {
  id: string;
  siteId: string;
  name: string;
  schemaDefinition: Record<string, unknown>;
  createdAt: Date;
}

export interface ICmsRecordEntity {
  id: string;
  collectionId: string;
  data: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
