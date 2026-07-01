// =============================================
// Shared DTO Types
// =============================================

// --- Pagination ---
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Identity ---
export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
}

export interface LoginResponseDto {
  accessToken: string;
  expiresIn: number;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// --- Site ---
export interface SiteDto {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  ownerId: string;
  settings: Record<string, unknown>;
  createdAt: string;
}

export interface CreateSiteDto {
  name: string;
  subdomain: string;
  description?: string;
}

export interface PageDto {
  id: string;
  siteId: string;
  title: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
}

export interface CreatePageDto {
  title: string;
  slug: string;
}

export interface WidgetDto {
  id: string;
  pageId: string;
  type: WidgetType;
  contentConfig: Record<string, unknown>;
  sortOrder: number;
}

export type WidgetType = 'HEADER' | 'HERO' | 'CARD' | 'TEXT' | 'IMAGE' | 'FORM' | 'FOOTER' | 'GALLERY' | 'PRICING' | 'TESTIMONIAL' | 'FEATURES' | 'CTA' | 'STATS' | 'FAQ' | 'CONTACT' | 'PRODUCT_GRID' | 'CART' | 'CHECKOUT' | 'SEARCH' | 'ORDER_TABLE' | 'ADMIN_PANEL' | 'PAYMENT_STATUS';

export interface UpdateWidgetsDto {
  widgets: Array<{
    type: WidgetType;
    contentConfig: Record<string, unknown>;
    sortOrder: number;
  }>;
}

// --- Data (Dynamic CMS) ---
export interface CmsCollectionDto {
  id: string;
  siteId: string;
  name: string;
  schemaDefinition: Record<string, unknown>;
  createdAt: string;
}

export interface CreateCollectionDto {
  siteId: string;
  name: string;
  schemaDefinition: Record<string, unknown>;
}

export interface CmsRecordDto {
  id: string;
  collectionId: string;
  data: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecordDto {
  data: Record<string, unknown>;
}

// --- Media ---
export interface MediaDto {
  id: string;
  filename: string;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
  ownerId: string;
  createdAt: string;
}

export interface PresignedUrlRequestDto {
  filename: string;
  mimeType: string;
}

export interface PresignedUrlResponseDto {
  uploadUrl: string;
  s3Key: string;
}

export interface ConfirmUploadDto {
  s3Key: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
}

// --- AI ---
export interface GenerateSiteRequestDto {
  prompt: string;
}

export interface GenerateCmsRequestDto {
  siteId: string;
  prompt: string;
}

export interface AnalyzeCvRequestDto {
  resumeId: string;
  jobDescription: string;
}

export interface AnalyzeCvResponseDto {
  atsScore: number;
  missingSkills: string[];
  keywordOptimization: string[];
  compatibilityReport: string;
}

export interface StartInterviewDto {
  resumeId: string;
  jobDescription: string;
  sessionType: 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED';
}

export interface InterviewChatDto {
  message: string;
}

export interface InterviewChatResponseDto {
  feedback: string;
  score: number;
  nextQuestion: string | null;
  isComplete: boolean;
}

export interface InterviewEvaluationDto {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  studyRecommendations: Array<{
    topic: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    resources: string[];
  }>;
}

// --- Notification ---
export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'EMAIL' | 'PUSH' | 'IN_APP';
  isRead: boolean;
  createdAt: string;
}
