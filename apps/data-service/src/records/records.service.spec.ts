import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from './records.service';
import { PrismaService } from '../prisma/prisma.service';
import { SchemaValidatorService } from '../validation/schema-validator.service';
import { DataProducer } from '../events/data.producer';
import { NotFoundException } from '@nestjs/common';

describe('RecordsService', () => {
  let service: RecordsService;
  let prisma: PrismaService;
  let dataProducer: DataProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        {
          provide: PrismaService,
          useValue: {
            cmsRecord: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            cmsCollection: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: SchemaValidatorService,
          useValue: { validate: jest.fn() },
        },
        {
          provide: DataProducer,
          useValue: { emitRecordCreated: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
    prisma = module.get<PrismaService>(PrismaService);
    dataProducer = module.get<DataProducer>(DataProducer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByCollectionId', () => {
    it('should return all records for a collection', async () => {
      jest.spyOn(prisma.cmsCollection, 'findUnique').mockResolvedValue({ id: 'col-1' } as any);
      jest.spyOn(prisma.cmsRecord, 'findMany').mockResolvedValue([{ id: 'record-1' }] as any);
      jest.spyOn(prisma.cmsRecord, 'count').mockResolvedValue(1);

      const result = await service.findByCollectionId('col-1', {});

      expect(prisma.cmsRecord.findMany).toHaveBeenCalledWith({
        where: { collectionId: 'col-1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(result.data).toEqual([{ id: 'record-1' }]);
    });
  });

  describe('create', () => {
    it('should throw NotFoundException if collection not found', async () => {
      jest.spyOn(prisma.cmsCollection, 'findUnique').mockResolvedValue(null);

      await expect(service.create('col-1', {}, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should create record if collection is found', async () => {
      jest.spyOn(prisma.cmsCollection, 'findUnique').mockResolvedValue({ id: 'col-1', siteId: 'site-1' } as any);
      jest.spyOn(prisma.cmsRecord, 'create').mockResolvedValue({ id: 'record-1' } as any);

      const result = await service.create('col-1', { title: 'Hello' }, 'user-1');

      expect(prisma.cmsRecord.create).toHaveBeenCalledWith({
        data: {
          collectionId: 'col-1',
          data: { title: 'Hello' },
          createdBy: 'user-1',
        },
      });
      expect(dataProducer.emitRecordCreated).toHaveBeenCalled();
      expect(result.id).toBe('record-1');
    });
  });
});
