import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ToDoCategory, ToDoTask, User } from '../../../entity';
import { Repository } from 'typeorm';
import { CreateToDoTaskDto } from './dto/create-todo-task.dto';
import { Time } from '../../../common/time/time';
import { UpdateToDoTaskDto } from './dto/update-todo-task.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getAllTasks = async (userId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const cacheKey = `tasks-${userId}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult as { count: number; items: ToDoTask[] };
    }

    try {
      const tasks = await this.taskRepository.find({
        where: {
          user: {
            id: userId,
          },
        },
        relations: ['toDoCategory', 'user'],
      });

      await this.cacheManager.set(
        cacheKey,
        { items: tasks, count: tasks.length },
        60 * 60 * 5,
      );

      return {
        count: tasks.length,
        items: tasks,
      };
    } catch (error) {
      console.log(error);
    }
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
      relations: ['toDoCategory', 'user'],
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

    const cacheKey = `tasks-today-${userId}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult as { count: number; items: ToDoTask[] };
    }

    try {
      const now = this.time.now();
      const todayString = now.toLocalDate().toString();

      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.toDoCategory', 'toDoCategory')
        .leftJoinAndSelect('task.user', 'user')
        .where('task.userId = :userId', { userId })
        .andWhere('task.completeDate LIKE :todayString', {
          todayString: `${todayString}%`,
        })
        .getMany();

      await this.cacheManager.set(
        cacheKey,
        { items: tasks, count: tasks.length },
        60 * 60 * 5,
      );

      return {
        count: tasks.length,
        items: tasks,
      };
    } catch (error) {
      console.log(error);
    }
  };

  getTasksSpecificDay = async (userId: string, dateTime: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const date = dateTime.split('T')[0];

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.toDoCategory', 'toDoCategory')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.userId = :userId', { userId })
      .andWhere('task.completeDate LIKE :date', {
        date: `${date}%`,
      })
      .getMany();

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

    const cacheKey = `tasks-monthly-${userId}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult as { count: number; items: ToDoTask[] };
    }

    try {
      const now = this.time.now();
      const year = now.year();
      const month = now.monthValue();
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;

      const tasks = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.toDoCategory', 'toDoCategory')
        .leftJoinAndSelect('task.user', 'user')
        .where('task.userId = :userId', { userId })
        .andWhere('task.completeDate LIKE :yearMonth', {
          yearMonth: `${yearMonth}%`,
        })
        .getMany();

      await this.cacheManager.set(
        cacheKey,
        { items: tasks, count: tasks.length },
        60 * 60 * 5,
      );

      return {
        count: tasks.length,
        items: tasks,
      };
    } catch (error) {
      console.log(error);
    }
  };

  createTask = async (
    userId: string,
    {
      categoryId,
      name,
      isCompleted,
      categorySubj,
      completeDate,
    }: CreateToDoTaskDto,
  ) => {
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

    const newTask = this.taskRepository.create({
      name,
      isCompleted,
      categorySubj,
      completeDate,
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
      relations: ['user'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.remove(task);

    return task;
  };
}
