import { Injectable } from '@nestjs/common';

@Injectable()
export class SiteGeneratorService {
  async generate(prompt: string) {
    // TODO: Call Google Gemini API to generate site structure from natural language
    return {
      site: { name: 'Generated Site', subdomain: 'generated-site' },
      pages: [
        {
          title: 'Home',
          slug: 'home',
          widgets: [
            { type: 'HERO', contentConfig: { title: 'Welcome' }, sortOrder: 1 },
          ],
        },
      ],
    };
  }
}
