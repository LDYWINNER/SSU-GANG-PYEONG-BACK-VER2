import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToDoCategory, ToDoTask, User } from '../../../entity';
import { Like, Repository } from 'typeorm';
import { CreateToDoTaskDto } from './dto/create-todo-task.dto';
import { Time } from '../../../common/time/time';
import { UpdateToDoTaskDto } from './dto/update-todo-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(ToDoTask)
    private readonly taskRepository: Repository<ToDoTask>,
    @InjectRepository(ToDoCategory)
    private readonly categoryRepository: Repository<ToDoCategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('Time') private readonly time: Time,
  ) {}

  getAllTasks = async (userId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tasks = await this.taskRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['toDoCategory', 'user'],
    });

    return {
      count: tasks.length,
      items: tasks,
    };
  };

  getTasksByCategory = async (userId: string, categoryId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const tasks = await this.taskRepository.find({
      where: {
        toDoCategory: {
          id: categoryId,
        },
      },
      relations: ['toDoCategory'],
    });

    return {
      count: tasks.length,
      items: tasks,
    };
  };

  getAllCompletedTasks = async (userId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tasks = await this.taskRepository.find({
      where: {
        user: {
          id: userId,
        },
        isCompleted: true,
      },
      relations: ['toDoCategory', 'user'],
    });

    return {
      count: tasks.length,
      items: tasks,
    };
  };

  getTasksForToday = async (userId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = this.time.now();
    const todayString = now.toLocalDate().toString();

    console.log(todayString);

    const tasks = await this.taskRepository.find({
      where: {
        user: {
          id: userId,
        },
        completeDate: Like(`${todayString}`),
      },
      relations: ['toDoCategory', 'user'],
    });

    return {
      count: tasks.length,
      items: tasks,
    };
  };

  getTasksSpecificDay = async (userId: string, dateTime: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const date = dateTime.split('T')[0];

    const tasks = await this.taskRepository.find({
      where: {
        user: {
          id: userId,
        },
        completeDate: Like(`${date}`),
      },
      relations: ['toDoCategory', 'user'],
    });

    return {
      count: tasks.length,
      items: tasks,
    };
  };

  getMonthlyTasks = async (userId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const now = this.time.now();
    const year = now.year();
    const month = now.monthValue();

    const tasks = await this.taskRepository.find({
      where: {
        user: {
          id: userId,
        },
        completeDate: Like(`${year}-${month.toString().padStart(2, '0')}`),
      },
      relations: ['toDoCategory', 'user'],
    });

    return {
      count: tasks.length,
      items: tasks,
    };
  };

  createTask = async (userId: string, createToDoTaskDto: CreateToDoTaskDto) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: createToDoTaskDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const newTask = this.taskRepository.create({
      ...createToDoTaskDto,
      user,
      toDoCategory: category,
    });
    const savedTask = await this.taskRepository.save(newTask);
    return { ...savedTask };
  };

  toggleTaskStatus = async (taskId: string) => {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.update(taskId, {
      isCompleted: !task.isCompleted,
    });

    return this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['toDoCategory', 'user'],
    });
  };

  updateTask = async (taskId: string, updateToDoTaskDto: UpdateToDoTaskDto) => {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['toDoCategory'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    console.log(task);

    const category = await this.categoryRepository.findOne({
      where: { id: task.toDoCategory.id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.taskRepository.update(taskId, {
      ...updateToDoTaskDto,
    });

    return this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['toDoCategory', 'user'],
    });
  };

  deleteTask = async (taskId: string) => {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['toDoCategory', 'user'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.remove(task);

    return task;
  };
}
