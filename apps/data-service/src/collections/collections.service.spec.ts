import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsService } from './collections.service';
import { PrismaService } from '../prisma/prisma.service';
import { DataProducer } from '../events/data.producer';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let prisma: PrismaService;
  let dataProducer: DataProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        {
          provide: PrismaService,
          useValue: {
            cmsCollection: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: DataProducer,
          useValue: {
            emitCollectionCreated: jest.fn(),
            emitCollectionUpdated: jest.fn(),
            emitCollectionDeleted: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
    prisma = module.get<PrismaService>(PrismaService);
    dataProducer = module.get<DataProducer>(DataProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findBySiteId', () => {
    it('should return all collections for a site', async () => {
      jest.spyOn(prisma.cmsCollection, 'findMany').mockResolvedValue([{ id: 'col-1' }] as any);

      const result = await service.findBySiteId('site-1');

      expect(prisma.cmsCollection.findMany).toHaveBeenCalledWith({
        where: { siteId: 'site-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([{ id: 'col-1' }]);
    });
  });

  describe('create', () => {
    it('should throw ConflictException if duplicate slug exists', async () => {
      jest.spyOn(prisma.cmsCollection, 'findUnique').mockResolvedValue({ id: 'col-2' } as any);

      await expect(service.create({ siteId: 'site-1', name: 'Posts', schemaDefinition: {} }, 'user-1'))
        .rejects.toThrow(ConflictException);
    });

    it('should create a collection and emit event', async () => {
      const createDto = { siteId: 'site-1', name: 'Posts', schemaDefinition: {} };
      const createdCol = { id: 'col-1', siteId: 'site-1', name: 'Posts' };
      
      jest.spyOn(prisma.cmsCollection, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.cmsCollection, 'create').mockResolvedValue(createdCol as any);

      const result = await service.create(createDto, 'user-1');

      expect(prisma.cmsCollection.create).toHaveBeenCalled();
      expect(dataProducer.emitCollectionCreated).toHaveBeenCalledWith({
        collectionId: 'col-1',
        siteId: 'site-1',
        name: 'Posts',
      });
      expect(result.id).toBe('col-1');
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(prisma.cmsCollection, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('col-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete and emit event', async () => {
      jest.spyOn(prisma.cmsCollection, 'findUnique').mockResolvedValue({ id: 'col-1', siteId: 'site-1' } as any);
      jest.spyOn(prisma.cmsCollection, 'delete').mockResolvedValue({} as any);

      await service.remove('col-1');

      expect(prisma.cmsCollection.delete).toHaveBeenCalledWith({ where: { id: 'col-1' } });
      expect(dataProducer.emitCollectionDeleted).toHaveBeenCalledWith({ collectionId: 'col-1', siteId: 'site-1' });
    });
  });
});
