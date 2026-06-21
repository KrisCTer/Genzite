import { IsString, IsOptional } from 'class-validator';

export class GenerateSiteDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  model?: string;
}
