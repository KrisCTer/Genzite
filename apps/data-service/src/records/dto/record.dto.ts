import { IsObject } from 'class-validator';

export class CreateRecordDto {
  @IsObject()
  data!: Record<string, unknown>;
}

export class UpdateRecordDto {
  @IsObject()
  data!: Record<string, unknown>;
}
