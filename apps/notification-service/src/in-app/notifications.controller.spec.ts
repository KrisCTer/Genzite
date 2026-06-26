import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            findByUserId: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('findAll', () => {
    it('should call service.findByUserId with parsed pagination', async () => {
      jest.spyOn(service, 'findByUserId').mockResolvedValue([] as any);

      await controller.findAll('user-1', '2', '10', 'true');

      expect(service.findByUserId).toHaveBeenCalledWith('user-1', 2, 10, true);
    });
  });

  describe('markAsRead', () => {
    it('should call service.markAsRead', async () => {
      jest.spyOn(service, 'markAsRead').mockResolvedValue({} as any);

      await controller.markAsRead('user-1', 'notif-1');

      expect(service.markAsRead).toHaveBeenCalledWith('notif-1', 'user-1');
    });
  });
});
