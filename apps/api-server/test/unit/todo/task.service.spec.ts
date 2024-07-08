import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../../../src/routes/todo/task/task.service';
import { ToDoCategory, ToDoTask, User } from '../../../src/entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubTaskRepository } from './stub/task-repository';
import { NotFoundException } from '@nestjs/common';
import { StubUserRepository } from '../user/stub-repository';
import { StubCategoryRepository } from './stub/category-repository';
import { StubTime } from '../../utils/stub-time';
import { ZonedDateTime } from '@js-joda/core';

describe('투두 할 일 관련 서비스 테스트', () => {
  let taskService: TaskService;
  let taskRepository: StubTaskRepository;
  let categoryRepository: StubCategoryRepository;
  let userRepository: StubUserRepository;
  const categoryRepositoryToken = getRepositoryToken(ToDoCategory);
  const taskRepositoryToken = getRepositoryToken(ToDoTask);
  const userRepositoryToken = getRepositoryToken(User);
  const userId = 'test_user_id';
  const categoryId = 'test_category_id';
  const fixedTime = StubTime.of(2024, 7, 7, 0, 0, 0);
  const testTime = new StubTime(fixedTime);

  beforeEach(async () => {
    taskRepository = new StubTaskRepository();
    categoryRepository = new StubCategoryRepository();
    userRepository = new StubUserRepository();

    categoryRepository.toDoCategories.push({
      id: categoryId,
      color: {
        id: 'color_id',
        code: '#FFFFFF',
        name: 'white',
      },
      icon: {
        id: 'icon_id',
        name: 'icon_name',
        symbol: '🌱',
      },
      isEditable: true,
      name: 'category_name',
      user: {
        createdAt: new Date('2024-06-28T18:19:29.764Z'),
        email: 'test_email',
        id: 'test_user_id',
        password: 'test_password',
        postCount: 0,
        role: 'USER',
        updateAt: new Date('2024-06-28T18:19:29.764Z'),
        username: 'test_name',
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: taskRepositoryToken,
          useValue: taskRepository,
        },
        {
          provide: categoryRepositoryToken,
          useValue: categoryRepository,
        },
        {
          provide: userRepositoryToken,
          useValue: userRepository,
        },
        {
          provide: 'Time',
          useValue: new StubTime(
            ZonedDateTime.parse('2024-07-07T00:00:00Z[UTC]'),
          ),
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
  });

  describe('createTask 함수 테스트', () => {
    it('createTask 함수 결과값 테스트', async () => {
      // given
      const createTaskDto = {
        categoryId,
        name: 'task_name',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T16:45:38.913Z',
      };
      const taskCount = taskRepository.toDoTasks.length;

      // when
      const result = await taskService.createTask(userId, createTaskDto);

      // then
      expect(result).toEqual({
        id: 'todo-task-id',
        name: 'task_name',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T16:45:38.913Z',
        categoryId,
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(taskRepository.toDoTasks.length).toBe(taskCount + 1);
      expect(taskRepository.toDoTasks).toContainEqual({
        id: 'todo-task-id',
        name: 'task_name',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T16:45:38.913Z',
        categoryId,
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';
      const createTaskDto = {
        categoryId,
        name: 'task_name',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T16:45:38.913Z',
      };

      // then
      expect(taskService.createTask(userId, createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllTasks & getTasksByCategory & getAllCompletedTasks & getTasksForToday & getTasksSpecificDay & getMonthlyTasks 함수 테스트', () => {
    it('getAllTasks 함수 결과값 테스트', async () => {
      // given
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-2',
        name: 'task_name_2',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-08T16:45:38.913Z',
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });

      // when
      const result = await taskService.getAllTasks(userId);

      // then
      expect(result).toEqual({
        count: 2,
        items: [
          {
            id: 'todo-task-id-1',
            name: 'task_name_1',
            isCompleted: false,
            categorySubj: 'AMS',
            completeDate: '2024-07-07T15:45:38.913Z',
            toDoCategory: {
              id: categoryId,
              color: {
                id: 'color_id',
                code: '#FFFFFF',
                name: 'white',
              },
              icon: {
                id: 'icon_id',
                name: 'icon_name',
                symbol: '🌱',
              },
              isEditable: true,
              name: 'category_name',
              user: {
                createdAt: new Date('2024-06-28T18:19:29.764Z'),
                email: 'test_email',
                id: 'test_user_id',
                password: 'test_password',
                postCount: 0,
                role: 'USER',
                updateAt: new Date('2024-06-28T18:19:29.764Z'),
                username: 'test_name',
              },
            },
            user: {
              createdAt: new Date('2024-06-28T18:19:29.764Z'),
              email: 'test_email',
              id: 'test_user_id',
              password: 'test_password',
              postCount: 0,
              role: 'USER',
              updateAt: new Date('2024-06-28T18:19:29.764Z'),
              username: 'test_name',
            },
          },
          {
            id: 'todo-task-id-2',
            name: 'task_name_2',
            isCompleted: false,
            categorySubj: 'AMS',
            completeDate: '2024-07-08T16:45:38.913Z',
            toDoCategory: {
              id: categoryId,
              color: {
                id: 'color_id',
                code: '#FFFFFF',
                name: 'white',
              },
              icon: {
                id: 'icon_id',
                name: 'icon_name',
                symbol: '🌱',
              },
              isEditable: true,
              name: 'category_name',
              user: {
                createdAt: new Date('2024-06-28T18:19:29.764Z'),
                email: 'test_email',
                id: 'test_user_id',
                password: 'test_password',
                postCount: 0,
                role: 'USER',
                updateAt: new Date('2024-06-28T18:19:29.764Z'),
                username: 'test_name',
              },
            },
            user: {
              createdAt: new Date('2024-06-28T18:19:29.764Z'),
              email: 'test_email',
              id: 'test_user_id',
              password: 'test_password',
              postCount: 0,
              role: 'USER',
              updateAt: new Date('2024-06-28T18:19:29.764Z'),
              username: 'test_name',
            },
          },
        ],
      });
    });

    it('getAllTasks: userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidUserId = 'invalid-user-id';

      expect(taskService.getAllTasks(invalidUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getTasksByCategory 함수 결과값 테스트', async () => {
      // given
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-2',
        name: 'task_name_2',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-08T16:45:38.913Z',
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });

      // when
      const result = await taskService.getTasksByCategory(userId, categoryId);

      // then
      expect(result).toEqual({
        count: 2,
        items: [
          {
            id: 'todo-task-id-1',
            name: 'task_name_1',
            isCompleted: false,
            categorySubj: 'AMS',
            completeDate: '2024-07-07T15:45:38.913Z',
            toDoCategory: {
              id: categoryId,
              color: {
                id: 'color_id',
                code: '#FFFFFF',
                name: 'white',
              },
              icon: {
                id: 'icon_id',
                name: 'icon_name',
                symbol: '🌱',
              },
              isEditable: true,
              name: 'category_name',
              user: {
                createdAt: new Date('2024-06-28T18:19:29.764Z'),
                email: 'test_email',
                id: 'test_user_id',
                password: 'test_password',
                postCount: 0,
                role: 'USER',
                updateAt: new Date('2024-06-28T18:19:29.764Z'),
                username: 'test_name',
              },
            },
            user: {
              createdAt: new Date('2024-06-28T18:19:29.764Z'),
              email: 'test_email',
              id: 'test_user_id',
              password: 'test_password',
              postCount: 0,
              role: 'USER',
              updateAt: new Date('2024-06-28T18:19:29.764Z'),
              username: 'test_name',
            },
          },
          {
            id: 'todo-task-id-2',
            name: 'task_name_2',
            isCompleted: false,
            categorySubj: 'AMS',
            completeDate: '2024-07-08T16:45:38.913Z',
            toDoCategory: {
              id: categoryId,
              color: {
                id: 'color_id',
                code: '#FFFFFF',
                name: 'white',
              },
              icon: {
                id: 'icon_id',
                name: 'icon_name',
                symbol: '🌱',
              },
              isEditable: true,
              name: 'category_name',
              user: {
                createdAt: new Date('2024-06-28T18:19:29.764Z'),
                email: 'test_email',
                id: 'test_user_id',
                password: 'test_password',
                postCount: 0,
                role: 'USER',
                updateAt: new Date('2024-06-28T18:19:29.764Z'),
                username: 'test_name',
              },
            },
            user: {
              createdAt: new Date('2024-06-28T18:19:29.764Z'),
              email: 'test_email',
              id: 'test_user_id',
              password: 'test_password',
              postCount: 0,
              role: 'USER',
              updateAt: new Date('2024-06-28T18:19:29.764Z'),
              username: 'test_name',
            },
          },
        ],
      });
    });

    it('getTasksByCategory: categoryId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const categoryId = 'invalid-category-id';

      // then
      expect(
        taskService.getTasksByCategory(userId, categoryId),
      ).rejects.toThrow(NotFoundException);
    });

    it('getAllCompletedTasks 함수 결과값 테스트', async () => {
      // given
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-2',
        name: 'task_name_2',
        isCompleted: true,
        categorySubj: 'AMS',
        completeDate: '2024-07-08T16:45:38.913Z',
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });

      // when
      const result = await taskService.getAllCompletedTasks(userId);

      // then
      expect(result).toEqual({
        count: 1,
        items: [
          {
            id: 'todo-task-id-2',
            name: 'task_name_2',
            isCompleted: true,
            categorySubj: 'AMS',
            completeDate: '2024-07-08T16:45:38.913Z',
            toDoCategory: {
              id: categoryId,
              color: {
                id: 'color_id',
                code: '#FFFFFF',
                name: 'white',
              },
              icon: {
                id: 'icon_id',
                name: 'icon_name',
                symbol: '🌱',
              },
              isEditable: true,
              name: 'category_name',
              user: {
                createdAt: new Date('2024-06-28T18:19:29.764Z'),
                email: 'test_email',
                id: 'test_user_id',
                password: 'test_password',
                postCount: 0,
                role: 'USER',
                updateAt: new Date('2024-06-28T18:19:29.764Z'),
                username: 'test_name',
              },
            },
            user: {
              createdAt: new Date('2024-06-28T18:19:29.764Z'),
              email: 'test_email',
              id: 'test_user_id',
              password: 'test_password',
              postCount: 0,
              role: 'USER',
              updateAt: new Date('2024-06-28T18:19:29.764Z'),
              username: 'test_name',
            },
          },
        ],
      });
    });

    it('getAllCompletedTasks: userId 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';

      // then
      expect(taskService.getAllCompletedTasks(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    // 시간 관련 함수들
    it('getTasksForToday 함수 결과값 테스트', async () => {
      // given
      const timeStringValid = testTime.toString();
      const timeStringInvalid = testTime.plusDays(1).toString();
      console.log('time valid', timeStringValid);
      console.log('time invalid', timeStringInvalid);
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: timeStringInvalid,
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-2',
        name: 'task_name_2',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: timeStringValid,
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });

      // when
      const result = await taskService.getTasksForToday(userId);

      // then
      expect(result).toEqual({
        count: 1,
        items: [
          {
            id: 'todo-task-id-2',
            name: 'task_name_2',
            isCompleted: false,
            categorySubj: 'AMS',
            completeDate: timeStringValid,
            toDoCategory: {
              id: categoryId,
              color: {
                id: 'color_id',
                code: '#FFFFFF',
                name: 'white',
              },
              icon: {
                id: 'icon_id',
                name: 'icon_name',
                symbol: '🌱',
              },
              isEditable: true,
              name: 'category_name',
              user: {
                createdAt: new Date('2024-06-28T18:19:29.764Z'),
                email: 'test_email',
                id: 'test_user_id',
                password: 'test_password',
                postCount: 0,
                role: 'USER',
                updateAt: new Date('2024-06-28T18:19:29.764Z'),
                username: 'test_name',
              },
            },
            user: {
              createdAt: new Date('2024-06-28T18:19:29.764Z'),
              email: 'test_email',
              id: 'test_user_id',
              password: 'test_password',
              postCount: 0,
              role: 'USER',
              updateAt: new Date('2024-06-28T18:19:29.764Z'),
              username: 'test_name',
            },
          },
        ],
      });
    });

    it('getTasksForToday: userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';

      // then
      expect(taskService.getTasksForToday(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getTasksSpecificDay 함수 결과값 테스트', async () => {
      // given
      const timeStringValid = testTime.toString();
      const timeStringInvalid = testTime.plusDays(1).toString();
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: timeStringInvalid,
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-2',
        name: 'task_name_2',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: timeStringValid,
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });

      // when
      const result = await taskService.getTasksSpecificDay(
        userId,
        testTime.toString(),
      );

      // then
      expect(result).toEqual({
        count: 1,
        items: [
          {
            id: 'todo-task-id-2',
            name: 'task_name_2',
            isCompleted: false,
            categorySubj: 'AMS',
            completeDate: timeStringValid,
            toDoCategory: {
              id: categoryId,
              color: {
                id: 'color_id',
                code: '#FFFFFF',
                name: 'white',
              },
              icon: {
                id: 'icon_id',
                name: 'icon_name',
                symbol: '🌱',
              },
              isEditable: true,
              name: 'category_name',
              user: {
                createdAt: new Date('2024-06-28T18:19:29.764Z'),
                email: 'test_email',
                id: 'test_user_id',
                password: 'test_password',
                postCount: 0,
                role: 'USER',
                updateAt: new Date('2024-06-28T18:19:29.764Z'),
                username: 'test_name',
              },
            },
            user: {
              createdAt: new Date('2024-06-28T18:19:29.764Z'),
              email: 'test_email',
              id: 'test_user_id',
              password: 'test_password',
              postCount: 0,
              role: 'USER',
              updateAt: new Date('2024-06-28T18:19:29.764Z'),
              username: 'test_name',
            },
          },
        ],
      });
    });

    it('getTasksSpecificDay: userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';

      // then
      expect(
        taskService.getTasksSpecificDay(userId, testTime.toString()),
      ).rejects.toThrow(NotFoundException);
    });

    it('getMonthlyTasks 함수 결과값 테스트', async () => {
      // given
      const timeStringValid = testTime.toString();
      const timeStringInvalid = testTime.plusMonths(1).toString();
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: timeStringInvalid,
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-2',
        name: 'task_name_2',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: timeStringValid,
        toDoCategory: {
          id: categoryId,
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });

      // when
      const result = await taskService.getMonthlyTasks(userId);

      // then
      expect(result).toEqual({
        count: 1,
        items: [
          {
            id: 'todo-task-id-2',
            name: 'task_name_2',
            isCompleted: false,
            categorySubj: 'AMS',
            completeDate: timeStringValid,
            toDoCategory: {
              id: categoryId,
              color: {
                id: 'color_id',
                code: '#FFFFFF',
                name: 'white',
              },
              icon: {
                id: 'icon_id',
                name: 'icon_name',
                symbol: '🌱',
              },
              isEditable: true,
              name: 'category_name',
              user: {
                createdAt: new Date('2024-06-28T18:19:29.764Z'),
                email: 'test_email',
                id: 'test_user_id',
                password: 'test_password',
                postCount: 0,
                role: 'USER',
                updateAt: new Date('2024-06-28T18:19:29.764Z'),
                username: 'test_name',
              },
            },
            user: {
              createdAt: new Date('2024-06-28T18:19:29.764Z'),
              email: 'test_email',
              id: 'test_user_id',
              password: 'test_password',
              postCount: 0,
              role: 'USER',
              updateAt: new Date('2024-06-28T18:19:29.764Z'),
              username: 'test_name',
            },
          },
        ],
      });
    });

    it('getMonthlyTasks: userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';

      // then
      expect(taskService.getMonthlyTasks(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleTaskStatus 함수 테스트', () => {
    it('toggleTaskStatus 함수 결과값 테스트', async () => {
      // given
      const taskId = 'todo-task-id-1';
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'update_category_test_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const taskCount = taskRepository.toDoTasks.length;

      // when
      const result = await taskService.toggleTaskStatus(taskId);

      // then
      expect(result).toEqual({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: true,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'update_category_test_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(taskRepository.toDoTasks.length).toBe(taskCount);
      expect(taskRepository.toDoTasks).toContainEqual({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: true,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'update_category_test_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('taskId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const taskId = 'invalid-task-id';

      // then
      expect(taskService.toggleTaskStatus(taskId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTask 함수 테스트', () => {
    it('투두 할 일 이름(name) 변경 시 updateTask 함수 결과값 테스트', async () => {
      // given
      const taskId = 'todo-task-id-1';
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'test_category_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const taskCount = taskRepository.toDoTasks.length;

      // when
      const result = await taskService.updateTask(taskId, {
        name: 'new_task_name',
      });

      // then
      expect(result).toEqual({
        id: 'todo-task-id-1',
        name: 'new_task_name',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'test_category_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(taskRepository.toDoTasks.length).toBe(taskCount);
      expect(taskRepository.toDoTasks).toContainEqual({
        id: 'todo-task-id-1',
        name: 'new_task_name',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'test_category_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('투두 카테고리 수정 가능 여부(completeDate) 변경 시 updateTask 함수 결과값 테스트', async () => {
      // given
      const taskId = 'todo-task-id-1';
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'test_category_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const taskCount = taskRepository.toDoTasks.length;

      // when
      const result = await taskService.updateTask(taskId, {
        completeDate: '2024-07-08T15:45:38.913Z',
      });

      // then
      expect(result).toEqual({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-08T15:45:38.913Z',
        toDoCategory: {
          id: 'test_category_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(taskRepository.toDoTasks.length).toBe(taskCount);
      expect(taskRepository.toDoTasks).toContainEqual({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-08T15:45:38.913Z',
        toDoCategory: {
          id: 'test_category_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('taskId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const taskId = 'invalid-task-id';

      // then
      expect(
        taskService.updateTask(taskId, {
          completeDate: '2024-07-08T15:45:38.913Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTask 함수 테스트', () => {
    it('deleteTask 함수 결과값 테스트', async () => {
      // given
      const taskId = 'todo-task-id-1';
      taskRepository.toDoTasks.push({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'update_category_test_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      const taskCount = taskRepository.toDoTasks.length;

      // when
      const result = await taskService.deleteTask(taskId);

      // then
      expect(result).toEqual({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'update_category_test_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(taskRepository.toDoTasks.length).toBe(taskCount - 1);
      expect(taskRepository.toDoTasks).not.toContainEqual({
        id: 'todo-task-id-1',
        name: 'task_name_1',
        isCompleted: false,
        categorySubj: 'AMS',
        completeDate: '2024-07-07T15:45:38.913Z',
        toDoCategory: {
          id: 'update_category_test_id',
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id',
            name: 'icon_name',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name',
          user: {
            createdAt: new Date('2024-06-28T18:19:29.764Z'),
            email: 'test_email',
            id: 'test_user_id',
            password: 'test_password',
            postCount: 0,
            role: 'USER',
            updateAt: new Date('2024-06-28T18:19:29.764Z'),
            username: 'test_name',
          },
        },
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          postCount: 0,
          role: 'USER',
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('taskId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const taskId = 'invalid-task-id';

      // then
      expect(taskService.deleteTask(taskId)).rejects.toThrow(NotFoundException);
    });
  });
});
