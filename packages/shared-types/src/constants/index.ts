// =============================================
// Shared Constants
// =============================================

// --- API Route Prefixes ---
export const API_PREFIX = 'api/v1';

export const SERVICE_ROUTES = {
  IDENTITY: `${API_PREFIX}/auth`,
  USERS: `${API_PREFIX}/users`,
  SITES: `${API_PREFIX}/sites`,
  CMS: `${API_PREFIX}/cms`,
  MEDIA: `${API_PREFIX}/media`,
  NOTIFICATIONS: `${API_PREFIX}/notifications`,
  AI: `${API_PREFIX}/ai`,
} as const;

// --- Service Ports ---
export const SERVICE_PORTS = {
  GATEWAY: 3000,
  IDENTITY: 3001,
  SITE: 3002,
  DATA: 3003,
  MEDIA: 3004,
  NOTIFICATION: 3005,
  AI: 3006,
} as const;

// --- Error Codes ---
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',
  MEDIA_UPLOAD_FAILED: 'MEDIA_UPLOAD_FAILED',
} as const;

// --- Roles ---
export const ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
  CANDIDATE: 'CANDIDATE',
} as const;

// --- Interview Session Types ---
export const SESSION_TYPES = {
  TECHNICAL: 'TECHNICAL',
  BEHAVIORAL: 'BEHAVIORAL',
  MIXED: 'MIXED',
} as const;

// --- Interview Session Status ---
export const SESSION_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

// --- Widget Types ---
export const WIDGET_TYPES = {
  HEADER: 'HEADER',
  HERO: 'HERO',
  CARD: 'CARD',
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FORM: 'FORM',
  FOOTER: 'FOOTER',
  GALLERY: 'GALLERY',
  PRICING: 'PRICING',
  TESTIMONIAL: 'TESTIMONIAL',
} as const;
