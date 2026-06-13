import { IsString, IsUUID, IsIn } from 'class-validator';

export class AnalyzeCvDto {
  @IsUUID()
  resumeId: string;

  @IsString()
  jobDescription: string;
}

export class StartInterviewDto {
  @IsUUID()
  resumeId: string;

  @IsString()
  jobDescription: string;

  @IsIn(['TECHNICAL', 'BEHAVIORAL', 'MIXED'])
  sessionType: 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED';
}

export class InterviewChatDto {
  @IsString()
  message: string;
}
