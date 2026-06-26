import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user with mapped roles if found', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@test.com',
        name: 'Test',
        avatarUrl: null,
        roles: [
          { role: { name: 'ADMIN' } },
          { role: { name: 'USER' } },
        ],
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.findById('user-id');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        include: { roles: { include: { role: true } } },
      });
      expect(result).toEqual({
        id: 'user-id',
        email: 'test@test.com',
        name: 'Test',
        avatarUrl: null,
        roles: ['ADMIN', 'USER'],
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
