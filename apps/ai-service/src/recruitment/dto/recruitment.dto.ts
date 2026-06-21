import { IsString, IsUUID, IsIn, IsOptional } from 'class-validator';

export class AnalyzeCvDto {
  @IsUUID()
  resumeId!: string;

  @IsString()
  jobDescription!: string;

  @IsOptional()
  @IsString()
  model?: string;
}

export class StartInterviewDto {
  @IsUUID()
  resumeId!: string;

  @IsString()
  jobDescription!: string;

  @IsIn(['TECHNICAL', 'BEHAVIORAL', 'MIXED'])
  sessionType!: 'TECHNICAL' | 'BEHAVIORAL' | 'MIXED';

  @IsOptional()
  @IsString()
  model?: string;
}

export class InterviewChatDto {
  @IsString()
  message!: string;
}
