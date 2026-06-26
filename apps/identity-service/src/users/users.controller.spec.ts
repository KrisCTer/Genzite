import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should extract userId from req and call usersService.findById', async () => {
      const mockReq = { user: { sub: 'user-id-123' } };
      const mockUser = { id: 'user-id-123', name: 'Test' };
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);

      const result = await controller.getProfile(mockReq);

      expect(usersService.findById).toHaveBeenCalledWith('user-id-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should call usersService.findById with provided id', async () => {
      const mockUser = { id: 'some-id', name: 'Test' };
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);

      const result = await controller.findById('some-id');

      expect(usersService.findById).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(mockUser);
    });
  });
});
