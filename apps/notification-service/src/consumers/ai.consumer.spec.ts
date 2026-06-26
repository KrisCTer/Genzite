import { Test, TestingModule } from '@nestjs/testing';
import { AiConsumer } from './ai.consumer';
import { NotificationsService } from '../in-app/notifications.service';
import { KafkaConsumerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

describe('AiConsumer', () => {
  let consumer: AiConsumer;
  let notificationsService: NotificationsService;
  let kafkaConsumer: KafkaConsumerService;
  
  // Store callbacks
  const topicHandlers: Record<string, Function> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiConsumer,
        {
          provide: NotificationsService,
          useValue: {
            createSiteGeneratedNotification: jest.fn(),
            createCmsGeneratedNotification: jest.fn(),
            createResumeAnalyzedNotification: jest.fn(),
            createInterviewCompletedNotification: jest.fn(),
          },
        },
        {
          provide: KafkaConsumerService,
          useValue: {
            subscribe: jest.fn().mockImplementation((topic: string, callback: Function) => {
              topicHandlers[topic] = callback;
            }),
          },
        },
      ],
    }).compile();

    consumer = module.get<AiConsumer>(AiConsumer);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    kafkaConsumer = module.get<KafkaConsumerService>(KafkaConsumerService);
    
    // Call onModuleInit to register subscriptions
    await consumer.onModuleInit();
  });

  describe('SITE_GENERATED', () => {
    it('should call createSiteGeneratedNotification', async () => {
      const payload = { ownerId: 'user-1', siteId: 'site-1' };
      
      const handler = topicHandlers[KAFKA_TOPICS.SITE_GENERATED];
      expect(handler).toBeDefined();
      
      await handler({ payload });
      
      expect(notificationsService.createSiteGeneratedNotification).toHaveBeenCalledWith('user-1', 'site-1');
    });
  });

  describe('CMS_GENERATED', () => {
    it('should call createCmsGeneratedNotification', async () => {
      const payload = { ownerId: 'user-1', siteId: 'site-1' };
      
      const handler = topicHandlers[KAFKA_TOPICS.CMS_GENERATED];
      expect(handler).toBeDefined();
      
      await handler({ payload });
      
      expect(notificationsService.createCmsGeneratedNotification).toHaveBeenCalledWith('user-1', 'site-1');
    });
  });

  describe('RESUME_ANALYZED', () => {
    it('should call createResumeAnalyzedNotification', async () => {
      const payload = { ownerId: 'user-1', resumeId: 'resume-1', atsScore: 85 };
      
      const handler = topicHandlers[KAFKA_TOPICS.RESUME_ANALYZED];
      expect(handler).toBeDefined();
      
      await handler({ payload });
      
      expect(notificationsService.createResumeAnalyzedNotification).toHaveBeenCalledWith('user-1', 'resume-1', 85);
    });
  });

  describe('INTERVIEW_COMPLETED', () => {
    it('should call createInterviewCompletedNotification', async () => {
      const payload = { ownerId: 'user-1', sessionId: 'session-1', resumeId: 'resume-1', overallScore: 90 };
      
      const handler = topicHandlers[KAFKA_TOPICS.INTERVIEW_COMPLETED];
      expect(handler).toBeDefined();
      
      await handler({ payload });
      
      expect(notificationsService.createInterviewCompletedNotification).toHaveBeenCalledWith('user-1', 'session-1', 'resume-1', 90);
    });
  });
});
