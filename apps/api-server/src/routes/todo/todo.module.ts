import { Module } from '@nestjs/common';
import { CategoryController } from './category/category.controller';
import { CategoryService } from './category/category.service';
import { TaskController } from './task/task.controller';
import { TaskService } from './task/task.service';
import { ToDoCategory, ToDoTask, User } from '../../entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JodaTime } from '../../common/time/joda-time';

@Module({
  imports: [TypeOrmModule.forFeature([ToDoCategory, ToDoTask, User])],
  controllers: [CategoryController, TaskController],
  providers: [
    CategoryService,
    TaskService,
    {
      provide: 'Time',
      useClass: JodaTime,
    },
  ],
})
export class TodoModule {}
