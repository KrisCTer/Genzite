import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieve the most suitable template based on keywords in the prompt.
   */
  async retrieveTemplate(prompt: string): Promise<string> {
    const p = prompt.toLowerCase();
    
    // Find all active templates
    const templates = await this.prisma.aiTemplate.findMany({
      where: { isActive: true }
    });

    if (templates.length === 0) {
      this.logger.warn('No RAG templates found in database. Please run seed script.');
      return '{}';
    }

    // Simple scoring logic based on tag match count
    let bestTemplate = templates[0];
    let maxScore = -1;

    for (const tpl of templates) {
      let score = 0;
      for (const tag of tpl.tags) {
        if (p.includes(tag.toLowerCase())) {
          score++;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestTemplate = tpl;
      }
    }

    this.logger.log(`RAG matched template "${bestTemplate.name}" (score: ${maxScore})`);
    
    // Return JSON string to merge into the prompt
    return JSON.stringify(bestTemplate.content, null, 2);
  }
}
