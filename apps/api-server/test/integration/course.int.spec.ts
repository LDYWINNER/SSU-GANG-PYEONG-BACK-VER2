import { ApiServerModule } from './../../src/api-server.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseModule } from './../../src/routes/course/course.module';
import { UserModule } from '../../src/routes/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserType } from '../../src/common/enum/user.enum';
import { v4 as uuidv4 } from 'uuid';
import { User, RefreshToken, Course, CourseReview } from '../../src/entity';

describe('Course 기능 통합 테스트', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let courseRepository: Repository<Course>;
  let courseReviewRepository: Repository<CourseReview>;
  let userId: string;
  let token: string;
  let invalidToken: string;
  let courseId1: string;
  let courseId2: string;
  let courseId3: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiServerModule,
        CourseModule,
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

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    refreshTokenRepository = moduleFixture.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    courseRepository = moduleFixture.get<Repository<Course>>(
      getRepositoryToken(Course),
    );
    courseReviewRepository = moduleFixture.get<Repository<CourseReview>>(
      getRepositoryToken(CourseReview),
    );

    // 테스트용 사용자 생성
    const user = userRepository.create({
      username: 'test_user',
      email: 'test_user@example.com',
      password: 'test_password',
      postCount: 0,
      role: UserType.User,
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

    // course 초기 생성
    const course1 = courseRepository.create({
      avgGrade: 4.5,
      classNbr: 'class_nbr',
      subj: 'CSE',
      crs: '114',
      courseTitle: 'Introduction to Object Oriented Programming',
      sbc: 'TECH',
      cmp: 'LEC',
      sctn: '90/91',
      credits: '3',
      day: 'MW',
      startTime: '10:30 AM',
      endTime: '11:50 AM',
      past_instructors: ['instructor1', 'instructor2', 'instructor3'],
      recent_two_instructors: ['instructor1', 'instructor2'],
      most_recent_instructor: 'instructor2',
      semesters: ['2023_fall', '2024_spring', '2024_fall'],
      likes: 0,
      location: 'B101',
    });
    const savedCourse1 = await courseRepository.save(course1);
    courseId1 = savedCourse1.id;
    const course2 = courseRepository.create({
      avgGrade: 2.5,
      classNbr: 'class_nbr',
      subj: 'AMS',
      crs: '161',
      courseTitle: 'Calculus II',
      sbc: 'ARTS',
      cmp: 'LEC',
      sctn: '90/91',
      credits: '3',
      day: 'TUTH',
      startTime: '2:00 PM',
      endTime: '3:20 PM',
      past_instructors: ['instructor1', 'instructor2'],
      recent_two_instructors: ['instructor1'],
      most_recent_instructor: 'instructor2',
      semesters: ['2023_fall', '2024_spring'],
      likes: 0,
      location: 'B101',
    });
    const savedCourse2 = await courseRepository.save(course2);
    courseId2 = savedCourse2.id;
    const course3 = courseRepository.create({
      avgGrade: 4.8,
      classNbr: 'class_nbr',
      subj: 'EST',
      crs: '488',
      courseTitle: 'Internship',
      sbc: 'EXP',
      cmp: 'LEC',
      sctn: '90/91',
      credits: '3',
      day: '-',
      startTime: '-',
      endTime: '-',
      past_instructors: ['instructor1'],
      recent_two_instructors: ['instructor1'],
      most_recent_instructor: 'instructor1',
      semesters: ['2023_fall', '2024_spring', '2024_fall'],
      likes: 0,
      location: 'B101',
    });
    const savedCourse3 = await courseRepository.save(course3);
    courseId3 = savedCourse3.id;
  });

  afterAll(async () => {
    // 테스트 이후에 생성된 데이터 정리
    await courseRepository.delete({});
    await courseReviewRepository.delete({});
    await refreshTokenRepository.delete({});
    await userRepository.delete({});
    await app.close();
  });

  describe('/course (GET)', () => {
    it('/course/all get 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get('/course/all')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const expectedItems = [
        {
          id: courseId1,
          avgGrade: 4.5,
          classNbr: 'class_nbr',
          subj: 'CSE',
          crs: '114',
          courseTitle: 'Introduction to Object Oriented Programming',
          sbc: 'TECH',
          cmp: 'LEC',
          sctn: '90/91',
          credits: '3',
          day: 'MW',
          startTime: '10:30 AM',
          endTime: '11:50 AM',
          past_instructors: ['instructor1', 'instructor2', 'instructor3'],
          recent_two_instructors: ['instructor1', 'instructor2'],
          most_recent_instructor: 'instructor2',
          semesters: ['2023_fall', '2024_spring', '2024_fall'],
          reviews: [],
          likes: 0,
          location: 'B101',
        },
        {
          id: courseId2,
          avgGrade: 2.5,
          classNbr: 'class_nbr',
          subj: 'AMS',
          crs: '161',
          courseTitle: 'Calculus II',
          sbc: 'ARTS',
          cmp: 'LEC',
          sctn: '90/91',
          credits: '3',
          day: 'TUTH',
          startTime: '2:00 PM',
          endTime: '3:20 PM',
          past_instructors: ['instructor1', 'instructor2'],
          recent_two_instructors: ['instructor1'],
          most_recent_instructor: 'instructor2',
          semesters: ['2023_fall', '2024_spring'],
          reviews: [],
          likes: 0,
          location: 'B101',
        },
        {
          id: courseId3,
          avgGrade: 4.8,
          classNbr: 'class_nbr',
          subj: 'EST',
          crs: '488',
          courseTitle: 'Internship',
          sbc: 'EXP',
          cmp: 'LEC',
          sctn: '90/91',
          credits: '3',
          day: '-',
          startTime: '-',
          endTime: '-',
          past_instructors: ['instructor1'],
          recent_two_instructors: ['instructor1'],
          most_recent_instructor: 'instructor1',
          semesters: ['2023_fall', '2024_spring', '2024_fall'],
          reviews: [],
          likes: 0,
          location: 'B101',
        },
      ];

      expect(response.body.items).toEqual(
        expect.arrayContaining(expectedItems),
      );
      expect(response.body.count).toBe(3);
    });

    it('/course/:id get 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get(`/course/${courseId1}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: courseId1,
        avgGrade: 4.5,
        classNbr: 'class_nbr',
        subj: 'CSE',
        crs: '114',
        courseTitle: 'Introduction to Object Oriented Programming',
        sbc: 'TECH',
        cmp: 'LEC',
        sctn: '90/91',
        credits: '3',
        day: 'MW',
        startTime: '10:30 AM',
        endTime: '11:50 AM',
        past_instructors: ['instructor1', 'instructor2', 'instructor3'],
        recent_two_instructors: ['instructor1', 'instructor2'],
        most_recent_instructor: 'instructor2',
        semesters: ['2023_fall', '2024_spring', '2024_fall'],
        reviews: [],
        likes: 0,
        location: 'B101',
      });
    });

    it('유효하지 않은 코스 아이디로 요청을 보내는 경우 404를 반환해야 합니다', async () => {
      const invalidCourseId = new uuidv4();

      const response = await request(app.getHttpServer())
        .get(`/course${invalidCourseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('GET /course/query - subject가 ALL이 아니고 keyword가 있을 때 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get('/course/query?subject=CSE&keyword=Object')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        count: 1,
        items: [
          {
            id: courseId1,
            avgGrade: 4.5,
            classNbr: 'class_nbr',
            subj: 'CSE',
            crs: '114',
            courseTitle: 'Introduction to Object Oriented Programming',
            sbc: 'TECH',
            cmp: 'LEC',
            sctn: '90/91',
            credits: '3',
            day: 'MW',
            startTime: '10:30 AM',
            endTime: '11:50 AM',
            past_instructors: ['instructor1', 'instructor2', 'instructor3'],
            recent_two_instructors: ['instructor1', 'instructor2'],
            most_recent_instructor: 'instructor2',
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            likes: 0,
            location: 'B101',
          },
        ],
      });
    });

    it('GET /course/query - subject가 ALL이고 keyword가 있을 때 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get('/course/query?subject=ALL&keyword=Object')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        count: 1,
        items: [
          {
            id: courseId1,
            avgGrade: 4.5,
            classNbr: 'class_nbr',
            subj: 'CSE',
            crs: '114',
            courseTitle: 'Introduction to Object Oriented Programming',
            sbc: 'TECH',
            cmp: 'LEC',
            sctn: '90/91',
            credits: '3',
            day: 'MW',
            startTime: '10:30 AM',
            endTime: '11:50 AM',
            past_instructors: ['instructor1', 'instructor2', 'instructor3'],
            recent_two_instructors: ['instructor1', 'instructor2'],
            most_recent_instructor: 'instructor2',
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            likes: 0,
            location: 'B101',
          },
        ],
      });
    });

    it('GET /course/query - subject가 ALL이고 keyword가 없을 때 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get('/course/query?subject=ALL')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        count: 3,
        items: [
          {
            id: courseId1,
            avgGrade: 4.5,
            classNbr: 'class_nbr',
            subj: 'CSE',
            crs: '114',
            courseTitle: 'Introduction to Object Oriented Programming',
            sbc: 'TECH',
            cmp: 'LEC',
            sctn: '90/91',
            credits: '3',
            day: 'MW',
            startTime: '10:30 AM',
            endTime: '11:50 AM',
            past_instructors: ['instructor1', 'instructor2', 'instructor3'],
            recent_two_instructors: ['instructor1', 'instructor2'],
            most_recent_instructor: 'instructor2',
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            likes: 0,
            location: 'B101',
          },
          {
            id: courseId2,
            avgGrade: 2.5,
            classNbr: 'class_nbr',
            subj: 'AMS',
            crs: '161',
            courseTitle: 'Calculus II',
            sbc: 'ARTS',
            cmp: 'LEC',
            sctn: '90/91',
            credits: '3',
            day: 'TUTH',
            startTime: '2:00 PM',
            endTime: '3:20 PM',
            past_instructors: ['instructor1', 'instructor2'],
            recent_two_instructors: ['instructor1'],
            most_recent_instructor: 'instructor2',
            semesters: ['2023_fall', '2024_spring'],
            likes: 0,
            location: 'B101',
          },
          {
            id: courseId3,
            avgGrade: 4.8,
            classNbr: 'class_nbr',
            subj: 'EST',
            crs: '488',
            courseTitle: 'Internship',
            sbc: 'EXP',
            cmp: 'LEC',
            sctn: '90/91',
            credits: '3',
            day: '-',
            startTime: '-',
            endTime: '-',
            past_instructors: ['instructor1'],
            recent_two_instructors: ['instructor1'],
            most_recent_instructor: 'instructor1',
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            likes: 0,
            location: 'B101',
          },
        ],
      });
    });

    it('GET /course/table - subject가 ALL이고 keyword가 없을 때 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get('/course/table?subject=ALL')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        count: 2,
        items: [
          {
            id: courseId1,
            avgGrade: 4.5,
            classNbr: 'class_nbr',
            subj: 'CSE',
            crs: '114',
            courseTitle: 'Introduction to Object Oriented Programming',
            sbc: 'TECH',
            cmp: 'LEC',
            sctn: '90/91',
            credits: '3',
            day: 'MW',
            startTime: '10:30 AM',
            endTime: '11:50 AM',
            past_instructors: ['instructor1', 'instructor2', 'instructor3'],
            recent_two_instructors: ['instructor1', 'instructor2'],
            most_recent_instructor: 'instructor2',
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            reviews: [],
            likes: 0,
            location: 'B101',
          },
          {
            id: courseId2,
            avgGrade: 2.5,
            classNbr: 'class_nbr',
            subj: 'AMS',
            crs: '161',
            courseTitle: 'Calculus II',
            sbc: 'ARTS',
            cmp: 'LEC',
            sctn: '90/91',
            credits: '3',
            day: 'TUTH',
            startTime: '2:00 PM',
            endTime: '3:20 PM',
            past_instructors: ['instructor1', 'instructor2'],
            recent_two_instructors: ['instructor1'],
            most_recent_instructor: 'instructor2',
            semesters: ['2023_fall', '2024_spring'],
            reviews: [],
            likes: 0,
            location: 'B101',
          },
        ],
      });
    });
  });

  describe('수강평(course review) 기능 통합 테스트', () => {
    describe('/course/review (POST)', () => {
      afterEach(async () => {
        await courseReviewRepository.delete({});
      });

      it('course review 생성 테스트', async () => {
        const response = await request(app.getHttpServer())
          .post('/course/review')
          .set('Authorization', `Bearer ${token}`)
          .send({
            courseId: courseId1,
            semester: '2024-spring',
            instructor: 'Jeehong Kim',
            myLetterGrade: 'A',
            teamProjectPresence: false,
            quizPresence: true,
            testQuantity: '2',
            testType: '2midterms-1final',
            generosity: 'generous',
            attendance: 'rolling-paper',
            homeworkQuantity: 'many',
            difficulty: 'difficult',
            overallGrade: 3,
            overallEvaluation: '',
            anonymity: true,
          });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
          expect.objectContaining({
            semester: '2024-spring',
            instructor: 'Jeehong Kim',
            myLetterGrade: 'A',
            teamProjectPresence: false,
            quizPresence: true,
            testQuantity: '2',
            testType: '2midterms-1final',
            generosity: 'generous',
            attendance: 'rolling-paper',
            homeworkQuantity: 'many',
            difficulty: 'difficult',
            overallGrade: 3,
            overallEvaluation: '',
            anonymity: true,
            likes: 0,

            course: expect.objectContaining({
              id: courseId1,
            }),
            user: expect.objectContaining({
              id: userId,
            }),
          }),
        );
      });

      it('유효하지 않은 토큰으로 요청을 보내는 경우 401를 반환해야 합니다', async () => {
        const response = await request(app.getHttpServer())
          .post('/course/review')
          .set('Authorization', `Bearer ${invalidToken}`)
          .send({
            courseId: courseId1,
            semester: '2024-spring',
            instructor: 'Jeehong Kim',
            myLetterGrade: 'A',
            teamProjectPresence: false,
            quizPresence: true,
            testQuantity: '2',
            testType: '2midterms-1final',
            generosity: 'generous',
            attendance: 'rolling-paper',
            homeworkQuantity: 'many',
            difficulty: 'difficult',
            overallGrade: 3,
            overallEvaluation: '',
            anonymity: true,
            likes: 0,
          });

        expect(response.status).toBe(401);
      });
    });
  });

  describe('course 좋아요 기능 통합 테스트', () => {
    it('POST /course/like - course 좋아요 테스트', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/like/${courseId1}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          fk_user_id: userId,
          fk_course_id: courseId1,
        }),
      );
    });

    it('GET /course/like/:id - course 좋아요 수 조회 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get(`/course/like/${courseId1}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        count: 1,
      });
    });

    it('DELETE /course/like - course 좋아요 취소 테스트', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/course/like/${courseId1}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          fk_user_id: userId,
          fk_course_id: courseId1,
        }),
      );
    });
  });

  describe('course review 좋아요 기능 통합 테스트', () => {
    let courseReviewId: string;

    beforeAll(async () => {
      const courseReview = courseReviewRepository.create({
        semester: '2024-spring',
        instructor: 'Jeehong Kim',
        myLetterGrade: 'A',
        teamProjectPresence: false,
        quizPresence: true,
        testQuantity: '2',
        testType: '2midterms-1final',
        generosity: 'generous',
        attendance: 'rolling-paper',
        homeworkQuantity: 'many',
        difficulty: 'difficult',
        overallGrade: 3,
        overallEvaluation: '',
        anonymity: true,
        likes: 0,
        course: {
          id: courseId1,
        },
        user: {
          id: userId,
        },
      });
      const savedCourseReview = await courseReviewRepository.save(courseReview);
      courseReviewId = savedCourseReview.id;
    });

    it('POST /course/review/like - course review 좋아요 테스트', async () => {
      const response = await request(app.getHttpServer())
        .post(`/course/review/like/${courseReviewId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          fk_user_id: userId,
          fk_course_review_id: courseReviewId,
        }),
      );
    });

    it('GET /course/review/like/:id - course review 좋아요 수 조회 테스트', async () => {
      const response = await request(app.getHttpServer())
        .get(`/course/review/like/${courseReviewId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        count: 1,
      });
    });

    it('DELETE /course/review/like/:id - course review 좋아요 취소 테스트', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/course/review/like/${courseReviewId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          fk_user_id: userId,
          fk_course_review_id: courseReviewId,
        }),
      );
    });
  });
});
