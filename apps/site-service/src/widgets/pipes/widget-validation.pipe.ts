import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import DOMPurify from 'isomorphic-dompurify';
import { validateWidgetConfig } from '../schemas/widget.schema.js';

@Injectable()
export class WidgetValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.widgets)) {
      // Allow class-validator to handle basic structure if needed, or throw early here
      return value;
    }

    try {
      const sanitizedWidgets = value.widgets.map((widget: any) => {
        // Deep clone to avoid mutating the original payload reference directly, though it's generally safe here
        const clonedConfig = JSON.parse(JSON.stringify(widget.contentConfig || {}));

        // 1. Recursive Sanitization
        const sanitizeObject = (obj: any) => {
          for (const key in obj) {
            if (typeof obj[key] === 'string') {
              obj[key] = DOMPurify.sanitize(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              sanitizeObject(obj[key]);
            }
          }
        };

        sanitizeObject(clonedConfig);

        // 2. Strict Zod Schema Validation
        const validatedConfig = validateWidgetConfig(widget.type, clonedConfig);

        return {
          ...widget,
          contentConfig: validatedConfig,
        };
      });

      return {
        ...value,
        widgets: sanitizedWidgets,
      };
    } catch (error: any) {
      // If it's a ZodError, it will have an 'issues' array
      const message = error.issues
        ? `Schema validation failed: ${error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ')}`
        : 'Invalid widget payload structure';
      throw new BadRequestException(message);
    }
  }
}
