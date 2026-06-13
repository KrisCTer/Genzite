import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(100)
  subdomain: string;

  @IsString()
  @IsOptional()
  description?: string;
}
