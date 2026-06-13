import { Injectable } from '@nestjs/common';

@Injectable()
export class CvAnalyzerService {
  async analyze(resumeId: string, jobDescription: string) {
    // TODO: Call Google Gemini API to analyze CV against JD
    return {
      atsScore: 85,
      missingSkills: ['TypeScript', 'Next.js'],
      keywordOptimization: ['Add "REST API" to experience section'],
      compatibilityReport: 'Candidate has strong UI foundations...',
    };
  }
}
