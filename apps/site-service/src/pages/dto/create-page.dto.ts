import { IsString, MaxLength } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(255)
  slug: string;
}
