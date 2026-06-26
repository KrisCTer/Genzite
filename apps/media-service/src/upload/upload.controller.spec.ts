import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: {
            generatePresignedUrl: jest.fn(),
            confirmUpload: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPresignedUrl', () => {
    it('should throw BadRequestException if ownerId is missing', async () => {
      await expect(controller.getPresignedUrl(null as any, { filename: 'file.jpg', mimeType: 'image/jpeg' })).rejects.toThrow(BadRequestException);
    });

    it('should generate presigned url', async () => {
      jest.spyOn(service, 'generatePresignedUrl').mockResolvedValue({ uploadUrl: 'url', s3Key: 'key' });

      const result = await controller.getPresignedUrl('user-1', { filename: 'file.jpg', mimeType: 'image/jpeg' });

      expect(service.generatePresignedUrl).toHaveBeenCalledWith('user-1', 'file.jpg', 'image/jpeg');
      expect(result).toEqual({ uploadUrl: 'url', s3Key: 'key' });
    });
  });

  describe('confirmUpload', () => {
    it('should throw BadRequestException if ownerId is missing', async () => {
      await expect(controller.confirmUpload(null as any, { s3Key: 'key', filename: 'file.jpg', mimeType: 'image/jpeg', sizeBytes: 100 })).rejects.toThrow(BadRequestException);
    });

    it('should confirm upload', async () => {
      const dto = { s3Key: 'key', filename: 'file.jpg', mimeType: 'image/jpeg', sizeBytes: 100 };
      jest.spyOn(service, 'confirmUpload').mockResolvedValue({ id: 'media-1', ...dto } as any);

      const result = await controller.confirmUpload('user-1', dto);

      expect(service.confirmUpload).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual({ id: 'media-1', ...dto });
    });
  });
});
