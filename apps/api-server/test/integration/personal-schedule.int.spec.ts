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
import { PersonalSchedule } from '../../src/entity/personal-schedule.entity';

describe('시간표 Personal Schedule 기능 통합 테스트', () => {
  let app: INestApplication;
  let tableRepository: Repository<Table>;
  let personalScheduleRepository: Repository<PersonalSchedule>;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let userId: string;
  let tableId: string;
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

    // table 초기 설정
    const table = tableRepository.create({
      title: 'test_table',
      user: { id: userId },
    });
    await tableRepository.save(table);
    tableId = table.id;
  });

  beforeEach(async () => {
    await personalScheduleRepository.delete({});
  });

  afterAll(async () => {
    // 테스트 이후에 생성된 데이터 정리
    await tableRepository.delete({});
    await personalScheduleRepository.delete({});
    await refreshTokenRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/table/personal-schedule (POST)', () => {
    it('personal schedule 생성 테스트', async () => {
      const response = await request(app.getHttpServer())
        .post('/table/personal-schedule')
        .set('Authorization', `Bearer ${token}`)
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

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          courseId: 'course_id',
          table: 'test_table',
          sections: {
            section1: {
              days: [1, 3],
              startTimes: ['10:00'],
              endTimes: ['11:00'],
              locations: ['room1'],
            },
          },
          tableEntity: expect.objectContaining({
            id: tableId,
            title: 'test_table',
            user: { id: userId },
          }),
        }),
      );
    });

    it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
      const response = await request(app.getHttpServer())
        .post('/table/personal-schedule')
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

  describe('/table/personal-schedule/:id (PUT)', () => {
    let personalScheduleId: string;

    beforeEach(async () => {
      await personalScheduleRepository.delete({});
      const personalSchedule = personalScheduleRepository.create({
        courseId: 'course_id',
        table: 'test_table',
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
      const savedPersonalSchedule =
        await personalScheduleRepository.save(personalSchedule);
      personalScheduleId = savedPersonalSchedule.id;
    });

    it('스케줄 제목(courseId) 수정 테스트', async () => {
      const response = await request(app.getHttpServer())
        .put(`/table/personal-schedule/${personalScheduleId}`)
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
        .put(`/table/personal-schedule/${personalScheduleId}`)
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
        .put(`/table/personal-schedule/${personalScheduleId}`)
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
        .put(`/table/personal-schedule/${invalidPersonalScheduleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ courseId: 'updated_course_id' });

      expect(response.status).toBe(404);
    });
  });

  describe('/table/personal-schedule/:id (DELETE)', () => {
    let personalScheduleId: string;

    beforeEach(async () => {
      await personalScheduleRepository.delete({});
      const personalSchedule = personalScheduleRepository.create({
        courseId: 'course_id',
        table: 'test_table',
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
      const savedPersonalSchedule =
        await personalScheduleRepository.save(personalSchedule);
      personalScheduleId = savedPersonalSchedule.id;
    });

    it('personal schedule 삭제 테스트', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/table/personal-schedule/${personalScheduleId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: personalScheduleId,
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
        .delete(`/table/personal-schedule/${invalidPersonalScheduleId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
