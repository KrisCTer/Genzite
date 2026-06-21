import { IsString, IsUUID, IsOptional } from 'class-validator';

export class GenerateCmsDto {
  @IsUUID()
  siteId!: string;

  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  model?: string;
}
