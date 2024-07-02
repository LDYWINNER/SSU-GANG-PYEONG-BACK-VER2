import { ApiServerModule } from './../../src/api-server.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Table } from './../../src/entity/table.entity';
import { User } from './../../src/entity/user.entity';
import { Repository } from 'typeorm';
import { TableModule } from '../../src/routes/table/table.module';
import { UserModule } from '../../src/routes/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Role } from '../../src/common/enum/user.enum';
import { RefreshToken } from '../../src/entity/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';

describe('Table 기능 통합 테스트', () => {
  let app: INestApplication;
  let tableRepository: Repository<Table>;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let userId: string;
  let token: string;
  let invalidToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiServerModule,
        TableModule,
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

    tableRepository = moduleFixture.get<Repository<Table>>(
      getRepositoryToken(Table),
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
    console.log('User ID: ', userId);

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
    await tableRepository.delete({});
    await refreshTokenRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/table (POST)', () => {
    it('table 생성 테스트', async () => {
      const tableName = 'new_table';
      const response = await request(app.getHttpServer())
        .post('/table')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: tableName });
      console.log(response.body);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: tableName,
          user: expect.objectContaining({
            id: userId,
            username: 'test_user',
            email: 'test_user@example.com',
          }),
        }),
      );

      // console.log(response.body.id);
      // Cleanup
      await tableRepository.delete(response.body.id);
    });

    it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
      // given
      const tableName = 'new_table';

      const response = await request(app.getHttpServer())
        .post('/table')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ name: tableName });

      expect(response.status).toBe(401);
    });
  });

  describe('/table/:id (PUT)', () => {
    let tableId: string;

    beforeEach(async () => {
      await tableRepository.delete({});
      const table = tableRepository.create({
        title: 'table_to_update',
        user: { id: userId },
      });
      const savedTable = await tableRepository.save(table);
      tableId = savedTable.id;
    });

    it('table title 수정 테스트', async () => {
      const newTitle = 'updated_table';
      const response = await request(app.getHttpServer())
        .put(`/table/${tableId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: newTitle });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: tableId,
          title: newTitle,
          user: expect.objectContaining({
            id: userId,
          }),
        }),
      );
    });

    it('유효하지 않은 테이블 아이디로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidTableId = uuidv4();
      const newTitle = 'updated_table';

      const response = await request(app.getHttpServer())
        .put(`/table/${invalidTableId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: newTitle });

      expect(response.status).toBe(404);
    });

    afterAll(async () => {
      await tableRepository.delete(tableId);
    });
  });

  describe('/table/:id (DELETE)', () => {
    let tableId: string;

    beforeAll(async () => {
      const table = tableRepository.create({
        title: 'table_to_delete',
        user: { id: userId },
      });
      const savedTable = await tableRepository.save(table);
      tableId = savedTable.id;
    });

    it('table 삭제 테스트', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/table/${tableId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          title: 'table_to_delete',
          user: expect.objectContaining({
            id: userId,
          }),
        }),
      );
      const deletedTable = await tableRepository.findOneBy({ id: tableId });
      expect(deletedTable).toBeNull();
    });

    it('유효하지 않은 테이블 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidTableId = uuidv4();

      const response = await request(app.getHttpServer())
        .delete(`/table/${invalidTableId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    afterAll(async () => {
      await tableRepository.delete(tableId);
    });
  });
});
