import { IsString } from 'class-validator';

export class PresignedUrlRequestDto {
  @IsString()
  filename!: string;

  @IsString()
  mimeType!: string;
}
