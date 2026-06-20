import { IsString, IsObject, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WidgetItemDto {
  @IsString()
  type!: string;

  @IsObject()
  contentConfig!: Record<string, unknown>;

  @IsInt()
  sortOrder!: number;
}

export class UpdateWidgetsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetItemDto)
  widgets!: WidgetItemDto[];
}

