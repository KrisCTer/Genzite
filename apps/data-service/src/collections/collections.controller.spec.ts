import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

describe('CollectionsController', () => {
  let controller: CollectionsController;
  let service: CollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [
        {
          provide: CollectionsService,
          useValue: {
            findBySiteId: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CollectionsController>(CollectionsController);
    service = module.get<CollectionsService>(CollectionsService);
  });

  describe('findAll', () => {
    it('should return all collections', async () => {
      jest.spyOn(service, 'findBySiteId').mockResolvedValue([] as any);

      await controller.findAll('site-1');

      expect(service.findBySiteId).toHaveBeenCalledWith('site-1');
    });
  });

  describe('create', () => {
    it('should create collection', async () => {
      const dto = { siteId: 'site-1', name: 'Test', schemaDefinition: {} };
      jest.spyOn(service, 'create').mockResolvedValue({} as any);

      await controller.create(dto, 'user-1');

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
    });
  });
});
