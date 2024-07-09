import { ApiServerModule } from './../../src/api-server.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoModule } from '../../src/routes/todo/todo.module';
import { UserModule } from '../../src/routes/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Role } from '../../src/common/enum/user.enum';
import { v4 as uuidv4 } from 'uuid';
import { User, RefreshToken, ToDoCategory, ToDoTask } from '../../src/entity';
import { ZonedDateTime } from '@js-joda/core';
import { StubTime } from '../utils/stub-time';

describe('ToDo 기능 통합 테스트', () => {
  let app: INestApplication;
  let toDoCategoryRepository: Repository<ToDoCategory>;
  let toDoTaskRepository: Repository<ToDoTask>;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let userId: string;
  let token: string;
  let invalidToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiServerModule,
        TodoModule,
        UserModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('jwt.secret'),
            signOptions: { expiresIn: '60m' },
          }),
        }),
      ],
      providers: [
        {
          provide: 'Time',
          useValue: new StubTime(
            ZonedDateTime.parse('2024-07-09T00:00:00Z[UTC]'),
          ),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    toDoCategoryRepository = moduleFixture.get<Repository<ToDoCategory>>(
      getRepositoryToken(ToDoCategory),
    );
    toDoTaskRepository = moduleFixture.get<Repository<ToDoTask>>(
      getRepositoryToken(ToDoTask),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    refreshTokenRepository = moduleFixture.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );

    // 테스트용 사용자 생성
    const user = userRepository.create({
      username: 'test_user',
      email: 'test_user@example.com',
      password: 'test_password',
      postCount: 0,
      role: Role.User,
    });
    await userRepository.save(user);
    userId = user.id;

    // JWT 토큰 발급
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({ id: userId, username: user.username });
    // Invalid JWT 토큰 발급
    const invalidSecret = 'some-invalid-secret'; // Different from your actual secret
    const invalidPayload = {
      id: 'invalid-uuid', // Simulate an invalid user id
      username: 'invalidUser',
      email: 'invalid@example.com',
    };
    invalidToken = jwtService.sign(invalidPayload, { secret: invalidSecret });
  });

  afterAll(async () => {
    // 테스트 이후에 생성된 데이터 정리
    await toDoCategoryRepository.delete({});
    await refreshTokenRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('Todo Category 기능 통합 테스트', () => {
    describe('/todo/category (POST)', () => {
      afterEach(async () => {
        await toDoCategoryRepository.delete({});
      });

      it('카테고리 생성 테스트', async () => {
        // given
        const createCategoryDto = {
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
        };

        const response = await request(app.getHttpServer())
          .post('/todo/category')
          .set('Authorization', `Bearer ${token}`)
          .send(createCategoryDto);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            ...createCategoryDto,
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        // given
        const createCategoryDto = {
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
        };

        const response = await request(app.getHttpServer())
          .post('/todo/category')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send(createCategoryDto);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/category (GET)', () => {
      beforeEach(async () => {
        const createCategoryDto1 = {
          color: {
            id: 'color_id',
            code: '#FFFFFF',
            name: 'white',
          },
          icon: {
            id: 'icon_id_1',
            name: 'icon_name_1',
            symbol: '🌱',
          },
          isEditable: true,
          name: 'category_name_1',
        };
        const createCategoryDto2 = {
          color: {
            id: 'color_id',
            code: '#000000',
            name: 'black',
          },
          icon: {
            id: 'icon_id_2',
            name: 'icon_name_2',
            symbol: '📈',
          },
          isEditable: false,
          name: 'category_name_2',
        };

        const category1 = toDoCategoryRepository.create({
          ...createCategoryDto1,
          user: { id: userId },
        });
        const category2 = toDoCategoryRepository.create({
          ...createCategoryDto2,
          user: { id: userId },
        });
        await toDoCategoryRepository.save(category1);
        await toDoCategoryRepository.save(category2);
      });

      afterEach(async () => {
        await toDoCategoryRepository.delete({});
      });

      it('category 모두 불러오기 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/category`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([
          expect.objectContaining({
            color: expect.objectContaining({
              id: 'color_id',
              code: '#FFFFFF',
              name: 'white',
            }),
            icon: expect.objectContaining({
              id: 'icon_id_1',
              name: 'icon_name_1',
              symbol: '🌱',
            }),
            isEditable: true,
            name: 'category_name_1',
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
          expect.objectContaining({
            color: expect.objectContaining({
              id: 'color_id',
              code: '#000000',
              name: 'black',
            }),
            icon: expect.objectContaining({
              id: 'icon_id_2',
              name: 'icon_name_2',
              symbol: '📈',
            }),
            isEditable: false,
            name: 'category_name_2',
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        ]);
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .get('/todo/category')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/category/:id (GET)', () => {
      let categoryId: string;

      beforeEach(async () => {
        const createCategoryDto = {
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
        };

        const category = toDoCategoryRepository.create({
          ...createCategoryDto,
          user: { id: userId },
        });
        await toDoCategoryRepository.save(category);
        categoryId = category.id;
      });

      afterEach(async () => {
        await toDoCategoryRepository.delete({});
      });

      it('category id로 불러오기 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/category/${categoryId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            color: expect.objectContaining({
              id: 'color_id',
              code: '#FFFFFF',
              name: 'white',
            }),
            icon: expect.objectContaining({
              id: 'icon_id',
              name: 'icon_name',
              symbol: '🌱',
            }),
            isEditable: true,
            name: 'category_name',
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('유효하지 않은 카테고리 아이디로 GET 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidCategoryId = uuidv4();

        const response = await request(app.getHttpServer())
          .get(`/todo/category/${invalidCategoryId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });

    describe('/todo/category/:id (PUT)', () => {
      let categoryId: string;

      beforeEach(async () => {
        const createCategoryDto = {
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
        };

        const category = toDoCategoryRepository.create({
          ...createCategoryDto,
          user: { id: userId },
        });
        await toDoCategoryRepository.save(category);
        categoryId = category.id;
      });

      afterEach(async () => {
        await toDoCategoryRepository.delete({});
      });

      it('category 제목(name) 수정 테스트', async () => {
        const newName = 'updated_category_name';
        const response = await request(app.getHttpServer())
          .put(`/todo/category/${categoryId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: newName });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            color: expect.objectContaining({
              id: 'color_id',
              code: '#FFFFFF',
              name: 'white',
            }),
            icon: expect.objectContaining({
              id: 'icon_id',
              name: 'icon_name',
              symbol: '🌱',
            }),
            isEditable: true,
            name: 'updated_category_name',
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('category 수정 가능 여부(isEditable) 수정 테스트', async () => {
        const response = await request(app.getHttpServer())
          .put(`/todo/category/${categoryId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ isEditable: false });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            color: expect.objectContaining({
              id: 'color_id',
              code: '#FFFFFF',
              name: 'white',
            }),
            icon: expect.objectContaining({
              id: 'icon_id',
              name: 'icon_name',
              symbol: '🌱',
            }),
            isEditable: false,
            name: 'category_name',
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('category color 객체 수정 테스트', async () => {
        const newColor = {
          id: 'updated_color_id',
          code: '#000000',
          name: 'black',
        };
        const response = await request(app.getHttpServer())
          .put(`/todo/category/${categoryId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ color: newColor });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            color: expect.objectContaining({
              id: 'updated_color_id',
              code: '#000000',
              name: 'black',
            }),
            icon: expect.objectContaining({
              id: 'icon_id',
              name: 'icon_name',
              symbol: '🌱',
            }),
            isEditable: true,
            name: 'category_name',
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('category icon 객체 수정 테스트', async () => {
        const newIcon = {
          id: 'updated_icon_id',
          name: 'updated_icon_name',
          symbol: '📈',
        };
        const response = await request(app.getHttpServer())
          .put(`/todo/category/${categoryId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ icon: newIcon });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            color: expect.objectContaining({
              id: 'color_id',
              code: '#FFFFFF',
              name: 'white',
            }),
            icon: expect.objectContaining({
              id: 'updated_icon_id',
              name: 'updated_icon_name',
              symbol: '📈',
            }),
            isEditable: true,
            name: 'category_name',
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('유효하지 않은 카테고리 아이디로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidCategoryId = uuidv4();

        const response = await request(app.getHttpServer())
          .put(`/todo/category/${invalidCategoryId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'updated_category_name' });

        expect(response.status).toBe(404);
      });
    });

    describe('/todo/category/:id (DELETE)', () => {
      let categoryId: string;

      beforeEach(async () => {
        const createCategoryDto = {
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
        };

        const category = toDoCategoryRepository.create({
          ...createCategoryDto,
          user: { id: userId },
        });
        await toDoCategoryRepository.save(category);
        categoryId = category.id;
      });

      afterEach(async () => {
        await toDoCategoryRepository.delete({});
      });

      it('category 삭제 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/todo/category/${categoryId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            color: expect.objectContaining({
              id: 'color_id',
              code: '#FFFFFF',
              name: 'white',
            }),
            icon: expect.objectContaining({
              id: 'icon_id',
              name: 'icon_name',
              symbol: '🌱',
            }),
            isEditable: true,
            name: 'category_name',
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
        const deletedCategory = await toDoCategoryRepository.findOneBy({
          id: categoryId,
        });
        expect(deletedCategory).toBeNull();
      });

      it('유효하지 않은 카테고리 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidCategoryId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/todo/category/${invalidCategoryId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });
  });

  describe('Todo Task 기능 통합 테스트', () => {
    let categoryId: string;
    let extraCategoryId: string;

    beforeAll(async () => {
      // category 초기 설정
      const createCategoryDto = {
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
      };
      const createExtraCategoryDto = {
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
      };

      const category = toDoCategoryRepository.create({
        ...createCategoryDto,
        user: { id: userId },
      });
      await toDoCategoryRepository.save(category);
      categoryId = category.id;
      const extraCategory = toDoCategoryRepository.create({
        ...createExtraCategoryDto,
        user: { id: userId },
      });
      await toDoCategoryRepository.save(extraCategory);
      extraCategoryId = extraCategory.id;
    });

    describe('/todo/task (POST)', () => {
      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('할 일 생성 테스트', async () => {
        // given
        const createTaskDto = {
          categoryId,
          name: 'task_name',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };

        const response = await request(app.getHttpServer())
          .post('/todo/task')
          .set('Authorization', `Bearer ${token}`)
          .send(createTaskDto);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            ...createTaskDto,
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        // given
        const createTaskDto = {
          categoryId,
          name: 'task_name',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };

        const response = await request(app.getHttpServer())
          .post('/todo/task')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send(createTaskDto);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/task/all (GET)', () => {
      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };
        const createTaskDto2 = {
          categoryId,
          name: 'task_name_2',
          isCompleted: true,
          categorySubj: 'CSE',
          completeDate: '2024-07-08T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });
        const task2 = toDoTaskRepository.create({
          ...createTaskDto2,
          user: { id: userId },
        });
        await toDoTaskRepository.save(task1);
        await toDoTaskRepository.save(task2);
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('task 모두 불러오기 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/category/all`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          count: 2,
          items: [
            expect.objectContaining({
              name: 'task_name_1',
              isCompleted: false,
              categorySubj: 'AMS',
              completeDate: '2024-07-07T16:45:38.913Z',
              toDoCategory: expect.objectContaining({
                id: categoryId,
                name: 'category_name',
              }),
              user: expect.objectContaining({
                id: userId,
                username: 'test_user',
                email: 'test_user@example.com',
              }),
            }),
            expect.objectContaining({
              name: 'task_name_2',
              isCompleted: true,
              categorySubj: 'CSE',
              completeDate: '2024-07-08T16:45:38.913Z',
              toDoCategory: expect.objectContaining({
                id: categoryId,
                name: 'category_name',
              }),
              user: expect.objectContaining({
                id: userId,
                username: 'test_user',
                email: 'test_user@example.com',
              }),
            }),
          ],
        });
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .get('/todo/task/all')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/task/category/:categoryId (GET)', () => {
      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };
        const createTaskDto2 = {
          extraCategoryId,
          name: 'task_name_2',
          isCompleted: true,
          categorySubj: 'CSE',
          completeDate: '2024-07-08T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });
        const task2 = toDoTaskRepository.create({
          ...createTaskDto2,
          user: { id: userId },
        });
        await toDoTaskRepository.save(task1);
        await toDoTaskRepository.save(task2);
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('task 카테고리별로 불러오기 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/task/category/${categoryId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          count: 1,
          items: [
            expect.objectContaining({
              name: 'task_name_1',
              isCompleted: false,
              categorySubj: 'AMS',
              completeDate: '2024-07-07T16:45:38.913Z',
              toDoCategory: expect.objectContaining({
                id: categoryId,
                name: 'category_name',
              }),
              user: expect.objectContaining({
                id: userId,
                username: 'test_user',
                email: 'test_user@example.com',
              }),
            }),
          ],
        });
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/task/category/${categoryId}`)
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
      });

      it('유효하지 않은 카테고리 id로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const invalidCategoryId = uuidv4();

        const response = await request(app.getHttpServer())
          .get(`/todo/task/category/${invalidCategoryId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/task/completed (GET)', () => {
      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };
        const createTaskDto2 = {
          categoryId,
          name: 'task_name_2',
          isCompleted: true,
          categorySubj: 'CSE',
          completeDate: '2024-07-08T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });
        const task2 = toDoTaskRepository.create({
          ...createTaskDto2,
          user: { id: userId },
        });
        await toDoTaskRepository.save(task1);
        await toDoTaskRepository.save(task2);
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('task 완료된 것들만 모두 불러오기 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/task/completed`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          count: 1,
          items: [
            expect.objectContaining({
              name: 'task_name_2',
              isCompleted: true,
              categorySubj: 'CSE',
              completeDate: '2024-07-08T16:45:38.913Z',
              toDoCategory: expect.objectContaining({
                id: categoryId,
                name: 'category_name',
              }),
              user: expect.objectContaining({
                id: userId,
                username: 'test_user',
                email: 'test_user@example.com',
              }),
            }),
          ],
        });
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .get('/todo/task/completed')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/task/today (GET)', () => {
      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };
        const createTaskDto2 = {
          categoryId,
          name: 'task_name_2',
          isCompleted: true,
          categorySubj: 'CSE',
          completeDate: '2024-07-08T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });
        const task2 = toDoTaskRepository.create({
          ...createTaskDto2,
          user: { id: userId },
        });
        await toDoTaskRepository.save(task1);
        await toDoTaskRepository.save(task2);
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('오늘 완료해야 할 task 모두 불러오기 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/task/today`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          count: 1,
          items: [
            expect.objectContaining({
              name: 'task_name_1',
              isCompleted: false,
              categorySubj: 'AMS',
              completeDate: '2024-07-07T16:45:38.913Z',
              toDoCategory: expect.objectContaining({
                id: categoryId,
                name: 'category_name',
              }),
              user: expect.objectContaining({
                id: userId,
                username: 'test_user',
                email: 'test_user@example.com',
              }),
            }),
          ],
        });
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .get('/todo/task/today')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/task/date/:dateString (GET)', () => {
      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };
        const createTaskDto2 = {
          categoryId,
          name: 'task_name_2',
          isCompleted: true,
          categorySubj: 'CSE',
          completeDate: '2024-07-08T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });
        const task2 = toDoTaskRepository.create({
          ...createTaskDto2,
          user: { id: userId },
        });
        await toDoTaskRepository.save(task1);
        await toDoTaskRepository.save(task2);
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('task 모두 불러오기 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/task/date/2024-07-07T16:45:38.913Z`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          count: 1,
          items: [
            expect.objectContaining({
              name: 'task_name_1',
              isCompleted: false,
              categorySubj: 'AMS',
              completeDate: '2024-07-07T16:45:38.913Z',
              toDoCategory: expect.objectContaining({
                id: categoryId,
                name: 'category_name',
              }),
              user: expect.objectContaining({
                id: userId,
                username: 'test_user',
                email: 'test_user@example.com',
              }),
            }),
          ],
        });
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .get('/todo/task/date/2024-07-07T16:45:38.913Z')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/task/monthly (GET)', () => {
      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };
        const createTaskDto2 = {
          categoryId,
          name: 'task_name_2',
          isCompleted: true,
          categorySubj: 'CSE',
          completeDate: '2024-08-08T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });
        const task2 = toDoTaskRepository.create({
          ...createTaskDto2,
          user: { id: userId },
        });
        await toDoTaskRepository.save(task1);
        await toDoTaskRepository.save(task2);
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('이번 달 완료해야 할 task 모두 불러오기 테스트', async () => {
        const response = await request(app.getHttpServer())
          .get(`/todo/task/monthly`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          count: 1,
          items: [
            expect.objectContaining({
              name: 'task_name_1',
              isCompleted: false,
              categorySubj: 'AMS',
              completeDate: '2024-07-07T16:45:38.913Z',
              toDoCategory: expect.objectContaining({
                id: categoryId,
                name: 'category_name',
              }),
              user: expect.objectContaining({
                id: userId,
                username: 'test_user',
                email: 'test_user@example.com',
              }),
            }),
          ],
        });
      });

      it('유효하지 않은 유저 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .get('/todo/task/monthly')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
      });
    });

    describe('/todo/task-toggle/:id (PUT)', () => {
      let taskId: string;

      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });

        await toDoTaskRepository.save(task1);
        taskId = task1.id;
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('할 일(task) 완료 여부 토글 테스트', async () => {
        const response = await request(app.getHttpServer())
          .put(`/todo/task-toggle/${taskId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            name: 'task_name_1',
            isCompleted: true,
            categorySubj: 'AMS',
            completeDate: '2024-07-07T16:45:38.913Z',
            toDoCategory: expect.objectContaining({
              id: categoryId,
              name: 'category_name',
            }),
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('유효하지 않은 task 아이디로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidTaskId = uuidv4();

        const response = await request(app.getHttpServer())
          .put(`/todo/task-toggle/${invalidTaskId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });

      it('유효하지 않은 유저 토큰으로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .put(`/todo/task-toggle/${taskId}`)
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(404);
      });
    });

    describe('/todo/task/:id (PUT)', () => {
      let taskId: string;

      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });

        await toDoTaskRepository.save(task1);
        taskId = task1.id;
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('task 이름(name) 수정 테스트', async () => {
        const newName = 'updated_task_name';
        const response = await request(app.getHttpServer())
          .put(`/todo/task/${taskId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: newName });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            name: 'updated_task_name',
            isCompleted: true,
            categorySubj: 'AMS',
            completeDate: '2024-07-07T16:45:38.913Z',
            toDoCategory: expect.objectContaining({
              id: categoryId,
              name: 'category_name',
            }),
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('task 완료 날짜(completeDate) 수정 테스트', async () => {
        const response = await request(app.getHttpServer())
          .put(`/todo/task/${taskId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ completeDate: '2024-07-08T15:45:38.913Z' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            name: 'task_name_1',
            isCompleted: true,
            categorySubj: 'AMS',
            completeDate: '2024-07-08T15:45:38.913Z',
            toDoCategory: expect.objectContaining({
              id: categoryId,
              name: 'category_name',
            }),
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
      });

      it('유효하지 않은 task 아이디로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidTaskId = uuidv4();

        const response = await request(app.getHttpServer())
          .put(`/todo/task/${invalidTaskId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'updated_task_name' });

        expect(response.status).toBe(404);
      });
    });

    describe('/todo/task/:id (DELETE)', () => {
      let taskId: string;

      beforeEach(async () => {
        const createTaskDto1 = {
          categoryId,
          name: 'task_name_1',
          isCompleted: false,
          categorySubj: 'AMS',
          completeDate: '2024-07-07T16:45:38.913Z',
        };

        const task1 = toDoTaskRepository.create({
          ...createTaskDto1,
          user: { id: userId },
        });

        await toDoTaskRepository.save(task1);
        taskId = task1.id;
      });

      afterEach(async () => {
        await toDoTaskRepository.delete({});
      });

      it('task 삭제 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/todo/task/${taskId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            name: 'task_name_1',
            isCompleted: true,
            categorySubj: 'AMS',
            completeDate: '2024-07-07T15:45:38.913Z',
            toDoCategory: expect.objectContaining({
              id: categoryId,
              name: 'category_name',
            }),
            user: expect.objectContaining({
              id: userId,
              username: 'test_user',
              email: 'test_user@example.com',
            }),
          }),
        );
        const deletedTask = await toDoTaskRepository.findOneBy({
          id: taskId,
        });
        expect(deletedTask).toBeNull();
      });

      it('유효하지 않은 task 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidTaskId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/todo/task/${invalidTaskId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });
  });
});
