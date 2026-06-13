// =============================================
// Kafka Event Payload Types
// =============================================

// --- Base Event ---
export interface BaseEvent {
  eventId: string;
  timestamp: string;
  source: string;
}

// --- Identity Events ---
export interface UserRegisteredEvent extends BaseEvent {
  type: 'user.registered';
  payload: {
    userId: string;
    email: string;
    name: string;
  };
}

export interface UserUpdatedEvent extends BaseEvent {
  type: 'user.updated';
  payload: {
    userId: string;
    changes: Record<string, unknown>;
  };
}

export interface RoleAssignedEvent extends BaseEvent {
  type: 'role.assigned';
  payload: {
    userId: string;
    roleName: string;
  };
}

// --- Site Events ---
export interface SiteCreatedEvent extends BaseEvent {
  type: 'site.created';
  payload: {
    siteId: string;
    name: string;
    subdomain: string;
    ownerId: string;
  };
}

export interface PageUpdatedEvent extends BaseEvent {
  type: 'page.updated';
  payload: {
    pageId: string;
    siteId: string;
    title: string;
  };
}

// --- Data (CMS) Events ---
export interface CollectionCreatedEvent extends BaseEvent {
  type: 'collection.created';
  payload: {
    collectionId: string;
    siteId: string;
    name: string;
  };
}

export interface RecordCreatedEvent extends BaseEvent {
  type: 'record.created';
  payload: {
    recordId: string;
    collectionId: string;
    createdBy: string;
  };
}

// --- Media Events ---
export interface MediaUploadedEvent extends BaseEvent {
  type: 'media.uploaded';
  payload: {
    mediaId: string;
    s3Key: string;
    filename: string;
    mimeType: string;
    ownerId: string;
  };
}

// --- AI Events ---
export interface SiteGeneratedEvent extends BaseEvent {
  type: 'site.generated';
  payload: {
    siteId: string;
    prompt: string;
    ownerId: string;
  };
}

export interface ResumeAnalyzedEvent extends BaseEvent {
  type: 'resume.analyzed';
  payload: {
    resumeId: string;
    ownerId: string;
    atsScore: number;
  };
}

export interface InterviewCompletedEvent extends BaseEvent {
  type: 'interview.completed';
  payload: {
    sessionId: string;
    resumeId: string;
    ownerId: string;
    overallScore: number;
  };
}

// --- Union type for all events ---
export type GenziteEvent =
  | UserRegisteredEvent
  | UserUpdatedEvent
  | RoleAssignedEvent
  | SiteCreatedEvent
  | PageUpdatedEvent
  | CollectionCreatedEvent
  | RecordCreatedEvent
  | MediaUploadedEvent
  | SiteGeneratedEvent
  | ResumeAnalyzedEvent
  | InterviewCompletedEvent;

// --- Kafka Topic Names ---
export const KAFKA_TOPICS = {
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  ROLE_ASSIGNED: 'role.assigned',
  SITE_CREATED: 'site.created',
  PAGE_UPDATED: 'page.updated',
  COLLECTION_CREATED: 'collection.created',
  RECORD_CREATED: 'record.created',
  MEDIA_UPLOADED: 'media.uploaded',
  SITE_GENERATED: 'site.generated',
  RESUME_ANALYZED: 'resume.analyzed',
  INTERVIEW_COMPLETED: 'interview.completed',
  AUDIT_LOG: 'audit.log',
} as const;
