import { Injectable } from '@nestjs/common';

@Injectable()
export class CareerCoachService {
  async generateRoadmap(resumeId: string) {
    // TODO: Fetch resume from DB, call Gemini to generate personalized career roadmap
    return {
      roadmap: [
        { phase: '0-3 months', topic: 'TypeScript Advanced', priority: 'HIGH' },
        { phase: '3-6 months', topic: 'System Design', priority: 'MEDIUM' },
        { phase: '6-12 months', topic: 'Cloud Architecture (AWS)', priority: 'MEDIUM' },
      ],
    };
  }
}
