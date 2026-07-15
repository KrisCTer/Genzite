import { IsString, IsOptional, IsArray } from 'class-validator';

export class GenerateSiteDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  siteId?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsArray()
  attachments?: { base64?: string; url?: string; mimeType: string }[];
}
