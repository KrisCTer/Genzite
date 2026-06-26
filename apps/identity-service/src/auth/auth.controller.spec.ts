import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const dto = { email: 'test@test.com', password: 'password', name: 'Test' };
      const expectedResult = { id: 'uuid-1', ...dto };
      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult as any);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const dto = { email: 'test@test.com', password: 'password' };
      const expectedResult = { accessToken: 'token', expiresIn: 3600 };
      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });
});
