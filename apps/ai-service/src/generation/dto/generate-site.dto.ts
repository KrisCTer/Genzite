import { IsString } from 'class-validator';

export class GenerateSiteDto {
  @IsString()
  prompt!: string;
}
