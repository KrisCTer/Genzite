import { Test, TestingModule } from '@nestjs/testing';
import { SitesService } from './sites.service';
import { PrismaService } from '../prisma/prisma.service';
import { SiteProducer } from '../events/site.producer';
import { NotFoundException } from '@nestjs/common';

describe('SitesService', () => {
  let service: SitesService;
  let prisma: PrismaService;
  let siteProducer: SiteProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SitesService,
        {
          provide: PrismaService,
          useValue: {
            site: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: SiteProducer,
          useValue: {
            emitSiteCreated: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SitesService>(SitesService);
    prisma = module.get<PrismaService>(PrismaService);
    siteProducer = module.get<SiteProducer>(SiteProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all sites for a user', async () => {
      jest.spyOn(prisma.site, 'findMany').mockResolvedValue([{ id: 'site-1' }] as any);

      const result = await service.findAll('user-1');

      expect(prisma.site.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
      });
      expect(result).toEqual([{ id: 'site-1' }]);
    });
  });

  describe('findById', () => {
    it('should return site if found', async () => {
      jest.spyOn(prisma.site, 'findUnique').mockResolvedValue({ id: 'site-1', ownerId: 'user-1' } as any);

      const result = await service.findById('site-1', 'user-1');

      expect(prisma.site.findUnique).toHaveBeenCalledWith({
        where: { id: 'site-1' },
      });
      expect(result).toEqual({ id: 'site-1', ownerId: 'user-1' });
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(prisma.site, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('site-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create site and emit event', async () => {
      const createDto = { name: 'My Site', subdomain: 'my-site', description: 'Desc' };
      const createdSite = { id: 'site-1', ownerId: 'user-1', name: 'My Site' };
      
      jest.spyOn(prisma.site, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.site, 'create').mockResolvedValue(createdSite as any);

      const result = await service.create(createDto, 'user-1');

      expect(prisma.site.create).toHaveBeenCalled();
      expect(siteProducer.emitSiteCreated).toHaveBeenCalled();
      expect(result).toEqual(createdSite);
    });
  });

  describe('delete', () => {
    it('should delete site', async () => {
      jest.spyOn(prisma.site, 'delete').mockResolvedValue({} as any);
      jest.spyOn(service, 'findById').mockResolvedValue({ id: 'site-1', ownerId: 'user-1' } as any);

      await service.delete('site-1', 'user-1');

      expect(prisma.site.delete).toHaveBeenCalledWith({
        where: { id: 'site-1' },
      });
    });
  });
});
