import { IsString, IsObject, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCollectionDto {
  @IsUUID()
  siteId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  schemaDefinition!: Record<string, unknown>;
}

export class UpdateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  schemaDefinition?: Record<string, unknown>;
}
