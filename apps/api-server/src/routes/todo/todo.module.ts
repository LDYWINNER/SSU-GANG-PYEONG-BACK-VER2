import { Module } from '@nestjs/common';
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';
import { TaskController } from './task/task.controller';
import { TaskService } from './task/task.service';

@Module({
  controllers: [CategoryController, TaskController],
  providers: [CategoryService, TaskService],
})
export class TodoModule {}
