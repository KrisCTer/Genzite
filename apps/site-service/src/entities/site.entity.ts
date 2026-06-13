export interface ISiteEntity {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  ownerId: string;
  settings: Record<string, unknown>;
  createdAt: Date;
}

export interface IPageEntity {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  sortOrder: number;
  createdAt: Date;
}

export interface IWidgetEntity {
  id: string;
  pageId: string;
  type: string;
  contentConfig: Record<string, unknown>;
  sortOrder: number;
}
