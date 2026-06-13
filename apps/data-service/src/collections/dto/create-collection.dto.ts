import { IsString, IsObject, IsUUID } from 'class-validator';

export class CreateCollectionDto {
  @IsUUID()
  siteId: string;

  @IsString()
  name: string;

  @IsObject()
  schemaDefinition: Record<string, unknown>;
}
