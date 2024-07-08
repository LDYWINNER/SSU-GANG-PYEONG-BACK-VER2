import { PartialType } from '@nestjs/swagger';
import { CreateToDoTaskDto } from './create-todo-task.dto';

export class UpdateToDoTaskDto extends PartialType(CreateToDoTaskDto) {}
