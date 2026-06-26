import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWelcomeNotification', () => {
    it('should create notification in database', async () => {
      const mockNotif = { id: 'notif-1' };
      jest.spyOn(prisma.notification, 'create').mockResolvedValue(mockNotif as any);

      await service.createWelcomeNotification('user-1');

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'IN_APP', // Assuming NotificationType.IN_APP resolves to 'IN_APP' in mock or runtime
          title: 'Welcome to Genzite!',
          body: 'Thank you for registering an account.',
          metadata: {
            event: 'user.registered',
          },
        },
      });
    });
  });

  describe('createSiteGeneratedNotification', () => {
    it('should create notification for site generation', async () => {
      jest.spyOn(prisma.notification, 'create').mockResolvedValue({} as any);

      await service.createSiteGeneratedNotification('user-1', 'site-1');

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'IN_APP',
          title: 'Your AI Website is fully initialized!',
          body: 'Please check the automatically generated interface and content.',
          metadata: {
            siteId: 'site-1',
            event: 'site.generated',
          },
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('should update notification status', async () => {
      jest.spyOn(prisma.notification, 'updateMany').mockResolvedValue({ count: 1 } as any);

      await service.markAsRead('notif-1', 'user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { isRead: true },
      });
    });
  });
});
