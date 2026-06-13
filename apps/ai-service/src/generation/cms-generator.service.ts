import { Injectable } from '@nestjs/common';

@Injectable()
export class CmsGeneratorService {
  async generate(siteId: string, prompt: string) {
    // TODO: Call Google Gemini API to generate CMS collection schemas from prompt
    return {
      collections: [
        {
          name: 'Products',
          schemaDefinition: {
            properties: {
              name: { type: 'string', required: true },
              price: { type: 'number' },
              imageUrl: { type: 'string' },
            },
          },
        },
      ],
    };
  }
}
