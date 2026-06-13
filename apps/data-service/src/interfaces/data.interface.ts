export interface ICollectionLookup {
  findById(id: string): Promise<{ id: string; siteId: string; name: string; schemaDefinition: Record<string, unknown> } | null>;
}
