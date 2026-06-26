import { Test, TestingModule } from '@nestjs/testing';
import { PagesService } from './pages.service';
import { PrismaService } from '../prisma/prisma.service';
import { SiteProducer } from '../events/site.producer';

describe('PagesService', () => {
  let service: PagesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        {
          provide: PrismaService,
          useValue: {
            page: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            site: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: SiteProducer,
          useValue: { emitSiteCreated: jest.fn() },
        }
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findBySiteId', () => {
    it('should return all pages for a site', async () => {
      jest.spyOn(prisma.site, 'findUnique').mockResolvedValue({ id: 'site-1', ownerId: 'user-1' } as any);
      jest.spyOn(prisma.page, 'findMany').mockResolvedValue([{ id: 'page-1' }] as any);

      const result = await service.findBySiteId('site-1', 'user-1');

      expect(prisma.page.findMany).toHaveBeenCalledWith({
        where: { siteId: 'site-1' },
        orderBy: { sortOrder: 'asc' },
      });
      expect(result).toEqual([{ id: 'page-1' }]);
    });
  });

  describe('create', () => {
    it('should create a page', async () => {
      const createDto = { title: 'Home', slug: 'home', path: '/' };
      jest.spyOn(prisma.site, 'findUnique').mockResolvedValue({ id: 'site-1', ownerId: 'user-1' } as any);
      jest.spyOn(prisma.page, 'create').mockResolvedValue({ id: 'page-1', ...createDto } as any);

      const result = await service.create('site-1', createDto, 'user-1');

      expect(prisma.page.create).toHaveBeenCalledWith({
        data: {
          title: createDto.title,
          slug: createDto.slug,
          siteId: 'site-1',
          sortOrder: 0,
        },
      });
      expect(result.id).toBe('page-1');
    });
  });
});
