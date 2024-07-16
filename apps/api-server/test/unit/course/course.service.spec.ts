import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './../../../src/routes/course/course.service';
import { Course, CourseReview, Table } from './../../../src/entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubCourseRepository } from './stub/course-repository';
import { StubCourseReviewRepository } from './stub/course-review.repository';
import { NotFoundException } from '@nestjs/common';
import { StubTableRepository } from '../table/stub/table-repository';

describe('수업 관련 서비스 테스트', () => {
  let courseService: CourseService;
  let courseRepository: StubCourseRepository;
  let courseReviewRepository: StubCourseReviewRepository;
  let tableRepository: StubTableRepository;
  const courseRepositoryToken = getRepositoryToken(Course);
  const courseReviewRepositoryToken = getRepositoryToken(CourseReview);
  const tableRepositoryToken = getRepositoryToken(Table);
  const courseId1 = 'course_id_1';
  const courseId2 = 'course_id_2';
  const courseId3 = 'course_id_3';

  beforeEach(async () => {
    courseRepository = new StubCourseRepository();
    courseReviewRepository = new StubCourseReviewRepository();

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
      semesters: ['2023_fall', '2024_spring', '2024_fall'],
      location: 'A302',
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
      semesters: ['2023_fall', '2024_spring'],
      location: 'A302',
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
      semesters: ['2023_fall', '2024_spring', '2024_fall'],
      location: 'A302',
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
          provide: tableRepositoryToken,
          useValue: tableRepository,
        },
      ],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
  });

  describe('getAllCourses & getQueryCourses & getSingleCourse & getTableCourses 함수 테스트', () => {
    it('getAllCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getAllCourses();

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
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            location: 'A302',
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
            location: 'A302',
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
            location: 'A302',
          },
        ],
      });
    });

    it('subject와 keyword 모두 있을 때 getQueryCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getQueryCourses({
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
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            location: 'A302',
          },
        ],
      });
    });

    it('subject가 ALL이고 keyword가 있을 때 getQueryCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getQueryCourses({
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
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            location: 'A302',
          },
        ],
      });
    });

    it('subject가 ALL이고 keyword가 없을 때 getQueryCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getQueryCourses({ subject: 'ALL' });

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
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            location: 'A302',
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
            location: 'A302',
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
            location: 'A302',
          },
        ],
      });
    });

    it('getSingleCourse 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getSingleCourse(courseId1);

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
        semesters: ['2023_fall', '2024_spring', '2024_fall'],
        location: 'A302',
      });
    });

    it('getSingleCourse: courseId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidCourseId = 'invalid-course-id';

      expect(courseService.getSingleCourse(invalidCourseId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('subject가 ALL이고 keyword기 없을 때 getTableCourses 함수 결과값 테스트', async () => {
      // when
      const result = await courseService.getTableCourses({ subject: 'ALL' });

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
            semesters: ['2023_fall', '2024_spring', '2024_fall'],
            location: 'A302',
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
            location: 'A302',
          },
        ],
      });
    });
  });
});
