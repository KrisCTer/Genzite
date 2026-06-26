import { Test, TestingModule } from '@nestjs/testing';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { BadRequestException } from '@nestjs/common';

describe('RegistryController', () => {
  let controller: RegistryController;
  let service: RegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistryController],
      providers: [
        {
          provide: RegistryService,
          useValue: {
            findByOwnerId: jest.fn(),
            deleteMedia: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RegistryController>(RegistryController);
    service = module.get<RegistryService>(RegistryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return media for owner', async () => {
      jest.spyOn(service, 'findByOwnerId').mockResolvedValue([{ id: 'media-1' }] as any);

      const result = await controller.findAll('user-1', '2', '10');

      expect(service.findByOwnerId).toHaveBeenCalledWith('user-1', 2, 10);
      expect(result).toEqual([{ id: 'media-1' }]);
    });

    it('should throw BadRequestException if ownerId is missing', async () => {
      await expect(controller.findAll(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should use default pagination values', async () => {
      jest.spyOn(service, 'findByOwnerId').mockResolvedValue([] as any);

      await controller.findAll('user-1');

      expect(service.findByOwnerId).toHaveBeenCalledWith('user-1', 1, 20);
    });
  });

  describe('deleteMedia', () => {
    it('should delete media', async () => {
      jest.spyOn(service, 'deleteMedia').mockResolvedValue({ message: 'Media deleted successfully', mediaId: 'media-1' });

      const result = await controller.deleteMedia('user-1', 'media-1');

      expect(service.deleteMedia).toHaveBeenCalledWith('media-1', 'user-1');
      expect(result).toEqual({ message: 'Media deleted successfully', mediaId: 'media-1' });
    });

    it('should throw BadRequestException if ownerId is missing', async () => {
      await expect(controller.deleteMedia(null as any, 'media-1')).rejects.toThrow(BadRequestException);
    });
  });
});
