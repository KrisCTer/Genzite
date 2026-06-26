import { Test, TestingModule } from '@nestjs/testing';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

describe('SitesController', () => {
  let controller: SitesController;
  let service: SitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitesController],
      providers: [
        {
          provide: SitesService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .compile();

    controller = module.get<SitesController>(SitesController);
    service = module.get<SitesService>(SitesService);
  });

  describe('findAll', () => {
    it('should return all sites', async () => {
      const userId = 'user-1';
      jest.spyOn(service, 'findAll').mockResolvedValue([] as any);

      await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith('user-1');
    });
  });

  describe('create', () => {
    it('should create site', async () => {
      const userId = 'user-1';
      const dto = { name: 'Test', subdomain: 'test' };
      jest.spyOn(service, 'create').mockResolvedValue({} as any);

      await controller.create(dto, userId);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
    });
  });
});
