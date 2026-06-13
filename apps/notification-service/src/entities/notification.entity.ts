export interface INotificationEntity {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'EMAIL' | 'PUSH' | 'IN_APP';
  isRead: boolean;
  createdAt: Date;
}

export interface INotificationTemplateEntity {
  id: string;
  name: string;
  subject: string;
  bodyTemplate: string;
  type: 'EMAIL' | 'PUSH' | 'IN_APP';
}
