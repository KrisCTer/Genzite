import { Test, TestingModule } from '@nestjs/testing';
import { UserConsumer } from './user.consumer';
import { NotificationsService } from '../in-app/notifications.service';
import { EmailService } from '../email/email.service';
import { KafkaConsumerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

describe('UserConsumer', () => {
  let consumer: UserConsumer;
  let notificationsService: NotificationsService;
  let kafkaConsumer: KafkaConsumerService;
  let emailService: EmailService;
  
  // Store callbacks
  const topicHandlers: Record<string, Function> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserConsumer,
        {
          provide: NotificationsService,
          useValue: {
            createWelcomeNotification: jest.fn(),
            createSiteCreatedNotification: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
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

    consumer = module.get<UserConsumer>(UserConsumer);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    kafkaConsumer = module.get<KafkaConsumerService>(KafkaConsumerService);
    emailService = module.get<EmailService>(EmailService);
    
    // Call onModuleInit to register subscriptions
    await consumer.onModuleInit();
  });

  describe('USER_REGISTERED', () => {
    it('should call createWelcomeNotification and sendEmail', async () => {
      const payload = { userId: 'user-1', email: 'test@test.com', name: 'Test' };
      
      const handler = topicHandlers[KAFKA_TOPICS.USER_REGISTERED];
      expect(handler).toBeDefined();
      
      await handler({ payload });
      
      expect(notificationsService.createWelcomeNotification).toHaveBeenCalledWith('user-1');
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        'test@test.com',
        'Welcome to Genzite!',
        'Thank you for registering an account.'
      );
    });
  });

  describe('SITE_CREATED', () => {
    it('should call createSiteCreatedNotification', async () => {
      const payload = { ownerId: 'user-1', siteId: 'site-1', name: 'My Site' };
      
      const handler = topicHandlers[KAFKA_TOPICS.SITE_CREATED];
      expect(handler).toBeDefined();
      
      await handler({ payload });
      
      expect(notificationsService.createSiteCreatedNotification).toHaveBeenCalledWith('user-1', 'site-1', 'My Site');
    });
  });
});
