import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client-data';
import { SchemaValidatorService, type CmsSchemaDefinition } from '../validation/schema-validator.service.js';
import { DataProducer } from '../events/data.producer.js';
import { parsePagination, paginationSkip, buildPaginatedResponse } from '@genzite/shared-utils';

interface FindOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

@Injectable()
export class RecordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schemaValidator: SchemaValidatorService,
    private readonly dataProducer: DataProducer,
  ) {}

  /** 4.9 — Create a record with JSONB schema validation */
  async create(
    collectionId: string,
    data: Record<string, unknown>,
    userId: string,
  ) {
    const collection = await this.getCollectionOrFail(collectionId);

    // Validate data against collection schema
    this.schemaValidator.validate(
      collection.schemaDefinition as unknown as CmsSchemaDefinition,
      data,
    );

    const record = await this.prisma.cmsRecord.create({
      data: {
        collectionId,
        data: data as Prisma.InputJsonValue,
        createdBy: userId,
      },
    });

    // Emit Kafka event
    await this.dataProducer.emitRecordCreated({
      recordId: record.id,
      collectionId,
      createdBy: userId,
    });

    return record;
  }

  /** 4.10 — List records with pagination and sorting */
  async findByCollectionId(collectionId: string, options: FindOptions) {
    // Verify collection exists
    await this.getCollectionOrFail(collectionId);

    const pagination = parsePagination({
      page: options.page,
      limit: options.limit,
    });

    const orderBy = this.buildOrderBy(options.sort, options.order);

    const [data, total] = await Promise.all([
      this.prisma.cmsRecord.findMany({
        where: { collectionId },
        skip: paginationSkip(pagination),
        take: pagination.limit,
        orderBy,
      }),
      this.prisma.cmsRecord.count({ where: { collectionId } }),
    ]);

    return buildPaginatedResponse(data, total, pagination);
  }

  /** 4.11 — Get a single record by ID */
  async findById(recordId: string) {
    const record = await this.prisma.cmsRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Record '${recordId}' not found`);
    }

    return record;
  }

  /** 4.12 — Update a record with JSONB schema validation (merge, not replace) */
  async update(
    recordId: string,
    data: Record<string, unknown>,
    userId: string,
  ) {
    const existingRecord = await this.findById(recordId);

    // Load collection schema for validation
    const collection = await this.getCollectionOrFail(existingRecord.collectionId);

    // Merge existing data with new data (partial update: existing fields preserved)
    const mergedData = {
      ...(existingRecord.data as Record<string, unknown>),
      ...data,
    };

    // Validate merged data against schema
    this.schemaValidator.validate(
      collection.schemaDefinition as unknown as CmsSchemaDefinition,
      mergedData,
    );

    const updatedRecord = await this.prisma.cmsRecord.update({
      where: { id: recordId },
      data: { data: mergedData as Prisma.InputJsonValue },
    });

    // Emit Kafka event
    await this.dataProducer.emitRecordUpdated({
      recordId,
      collectionId: existingRecord.collectionId,
      updatedBy: userId,
    });

    return updatedRecord;
  }

  /** 4.13 — Delete a record */
  async remove(recordId: string) {
    // Verify record exists
    const record = await this.findById(recordId);

    await this.prisma.cmsRecord.delete({ where: { id: recordId } });

    // Emit Kafka event
    await this.dataProducer.emitRecordDeleted({
      recordId,
      collectionId: record.collectionId,
    });

    return { deleted: true, id: recordId };
  }

  /**
   * 4.15 — Advanced JSONB search with filter operators.
   *
   * Supported query formats:
   *   ?filter[name]=Rose         → exact match on data.name
   *   ?filter[price_gte]=10      → data.price >= 10
   *   ?filter[price_lte]=100     → data.price <= 100
   *   ?filter[title_contains]=hi → data.title contains "hi"
   *   ?page=1&limit=20
   */
  async searchByFilters(
    collectionId: string,
    query: Record<string, string>,
  ) {
    await this.getCollectionOrFail(collectionId);

    const pagination = parsePagination({
      page: query['page'] ? Number(query['page']) : undefined,
      limit: query['limit'] ? Number(query['limit']) : undefined,
    });

    const jsonFilters = this.buildJsonFilters(query);

    const where = {
      collectionId,
      ...jsonFilters,
    };

    const [data, total] = await Promise.all([
      this.prisma.cmsRecord.findMany({
        where,
        skip: paginationSkip(pagination),
        take: pagination.limit,
        orderBy: { createdAt: 'desc' as const },
      }),
      this.prisma.cmsRecord.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, pagination);
  }

  // ─── Private Helpers ─────────────────────────────────────────────

  private async getCollectionOrFail(collectionId: string) {
    const collection = await this.prisma.cmsCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException(`Collection '${collectionId}' not found`);
    }

    return collection;
  }

  private buildOrderBy(sort?: string, order?: 'asc' | 'desc') {
    const direction = order ?? 'desc';

    if (!sort || sort === 'createdAt') {
      return { createdAt: direction };
    }
    if (sort === 'updatedAt') {
      return { updatedAt: direction };
    }

    // Default fallback
    return { createdAt: direction };
  }

  /**
   * Parse filter[field] and filter[field_operator] from query params
   * into Prisma-compatible JSONB where clauses.
   */
  private buildJsonFilters(query: Record<string, string>) {
    const filters: Record<string, unknown> = {};
    const filterEntries = Object.entries(query).filter(([key]) =>
      key.startsWith('filter['),
    );

    if (filterEntries.length === 0) return filters;

    const dataConditions: unknown[] = [];

    for (const [key, value] of filterEntries) {
      const match = key.match(/^filter\[(.+)\]$/);
      if (!match) continue;

      const rawField = match[1];
      const { fieldName, operator } = this.parseFieldOperator(rawField);
      const typedValue = this.coerceValue(value);

      const condition = this.buildSingleCondition(fieldName, operator, typedValue);
      if (condition) {
        dataConditions.push(condition);
      }
    }

    if (dataConditions.length > 0) {
      filters['AND'] = dataConditions;
    }

    return filters;
  }

  /**
   * Parse "price_gte" into { fieldName: "price", operator: "gte" }
   * Parse "name" into { fieldName: "name", operator: "eq" }
   */
  private parseFieldOperator(rawField: string): {
    fieldName: string;
    operator: string;
  } {
    const operators = ['gte', 'lte', 'gt', 'lt', 'contains'];
    for (const op of operators) {
      if (rawField.endsWith(`_${op}`)) {
        return {
          fieldName: rawField.slice(0, -(op.length + 1)),
          operator: op,
        };
      }
    }
    return { fieldName: rawField, operator: 'eq' };
  }

  /**
   * Convert string to appropriate primitive type.
   */
  private coerceValue(value: string): string | number | boolean {
    if (value === 'true') return true;
    if (value === 'false') return false;
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') return num;
    return value;
  }

  /**
   * Build a single Prisma JSONB filter condition using `path` filtering.
   */
  private buildSingleCondition(
    fieldName: string,
    operator: string,
    value: string | number | boolean,
  ): Record<string, unknown> | null {
    switch (operator) {
      case 'eq':
        return {
          data: {
            path: [fieldName],
            equals: value,
          },
        };
      case 'gte':
        return {
          data: {
            path: [fieldName],
            gte: value,
          },
        };
      case 'lte':
        return {
          data: {
            path: [fieldName],
            lte: value,
          },
        };
      case 'gt':
        return {
          data: {
            path: [fieldName],
            gt: value,
          },
        };
      case 'lt':
        return {
          data: {
            path: [fieldName],
            lt: value,
          },
        };
      case 'contains':
        return {
          data: {
            path: [fieldName],
            string_contains: String(value),
          },
        };
      default:
        return null;
    }
  }
}
