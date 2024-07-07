import { PartialType } from '@nestjs/swagger';
import { CreateToDoCategoryDto } from './create-todo-category.dto';

export class UpdateToDoCategoryDto extends PartialType(CreateToDoCategoryDto) {}
