export interface ICmsCollectionEntity {
  id: string;
  siteId: string;
  name: string;
  slug: string;
  description: string | null;
  schemaDefinition: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICmsRecordEntity {
  id: string;
  collectionId: string;
  data: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
