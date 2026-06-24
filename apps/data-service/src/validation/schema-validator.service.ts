import { Injectable, BadRequestException } from '@nestjs/common';
import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Supported field types in CMS schema definitions.
 * These are the simplified types that the no-code builder sends.
 */
export const CMS_FIELD_TYPES = [
  'string',
  'number',
  'boolean',
  'date',
  'image',
  'richtext',
] as const;

export type CmsFieldType = (typeof CMS_FIELD_TYPES)[number];

export interface CmsFieldDefinition {
  type: CmsFieldType;
  required?: boolean;
}

export interface CmsSchemaDefinition {
  properties: Record<string, CmsFieldDefinition>;
}

@Injectable()
export class SchemaValidatorService {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      coerceTypes: false,
      strict: false,
    });
    addFormats(this.ajv);
  }

  /**
   * Validate record data against a collection's schema definition.
   * Throws BadRequestException with detailed error messages on failure.
   */
  validate(schemaDefinition: CmsSchemaDefinition, data: Record<string, unknown>): void {
    const jsonSchema = this.toJsonSchema(schemaDefinition);
    const isValid = this.ajv.validate(jsonSchema, data);

    if (!isValid) {
      const errors = this.formatErrors(this.ajv.errors ?? []);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        details: errors,
      });
    }
  }

  /**
   * Convert simplified CMS schema definition to standard JSON Schema (Draft-07).
   *
   * Mapping:
   * - string, richtext, image → { type: "string" }
   * - number                  → { type: "number" }
   * - boolean                 → { type: "boolean" }
   * - date                    → { type: "string", format: "date-time" }
   */
  private toJsonSchema(schema: CmsSchemaDefinition): Record<string, unknown> {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    const schemaProps = schema.properties || {};
    for (const [fieldName, fieldDef] of Object.entries(schemaProps)) {
      properties[fieldName] = this.mapFieldType(fieldDef.type);

      if (fieldDef.required) {
        required.push(fieldName);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: true,
    };
  }

  /**
   * Map a CMS field type to its JSON Schema equivalent.
   */
  private mapFieldType(cmsType: CmsFieldType): Record<string, unknown> {
    switch (cmsType) {
      case 'string':
      case 'richtext':
      case 'image':
        return { type: 'string' };
      case 'number':
        return { type: 'number' };
      case 'boolean':
        return { type: 'boolean' };
      case 'date':
        return { type: 'string', format: 'date-time' };
      default:
        return { type: 'string' };
    }
  }

  /**
   * Format AJV errors into user-friendly messages.
   */
  private formatErrors(errors: ErrorObject[]): string[] {
    return errors.map((err) => {
      const field = err.instancePath.replace(/^\//, '') || err.params?.['missingProperty'] || 'unknown';
      switch (err.keyword) {
        case 'required':
          return `Field '${err.params?.['missingProperty']}' is required`;
        case 'type':
          return `Field '${field}' must be of type ${err.params?.['type']}`;
        case 'format':
          return `Field '${field}' must match format '${err.params?.['format']}'`;
        default:
          return `Field '${field}': ${err.message}`;
      }
    });
  }
}
