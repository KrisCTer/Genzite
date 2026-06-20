import { IsString, IsUUID } from 'class-validator';

export class GenerateCmsDto {
  @IsUUID()
  siteId!: string;

  @IsString()
  prompt!: string;
}
