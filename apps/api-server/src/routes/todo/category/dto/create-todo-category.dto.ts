import { ApiProperty } from '@nestjs/swagger';
import {
  ToDoCategoryColor,
  ToDoCategoryIcon,
} from '../../../../entity/todo-category.entity';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsObject,
  ValidateNested,
} from 'class-validator';

export class CreateToDoCategoryDto {
  @ApiProperty({ description: '투두 카테고리 제목' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '투두 카테고리 수정 가능 여부' })
  @IsNotEmpty()
  isEditable: boolean;

  @ApiProperty({ description: '투두 카테고리 색상 정보' })
  @ValidateNested()
  @Type(() => ToDoCategoryColor)
  @IsObject()
  color: ToDoCategoryColor;

  @ApiProperty({ description: '투두 카테고리 아이콘 정보' })
  @ValidateNested()
  @Type(() => ToDoCategoryIcon)
  @IsObject()
  icon: ToDoCategoryIcon;
}
