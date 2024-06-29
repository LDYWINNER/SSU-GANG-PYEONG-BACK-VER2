import { ApiServerModule } from './../../src/api-server.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Table } from './../../src/entity/table.entity';
import { User } from './../../src/entity/user.entity';
import { Repository } from 'typeorm';

describe('Table 기능 통합 테스트', () => {
  let app: INestApplication;
  let tableRepository: Repository<Table>;
  let userRepository: Repository<User>;
  let userId: string;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiServerModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tableRepository = moduleFixture.get<Repository<Table>>(
      getRepositoryToken(Table),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    // 테스트용 사용자 생성
    const user = userRepository.create({
      username: 'test_user',
      email: 'test_user@example.com',
      password: 'test_password',
    });
    await userRepository.save(user);
    userId = user.id;

    token = 'test-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/table (POST)', () => {
    it('table 생성 테스트', async () => {
      const tableName = 'new_table';
      const response = await request(app.getHttpServer())
        .post('/table')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: tableName });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: tableName,
          subjects: [],
          user: expect.objectContaining({
            id: userId,
            username: 'test_user',
            email: 'test_user@example.com',
          }),
        }),
      );

      // Cleanup
      await tableRepository.delete(response.body.id);
    });

    it('유효하지 않은 토큰으로 요청을 보내는 경우 404를 반환해야 합니다', async () => {
      const invalidToken = 'invalid-jwt-token';
      const tableName = 'new_table';

      const response = await request(app.getHttpServer())
        .post('/table')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ name: tableName });

      expect(response.status).toBe(404);
    });
  });

  describe('/table/:id (PUT)', () => {
    let tableId: string;

    beforeAll(async () => {
      const table = tableRepository.create({
        title: 'table_to_update',
        subjects: [],
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
          subjects: ['subject1', 'subject2'],
          user: expect.objectContaining({
            id: userId,
          }),
        }),
      );
    });

    it('table subjects array 수정 테스트', async () => {
      const newSubjects = ['subject3', 'subject4'];
      const response = await request(app.getHttpServer())
        .put(`/table/${tableId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ subjects: newSubjects });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: tableId,
          title: 'initial_table',
          subjects: newSubjects,
          user: expect.objectContaining({
            id: userId,
          }),
        }),
      );
    });

    it('table title & subjects array 동시 수정 테스트', async () => {
      const newTitle = 'updated_table';
      const newSubjects = ['subject3', 'subject4'];
      const response = await request(app.getHttpServer())
        .put(`/table/${tableId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: newTitle, subjects: newSubjects });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: tableId,
          title: newTitle,
          subjects: newSubjects,
          user: expect.objectContaining({
            id: userId,
          }),
        }),
      );
    });

    it('유효하지 않은 테이블 아이디로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidTableId = 'invalid-table-id';
      const newTitle = 'updated_table';

      const response = await request(app.getHttpServer())
        .put(`/table/${invalidTableId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: newTitle, subjects: [] });

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
        subjects: [],
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
          id: tableId,
          title: 'table_to_delete',
          subjects: [],
          user: expect.objectContaining({
            id: userId,
            username: 'test_user',
            email: 'test_user@example.com',
          }),
        }),
      );
    });

    it('유효하지 않은 테이블 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidTableId = 'invalid-table-id';

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
