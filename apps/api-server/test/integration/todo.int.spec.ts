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
import { User, RefreshToken, ToDoCategory } from '../../src/entity';

describe('ToDo 기능 통합 테스트', () => {
  let app: INestApplication;
  let toDoCategoryRepository: Repository<ToDoCategory>;
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
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    toDoCategoryRepository = moduleFixture.get<Repository<ToDoCategory>>(
      getRepositoryToken(ToDoCategory),
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
            id: expect.any(String),
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
            id: expect.any(String),
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
});
