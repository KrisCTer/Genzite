import { Test, TestingModule } from '@nestjs/testing';
import { PushService } from './push.service';

describe('PushService', () => {
  let service: PushService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PushService],
    }).compile();

    service = module.get<PushService>(PushService);
  });

  describe('sendPush', () => {
    it('should log push message to console', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await service.sendPush('user-1', 'Test Title', 'Test Body');
      
      expect(consoleSpy).toHaveBeenCalledWith('[Push] Sending to user user-1: Test Title');
      consoleSpy.mockRestore();
    });
  });
});
