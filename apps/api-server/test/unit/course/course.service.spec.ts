import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './../../../src/routes/course/course.service';
import { Course, CourseReview, User } from './../../../src/entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubCourseRepository } from './stub/course-repository';
import { StubCourseReviewRepository } from './stub/course-review.repository';
import { StubUserRepository } from '../user/stub-repository';
import { NotFoundException } from '@nestjs/common';

describe('수업 + 수강평 관련 서비스 테스트', () => {
  let courseService: CourseService;
  let courseRepository: StubCourseRepository;
  let courseReviewRepository: StubCourseReviewRepository;
  let userRepository: StubUserRepository;
  const courseRepositoryToken = getRepositoryToken(Course);
  const courseReviewRepositoryToken = getRepositoryToken(CourseReview);
  const userRepositoryToken = getRepositoryToken(User);
  const userId = 'test_user_id';
  const courseId1 = 'course_id_1';
  const courseId2 = 'course_id_2';
  const courseId3 = 'course_id_3';

  beforeEach(async () => {
    courseRepository = new StubCourseRepository();
    courseReviewRepository = new StubCourseReviewRepository();
    userRepository = new StubUserRepository();

    courseRepository.courses.push({
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
      semesters: ['2023-fall', '2024-fall'],
    });
    courseRepository.courses.push({
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
      semesters: ['2023-fall'],
    });
    courseRepository.courses.push({
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
      semesters: ['2023-fall', '2024-fall'],
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: courseRepositoryToken,
          useValue: courseRepository,
        },
        {
          provide: courseReviewRepositoryToken,
          useValue: courseReviewRepository,
        },
        {
          provide: userRepositoryToken,
          useValue: userRepository,
        },
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
  });

  describe('getAllCourses & getQueryCourses & getSingleCourse & getTableCourses 함수 테스트', () => {
    it('getAllCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getAllCourses(userId);

      // then
      expect(result).toEqual({
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
            semesters: ['2023-fall', '2024-fall'],
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
            semesters: ['2023-fall'],
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
            semesters: ['2023-fall', '2024-fall'],
          },
        ],
      });
    });

    it('getAllCourses: userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidUserId = 'invalid-user-id';

      expect(courseService.getAllCourses(invalidUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('subject와 keyword 모두 있을 때 getQueryCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getQueryCourses(userId, {
        subject: 'CSE',
        keyword: 'Object',
      });

      // then
      expect(result).toEqual({
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
            semesters: ['2023-fall', '2024-fall'],
          },
        ],
      });
    });

    it('subject가 ALL이고 keyword가 있을 때 getQueryCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getQueryCourses(userId, {
        subject: 'ALL',
        keyword: 'Object',
      });

      // then
      expect(result).toEqual({
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
            semesters: ['2023-fall', '2024-fall'],
          },
        ],
      });
    });

    it('subject와 keyword 모두 없을 때 getQueryCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getQueryCourses(userId, {});

      // then
      expect(result).toEqual({
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
            semesters: ['2023-fall', '2024-fall'],
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
            semesters: ['2023-fall'],
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
            semesters: ['2023-fall', '2024-fall'],
          },
        ],
      });
    });

    it('getQueryCourses: userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidUserId = 'invalid-user-id';

      expect(courseService.getQueryCourses(invalidUserId, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('getSingleCourse 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getSingleCourse(userId, courseId1);

      // then
      expect(result).toEqual({
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
        semesters: ['2023-fall', '2024-fall'],
      });
    });

    it('getSingleCourse: courseId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidCourseId = 'invalid-user-id';

      expect(
        courseService.getSingleCourse(userId, invalidCourseId),
      ).rejects.toThrow(NotFoundException);
    });

    it('subject와 keyword 모두 없을 때 getTableCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getTableCourses(userId, {});

      // then
      expect(result).toEqual({
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
            semesters: ['2023-fall', '2024-fall'],
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
            semesters: ['2023-fall'],
          },
        ],
      });
    });

    it('getTableCourses: userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidUserId = 'invalid-user-id';

      expect(courseService.getTableCourses(invalidUserId, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
