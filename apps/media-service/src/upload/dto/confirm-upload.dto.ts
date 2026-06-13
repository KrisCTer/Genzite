import { IsString, IsInt } from 'class-validator';

export class ConfirmUploadDto {
  @IsString()
  s3Key: string;

  @IsString()
  filename: string;

  @IsString()
  mimeType: string;

  @IsInt()
  sizeBytes: number;
}
