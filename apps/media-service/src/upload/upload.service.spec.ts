import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { MediaProducer } from '../events/media.producer';
import { ConflictException } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

// Mock S3 presigner
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('UploadService', () => {
  let service: UploadService;
  let prisma: PrismaService;
  let mediaProducer: MediaProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: PrismaService,
          useValue: {
            mediaFile: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: MediaProducer,
          useValue: {
            emitMediaUploaded: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    prisma = module.get<PrismaService>(PrismaService);
    mediaProducer = module.get<MediaProducer>(MediaProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePresignedUrl', () => {
    it('should generate a presigned url and s3 key', async () => {
      (getSignedUrl as jest.Mock).mockResolvedValue('https://presigned-url.com');

      const result = await service.generatePresignedUrl('user-1', 'image.jpg', 'image/jpeg');

      expect(result.s3Key).toBe('uploads/user-1/test-uuid/image.jpg');
      expect(result.uploadUrl).toBe('https://presigned-url.com');
      expect(getSignedUrl).toHaveBeenCalled();
    });
  });

  describe('confirmUpload', () => {
    const dto = {
      s3Key: 'uploads/user-1/test-uuid/image.jpg',
      filename: 'image.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
    };

    it('should throw ConflictException if media already confirmed', async () => {
      jest.spyOn(prisma.mediaFile, 'findUnique').mockResolvedValue({ id: 'media-1' } as any);

      await expect(service.confirmUpload('user-1', dto)).rejects.toThrow(ConflictException);
    });

    it('should create media and emit event', async () => {
      jest.spyOn(prisma.mediaFile, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.mediaFile, 'create').mockResolvedValue({
        id: 'media-1',
        ownerId: 'user-1',
        ...dto,
      } as any);

      const result = await service.confirmUpload('user-1', dto);

      expect(prisma.mediaFile.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          ownerId: 'user-1',
        },
      });
      expect(mediaProducer.emitMediaUploaded).toHaveBeenCalledWith({
        mediaId: 'media-1',
        s3Key: dto.s3Key,
        filename: dto.filename,
        mimeType: dto.mimeType,
        ownerId: 'user-1',
      });
      expect(result.id).toBe('media-1');
    });
  });
});
