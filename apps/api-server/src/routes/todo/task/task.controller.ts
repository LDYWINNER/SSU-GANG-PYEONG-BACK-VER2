import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from '../../../common/guard/throttler-behind-proxy.guard';
import { TaskService } from './task.service';
import {
  UserAfterAuth,
  UserInfo,
} from '../../../common/decorators/user-info.decorator';
import { CreateToDoTaskDto } from './dto/create-todo-task.dto';
import { UpdateToDoTaskDto } from './dto/update-todo-task.dto';

@Controller('todo/task')
@ApiTags('ToDo Task')
@UseGuards(ThrottlerBehindProxyGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('/all')
  @ApiBearerAuth('access-token')
  async getAll(@UserInfo() userInfo: UserAfterAuth) {
    try {
      const userId = userInfo.id;
      const tasks = await this.taskService.getAllTasks(userId);
      if (!tasks) {
        return {
          count: 0,
          items: [],
        };
      }

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  @Get('/category/:categoryId')
  @ApiBearerAuth('access-token')
  async getByCategory(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('categoryId') categoryId: string,
  ) {
    try {
      const userId = userInfo.id;
      const tasks = await this.taskService.getTasksByCategory(
        userId,
        categoryId,
      );
      if (!tasks) {
        return {
          count: 0,
          items: [],
        };
      }

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  @Get('/completed')
  @ApiBearerAuth('access-token')
  async getCompleted(@UserInfo() userInfo: UserAfterAuth) {
    try {
      const userId = userInfo.id;
      const tasks = await this.taskService.getAllCompletedTasks(userId);
      if (!tasks) {
        return {
          count: 0,
          items: [],
        };
      }

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  @Get('/today')
  @ApiBearerAuth('access-token')
  async getToday(@UserInfo() userInfo: UserAfterAuth) {
    try {
      const userId = userInfo.id;
      const tasks = await this.taskService.getTasksForToday(userId);
      if (!tasks) {
        return {
          count: 0,
          items: [],
        };
      }

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  @Get('/date/:dateString')
  @ApiBearerAuth('access-token')
  async getByDate(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('dateString') dateString: string,
  ) {
    try {
      const userId = userInfo.id;
      const tasks = await this.taskService.getTasksSpecificDay(
        userId,
        dateString,
      );
      if (!tasks) {
        return {
          count: 0,
          items: [],
        };
      }

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  @Get('/monthly')
  @ApiBearerAuth('access-token')
  async getMonthly(@UserInfo() userInfo: UserAfterAuth) {
    try {
      const userId = userInfo.id;
      const tasks = await this.taskService.getMonthlyTasks(userId);
      if (!tasks) {
        return {
          count: 0,
          items: [],
        };
      }

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiBearerAuth('access-token')
  async createTask(
    @UserInfo() userInfo: UserAfterAuth,
    @Body() createToDoTaskDto: CreateToDoTaskDto,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.taskService.createTask(
        userId,
        createToDoTaskDto,
      );
      if (!result) {
        throw new InternalServerErrorException('Failed to create task');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  async deleteTask(@Param('id') id: string) {
    try {
      const result = await this.taskService.deleteTask(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete task by id: ${id}`,
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put('/toggle/:id')
  @ApiBearerAuth('access-token')
  async toggleTask(@Param('id') id: string) {
    try {
      const result = await this.taskService.toggleTaskStatus(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to toggle complete status of task by id: ${id}`,
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  async updateTask(
    @Param('id') id: string,
    @Body() updateToDoTaskDto: UpdateToDoTaskDto,
  ) {
    try {
      const result = await this.taskService.updateTask(id, updateToDoTaskDto);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to update task by id: ${id}`,
        );
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}
