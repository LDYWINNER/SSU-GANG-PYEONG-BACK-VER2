import { ApiServerModule } from './../../src/api-server.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableModule } from '../../src/routes/table/table.module';
import { UserModule } from '../../src/routes/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserType } from '../../src/common/enum/user.enum';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Table,
  RefreshToken,
  PersonalSchedule,
  SchoolSchedule,
} from '../../src/entity';

describe('Table 기능 통합 테스트', () => {
  let app: INestApplication;
  let tableRepository: Repository<Table>;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let personalScheduleRepository: Repository<PersonalSchedule>;
  let schoolScheduleRepository: Repository<SchoolSchedule>;
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
    personalScheduleRepository = moduleFixture.get<
      Repository<PersonalSchedule>
    >(getRepositoryToken(PersonalSchedule));
    schoolScheduleRepository = moduleFixture.get<Repository<SchoolSchedule>>(
      getRepositoryToken(SchoolSchedule),
    );

    // 테스트용 사용자 생성
    const user = userRepository.create({
      username: 'test_user',
      email: 'test_user@example.com',
      password: 'test_password',
      courseReviewCount: 0,
      role: UserType.User.text,
    });
    await userRepository.save(user);
    userId = user.id;

    // JWT 토큰 발급
    const jwtService = moduleFixture.get<JwtService>(JwtService);
    token = jwtService.sign({ id: userId, username: user.username });
    // Invalid JWT 토큰 발급
    const invalidSecret = 'some-invalid-secret';
    const invalidPayload = {
      id: 'invalid-uuid',
      username: 'invalidUser',
      email: 'invalid@example.com',
    };
    invalidToken = jwtService.sign(invalidPayload, { secret: invalidSecret });
  });

  afterAll(async () => {
    // 테스트 이후에 생성된 데이터 정리
    await tableRepository.delete({});
    await personalScheduleRepository.delete({});
    await schoolScheduleRepository.delete({});
    await refreshTokenRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/table (POST)', () => {
    afterEach(async () => {
      await tableRepository.delete({});
    });

    it('table 생성 테스트', async () => {
      const tableName = 'new_table';
      const response = await request(app.getHttpServer())
        .post('/table')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: tableName });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'new_table',
          user: expect.objectContaining({
            id: userId,
            username: 'test_user',
            email: 'test_user@example.com',
          }),
        }),
      );
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
      const table = tableRepository.create({
        title: 'table_to_update',
        user: { id: userId },
      });
      const savedTable = await tableRepository.save(table);
      tableId = savedTable.id;
    });

    afterEach(async () => {
      await tableRepository.delete({});
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
          title: 'updated_table',
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
  });

  describe('/table/:id (DELETE)', () => {
    let tableId: string;

    beforeEach(async () => {
      const table = tableRepository.create({
        title: 'table_to_delete',
        user: { id: userId },
      });
      const savedTable = await tableRepository.save(table);
      tableId = savedTable.id;
    });

    afterEach(async () => {
      await tableRepository.delete({});
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

    it('personal schedule이 있는 경우 table 삭제 테스트(CASCADE)', async () => {
      const personalSchedule = personalScheduleRepository.create({
        courseId: 'course_id',
        tableTitle: 'table_to_delete',
        sections: {
          section1: {
            days: [1, 3],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
        tableEntity: { id: tableId },
      });
      await personalScheduleRepository.save(personalSchedule);
      const personalScheduleId = personalSchedule.id;

      const response = await request(app.getHttpServer())
        .delete(`/table/${tableId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const deletedTable = await tableRepository.findOneBy({ id: tableId });
      expect(deletedTable).toBeNull();
      const deletedPersonalSchedule =
        await personalScheduleRepository.findOneBy({
          id: personalScheduleId,
        });
      expect(deletedPersonalSchedule).toBeNull();
    });

    it('school schedule이 있는 경우 table 삭제 테스트(CASCADE)', async () => {
      const schoolSchedule = schoolScheduleRepository.create({
        courseId: '65ead96f50d4111ca6f57b00',
        tableTitle: 'test_table',
        optionsTime: '2:00 PM',
        tableEntity: { id: tableId },
      });
      await schoolScheduleRepository.save(schoolSchedule);
      const schoolScheduleId = schoolSchedule.id;

      const response = await request(app.getHttpServer())
        .delete(`/table/${tableId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const deletedTable = await tableRepository.findOneBy({ id: tableId });
      expect(deletedTable).toBeNull();
      const deletedSchoolSchedule = await schoolScheduleRepository.findOneBy({
        id: schoolScheduleId,
      });
      expect(deletedSchoolSchedule).toBeNull();
    });

    it('유효하지 않은 테이블 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
      const invalidTableId = uuidv4();

      const response = await request(app.getHttpServer())
        .delete(`/table/${invalidTableId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('시간표 Personal Schedule 기능 통합 테스트', () => {
    let tableId: string;

    beforeAll(async () => {
      // table 초기 설정
      const table = tableRepository.create({
        title: 'ps_test_table',
        user: { id: userId },
      });
      await tableRepository.save(table);
      tableId = table.id;
    });

    describe('/personal-schedule (POST)', () => {
      afterEach(async () => {
        await personalScheduleRepository.delete({});
      });

      it('personal schedule 생성 테스트', async () => {
        const response = await request(app.getHttpServer())
          .post('/personal-schedule')
          .set('Authorization', `Bearer ${token}`)
          .send({
            tableId: tableId,
            courseId: 'course_id',
            sections: {
              section1: {
                days: [1, 3],
                startTimes: ['10:00'],
                endTimes: ['11:00'],
                locations: ['room1'],
              },
            },
          });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            courseId: 'course_id',
            tableTitle: 'ps_test_table',
            sections: {
              section1: {
                days: [1, 3],
                startTimes: ['10:00'],
                endTimes: ['11:00'],
                locations: ['room1'],
              },
            },
          }),
        );
      });

      it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .post('/personal-schedule')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({
            tableId,
            courseId: 'course_id',
            sections: {
              section1: {
                days: [1, 3],
                startTimes: ['10:00'],
                endTimes: ['11:00'],
                locations: ['room1'],
              },
            },
          });

        expect(response.status).toBe(401);
      });
    });

    describe('/personal-schedule/:id (PUT)', () => {
      let personalScheduleId: string;

      beforeEach(async () => {
        const personalSchedule = personalScheduleRepository.create({
          courseId: 'course_id',
          tableTitle: 'ps_test_table',
          sections: {
            section1: {
              days: [1, 3],
              startTimes: ['10:00'],
              endTimes: ['11:00'],
              locations: ['room1'],
            },
          },
        });

        await personalScheduleRepository.save(personalSchedule);
        personalScheduleId = personalSchedule.id;
      });

      afterEach(async () => {
        await personalScheduleRepository.delete({});
      });

      it('스케줄 제목(courseId) 수정 테스트', async () => {
        const response = await request(app.getHttpServer())
          .put(`/personal-schedule/${personalScheduleId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ courseId: 'updated_course_id' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: personalScheduleId,
            courseId: 'updated_course_id',
          }),
        );
      });

      it('스케줄 sections 수정 테스트', async () => {
        const response = await request(app.getHttpServer())
          .put(`/personal-schedule/${personalScheduleId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            sections: {
              section1: {
                days: [1, 3],
                startTimes: ['10:00'],
                endTimes: ['11:00'],
                locations: ['room1'],
              },
              sections2: {
                days: [2, 4],
                startTimes: ['11:00'],
                endTimes: ['12:00'],
                locations: ['room2'],
              },
            },
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: personalScheduleId,
            sections: {
              section1: {
                days: [1, 3],
                startTimes: ['10:00'],
                endTimes: ['11:00'],
                locations: ['room1'],
              },
              sections2: {
                days: [2, 4],
                startTimes: ['11:00'],
                endTimes: ['12:00'],
                locations: ['room2'],
              },
            },
          }),
        );
      });

      it('스케줄 제목(courseId) & sections 동시 수정 테스트', async () => {
        const response = await request(app.getHttpServer())
          .put(`/personal-schedule/${personalScheduleId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            courseId: 'updated_course_id',
            sections: {
              section1: {
                days: [1, 3],
                startTimes: ['10:00'],
                endTimes: ['11:00'],
                locations: ['room1'],
              },
              sections2: {
                days: [2, 4],
                startTimes: ['11:00'],
                endTimes: ['12:00'],
                locations: ['room2'],
              },
            },
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            id: personalScheduleId,
            courseId: 'updated_course_id',
            sections: {
              section1: {
                days: [1, 3],
                startTimes: ['10:00'],
                endTimes: ['11:00'],
                locations: ['room1'],
              },
              sections2: {
                days: [2, 4],
                startTimes: ['11:00'],
                endTimes: ['12:00'],
                locations: ['room2'],
              },
            },
          }),
        );
      });

      it('유효하지 않은 Personal Schedule 아이디로 수정 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidPersonalScheduleId = uuidv4();

        const response = await request(app.getHttpServer())
          .put(`/personal-schedule/${invalidPersonalScheduleId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ courseId: 'updated_course_id' });

        expect(response.status).toBe(404);
      });
    });

    describe('/personal-schedule/:id (DELETE)', () => {
      let personalScheduleId: string;

      beforeEach(async () => {
        const personalSchedule = personalScheduleRepository.create({
          courseId: 'course_id',
          tableTitle: 'ps_test_table',
          sections: {
            section1: {
              days: [1, 3],
              startTimes: ['10:00'],
              endTimes: ['11:00'],
              locations: ['room1'],
            },
          },
        });
        const savedPersonalSchedule =
          await personalScheduleRepository.save(personalSchedule);
        personalScheduleId = savedPersonalSchedule.id;
      });

      afterEach(async () => {
        await personalScheduleRepository.delete({});
      });

      it('personal schedule 삭제 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/personal-schedule/${personalScheduleId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            courseId: 'course_id',
            tableTitle: 'ps_test_table',
            sections: {
              section1: {
                days: [1, 3],
                startTimes: ['10:00'],
                endTimes: ['11:00'],
                locations: ['room1'],
              },
            },
          }),
        );
        const deletedPersonalSchedule =
          await personalScheduleRepository.findOneBy({
            id: personalScheduleId,
          });
        expect(deletedPersonalSchedule).toBeNull();
      });

      it('유효하지 않은 테이블 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidPersonalScheduleId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/personal-schedule/${invalidPersonalScheduleId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });
  });

  describe('시간표 School Schedule 기능 통합 테스트', () => {
    let tableId: string;
    let tableItem: Table;

    beforeAll(async () => {
      // table 초기 설정
      const table = tableRepository.create({
        title: 'ss_test_table',
        user: { id: userId },
      });
      await tableRepository.save(table);
      tableId = table.id;
      tableItem = table;
    });

    describe('/school-schedule (POST)', () => {
      afterEach(async () => {
        await schoolScheduleRepository.delete({});
      });

      it('school schedule 생성 테스트', async () => {
        const response = await request(app.getHttpServer())
          .post('/school-schedule')
          .set('Authorization', `Bearer ${token}`)
          .send({
            tableId: tableId,
            courseId: '65ead96f50d4111ca6f57b00',
            optionsTime: '2:00 PM',
          });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            courseId: '65ead96f50d4111ca6f57b00',
            tableTitle: 'ss_test_table',
            optionsTime: '2:00 PM',
          }),
        );
      });

      it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .post('/school-schedule')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({
            tableId: tableId,
            courseId: '65ead96f50d4111ca6f57b00',
            optionsTime: '2:00 PM',
          });

        expect(response.status).toBe(401);
      });
    });

    describe('/school-schedule/:id (DELETE)', () => {
      let schoolScheduleId: string;

      beforeEach(async () => {
        const schoolSchedule = schoolScheduleRepository.create({
          courseId: '65ead96f50d4111ca6f57b00',
          tableTitle: 'test_table',
          optionsTime: '2:00 PM',
        });
        const savedSchoolSchedule =
          await schoolScheduleRepository.save(schoolSchedule);
        schoolScheduleId = savedSchoolSchedule.id;
      });

      afterEach(async () => {
        await schoolScheduleRepository.delete({});
      });

      it('school schedule 삭제 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/school-schedule/${schoolScheduleId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            courseId: '65ead96f50d4111ca6f57b00',
            tableTitle: 'test_table',
            optionsTime: '2:00 PM',
          }),
        );
        const deletedSchoolSchedule = await schoolScheduleRepository.findOneBy({
          id: schoolScheduleId,
        });
        expect(deletedSchoolSchedule).toBeNull();
      });

      it('유효하지 않은 school schedule 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidSchoolScheduleId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/school-schedule/${invalidSchoolScheduleId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });

    describe('/school-schedule/all/:id (DELETE)', () => {
      let schoolScheduleId1: string;
      let schoolScheduleId2: string;

      beforeEach(async () => {
        const schoolSchedule1 = schoolScheduleRepository.create({
          courseId: '65ead96f50d4111ca6f57b00',
          tableTitle: 'test_table',
          optionsTime: '2:00 PM',
          tableEntity: tableItem,
        });
        await schoolScheduleRepository.save(schoolSchedule1);
        schoolScheduleId1 = schoolSchedule1.id;

        const schoolSchedule2 = schoolScheduleRepository.create({
          courseId: '6436c2657efba14cf3f90000',
          tableTitle: 'test_table',
          optionsTime: '10:30 AM',
          tableEntity: tableItem,
        });
        await schoolScheduleRepository.save(schoolSchedule2);
        schoolScheduleId2 = schoolSchedule2.id;
      });

      afterEach(async () => {
        await schoolScheduleRepository.delete({});
      });

      it('school schedule 모두 삭제 테스트', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/school-schedule/all/${tableId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            count: 2,
            items: [
              expect.objectContaining({
                courseId: '65ead96f50d4111ca6f57b00',
                tableTitle: 'test_table',
                optionsTime: '2:00 PM',
              }),
              expect.objectContaining({
                courseId: '6436c2657efba14cf3f90000',
                tableTitle: 'test_table',
                optionsTime: '10:30 AM',
              }),
            ],
          }),
        );

        const deletedSchoolSchedule1 = await schoolScheduleRepository.findOneBy(
          {
            id: schoolScheduleId1,
          },
        );
        expect(deletedSchoolSchedule1).toBeNull();
        const deletedSchoolSchedule2 = await schoolScheduleRepository.findOneBy(
          {
            id: schoolScheduleId2,
          },
        );
        expect(deletedSchoolSchedule2).toBeNull();
      });

      it('유효하지 않은 table 아이디로 삭제 요청을 보내면 404를 반환해야 합니다', async () => {
        const invalidTableId = uuidv4();

        const response = await request(app.getHttpServer())
          .delete(`/school-schedule/all/${invalidTableId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });
  });
});
