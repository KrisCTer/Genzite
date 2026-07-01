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
  type: "user.registered";
  payload: {
    userId: string;
    email: string;
    name: string;
  };
}

export interface UserUpdatedEvent extends BaseEvent {
  type: "user.updated";
  payload: {
    userId: string;
    changes: Record<string, unknown>;
  };
}

export interface RoleAssignedEvent extends BaseEvent {
  type: "role.assigned";
  payload: {
    userId: string;
    roleName: string;
  };
}

// --- Site Events ---
export interface SiteCreatedEvent extends BaseEvent {
  type: "site.created";
  payload: {
    siteId: string;
    name: string;
    subdomain: string;
    ownerId: string;
  };
}

export interface PageUpdatedEvent extends BaseEvent {
  type: "page.updated";
  payload: {
    pageId: string;
    siteId: string;
    title: string;
  };
}
// --- Widget Events ---
export interface WidgetConfigChangedEvent extends BaseEvent {
  type: "widget.config-changed";
  payload: {
    pageId: string;
    siteId: string;
    widgetCount: number;
  };
}
// --- Data (CMS) Events ---
export interface CollectionCreatedEvent extends BaseEvent {
  type: "collection.created";
  payload: {
    collectionId: string;
    siteId: string;
    name: string;
  };
}

export interface RecordCreatedEvent extends BaseEvent {
  type: "record.created";
  payload: {
    recordId: string;
    collectionId: string;
    createdBy: string;
  };
}

export interface RecordUpdatedEvent extends BaseEvent {
  type: 'record.updated';
  payload: {
    recordId: string;
    collectionId: string;
    updatedBy: string;
  };
}

export interface RecordDeletedEvent extends BaseEvent {
  type: 'record.deleted';
  payload: {
    recordId: string;
    collectionId: string;
  };
}

export interface CollectionUpdatedEvent extends BaseEvent {
  type: 'collection.updated';
  payload: {
    collectionId: string;
    siteId: string;
    name: string;
  };
}

export interface CollectionDeletedEvent extends BaseEvent {
  type: 'collection.deleted';
  payload: {
    collectionId: string;
    siteId: string;
  };
}

// --- Media Events ---
export interface MediaUploadedEvent extends BaseEvent {
  type: "media.uploaded";
  payload: {
    mediaId: string;
    s3Key: string;
    filename: string;
    mimeType: string;
    ownerId: string;
  };
}

export interface MediaDeletedEvent extends BaseEvent {
  type: "media.deleted";
  payload: {
    mediaId: string;
    s3Key: string;
    ownerId: string;
  };
}

// --- AI Events ---
export interface SiteGeneratedEvent extends BaseEvent {
  type: "site.generated";
  payload: {
    siteId: string;
    prompt: string;
    ownerId: string;
    siteData?: any; // Contains the generated JSON structure (pages, widgets)
  };
}

export interface CmsGeneratedEvent extends BaseEvent {
  type: 'cms.generated';
  payload: {
    siteId: string;
    prompt: string;
    ownerId: string;
  };
}


export interface ResumeAnalyzedEvent extends BaseEvent {
  type: "resume.analyzed";
  payload: {
    resumeId: string;
    ownerId: string;
    atsScore: number;
  };
}

export interface InterviewCompletedEvent extends BaseEvent {
  type: "interview.completed";
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
  | CollectionUpdatedEvent
  | CollectionDeletedEvent
  | RecordCreatedEvent
  | RecordUpdatedEvent
  | RecordDeletedEvent
  | MediaUploadedEvent
  | MediaDeletedEvent
  | SiteGeneratedEvent
  | CmsGeneratedEvent
  | ResumeAnalyzedEvent
  | InterviewCompletedEvent
  | WidgetConfigChangedEvent;

// --- Kafka Topic Names ---
export const KAFKA_TOPICS = {
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  ROLE_ASSIGNED: 'role.assigned',
  SITE_CREATED: 'site.created',
  PAGE_UPDATED: 'page.updated',
  WIDGET_CONFIG_CHANGED: 'widget.config-changed',
  COLLECTION_CREATED: 'collection.created',
  COLLECTION_UPDATED: 'collection.updated',
  COLLECTION_DELETED: 'collection.deleted',
  RECORD_CREATED: 'record.created',
  RECORD_UPDATED: 'record.updated',
  RECORD_DELETED: 'record.deleted',
  MEDIA_UPLOADED: 'media.uploaded',
  MEDIA_DELETED: 'media.deleted',
  SITE_GENERATED: 'site.generated',
  CMS_GENERATED: 'cms.generated',
  RESUME_ANALYZED: 'resume.analyzed',
  INTERVIEW_COMPLETED: 'interview.completed',
  AUDIT_LOG: 'audit.log',
  ORDER_CREATED: 'order.created',
  PAYMENT_COMPLETED: 'payment.completed',
} as const;


export type KafkaTopicName = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

export const KAFKA_CONSUMER_GROUPS = {
  NOTIFICATION: "notification-service-group",
  AI: "ai-service-group",
  DATA: "data-service-group",
} as const;
