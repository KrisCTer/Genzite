import { Test, TestingModule } from '@nestjs/testing';
import { RegistryService } from './registry.service';
import { PrismaService } from '../prisma/prisma.service';
import { MediaProducer } from '../events/media.producer';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// Mock S3Client
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    DeleteObjectCommand: jest.fn(),
  };
});

describe('RegistryService', () => {
  let service: RegistryService;
  let prisma: PrismaService;
  let mediaProducer: MediaProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryService,
        {
          provide: PrismaService,
          useValue: {
            mediaFile: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: MediaProducer,
          useValue: {
            emitMediaDeleted: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegistryService>(RegistryService);
    prisma = module.get<PrismaService>(PrismaService);
    mediaProducer = module.get<MediaProducer>(MediaProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByOwnerId', () => {
    it('should return paginated media', async () => {
      jest.spyOn(prisma.mediaFile, 'findMany').mockResolvedValue([{ id: 'media-1' }] as any);

      const result = await service.findByOwnerId('user-1', 2, 10);

      expect(prisma.mediaFile.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        skip: 10,
        take: 10,
      });
      expect(result).toEqual([{ id: 'media-1' }]);
    });
  });

  describe('deleteMedia', () => {
    it('should throw NotFoundException if media not found', async () => {
      jest.spyOn(prisma.mediaFile, 'findUnique').mockResolvedValue(null);

      await expect(service.deleteMedia('media-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      jest.spyOn(prisma.mediaFile, 'findUnique').mockResolvedValue({ id: 'media-1', ownerId: 'user-2' } as any);

      await expect(service.deleteMedia('media-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should delete media and emit event', async () => {
      jest.spyOn(prisma.mediaFile, 'findUnique').mockResolvedValue({ id: 'media-1', ownerId: 'user-1', s3Key: 'key-1' } as any);
      jest.spyOn(prisma.mediaFile, 'delete').mockResolvedValue({ id: 'media-1' } as any);
      
      const s3ClientInstance = (service as any).s3;
      s3ClientInstance.send.mockResolvedValue({});

      const result = await service.deleteMedia('media-1', 'user-1');

      expect(s3ClientInstance.send).toHaveBeenCalled();
      expect(prisma.mediaFile.delete).toHaveBeenCalledWith({ where: { id: 'media-1' } });
      expect(mediaProducer.emitMediaDeleted).toHaveBeenCalledWith({
        mediaId: 'media-1',
        s3Key: 'key-1',
        ownerId: 'user-1',
      });
      expect(result).toEqual({ message: 'Media deleted successfully', mediaId: 'media-1' });
    });
  });
});
