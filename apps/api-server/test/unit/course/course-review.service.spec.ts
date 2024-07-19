import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from '../../../src/routes/course/review/review.service';
import {
  Course,
  CourseReview,
  CourseReviewLike,
  User,
} from '../../../src/entity';
import { StubCourseReviewRepository } from './stub/course-review.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StubUserRepository } from '../user/stub-repository';
import { StubCourseRepository } from './stub/course-repository';
import { UserType } from '../../../src/common/enum/user.enum';
import { StubCourseReviewLikeRepository } from './stub/course-review-like-repository';
import { CourseReviewReactionType } from '../../../src/common/enum/course-review-reaction.enum';

describe('유저 수강평 관련 서비스 테스트', () => {
  let courseReviewService: ReviewService;
  let courseReviewRepository: StubCourseReviewRepository;
  let courseRepository: StubCourseRepository;
  let courseReviewLikeRepository: StubCourseReviewLikeRepository;
  let userRepository: StubUserRepository;
  const courseReviewRepositoryToken = getRepositoryToken(CourseReview);
  const courseRepositoryToken = getRepositoryToken(Course);
  const courseReviewLikeRepositoryToken = getRepositoryToken(CourseReviewLike);
  const userRepositoryToken = getRepositoryToken(User);
  const userId = 'user_id';

  beforeEach(async () => {
    courseReviewRepository = new StubCourseReviewRepository();
    courseRepository = new StubCourseRepository();
    courseReviewLikeRepository = new StubCourseReviewLikeRepository();
    userRepository = new StubUserRepository();

    userRepository.users.push({
      id: 'user_id',
      role: UserType.User.text,
      postCount: 0,
      createdAt: new Date('2024-06-28T18:19:29.764Z'),
      email: 'test_email',
      password: 'test_password',
      updateAt: new Date('2024-06-28T18:19:29.764Z'),
      username: 'test_name',
    });
    courseRepository.courses.push({
      id: 'course-id',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: courseReviewRepositoryToken,
          useValue: courseReviewRepository,
        },
        { provide: courseRepositoryToken, useValue: courseRepository },
        {
          provide: courseReviewLikeRepositoryToken,
          useValue: courseReviewLikeRepository,
        },
        {
          provide: userRepositoryToken,
          useValue: userRepository,
        },
      ],
    }).compile();

    courseReviewService = module.get<ReviewService>(ReviewService);
  });

  describe('createCourseReview 함수 테스트', () => {
    it('createCourseReview 함수 결과값 테스트', async () => {
      // given
      const courseReviewRowCount = courseReviewRepository.courseReviews.length;

      // when
      const result = await courseReviewService.createCourseReview(userId, {
        courseId: 'course-id',
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

      // then
      expect(result).toEqual({
        id: 'course-review-id',
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
        course: expect.objectContaining({
          id: 'course-id',
        }),
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'user_id',
          password: 'test_password',
          postCount: 1,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(courseReviewRepository.courseReviews.length).toBe(
        courseReviewRowCount + 1,
      );
      expect(courseReviewRepository.courseReviews).toContainEqual({
        id: 'course-review-id',
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
        course: expect.objectContaining({
          id: 'course-id',
        }),
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'user_id',
          password: 'test_password',
          postCount: 1,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const invalidUserId = 'invalid-user-id';

      // then
      expect(
        courseReviewService.createCourseReview(invalidUserId, {
          courseId: 'course-id',
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
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCourseReviewReaction & removeCourseReviewReaction & getCourseReviewReaction 함수 테스트', () => {
    it('likeCourseReview 함수 테스트', async () => {
      // given
      courseReviewRepository.courseReviews.push({
        id: '1',
        courseId: 'course-id',
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

      // when
      const result = await courseReviewService.createCourseReviewReaction(
        userId,
        {
          courseReviewId: '1',
          reactionType: CourseReviewReactionType.Like.text,
        },
      );

      // then
      expect(result).toEqual(
        expect.objectContaining({
          fk_user_id: userId,
          fk_course_review_id: '1',
          reaction: 'LIKE',
        }),
      );
      expect(courseReviewLikeRepository.courseReviewLikes.length).toBe(1);
      expect(courseReviewRepository.courseReviews[0].likes).toBe(1);
    });

    it('getCourseReviewReaction 함수 테스트', async () => {
      // given
      courseReviewRepository.courseReviews.push({
        id: '1',
        courseId: 'course-id',
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
      await courseReviewService.createCourseReviewReaction(userId, {
        courseReviewId: '1',
        reactionType: CourseReviewReactionType.Like.text,
      });

      // when
      const result = await courseReviewService.getCourseReviewReaction('1');

      // then
      expect(result).toEqual({
        totalCount: 1,
        items: [
          expect.objectContaining({
            fk_user_id: userId,
            fk_course_review_id: '1',
            reaction: 'LIKE',
          }),
        ],
      });
    });

    it('removeCourseReviewReaction 함수 테스트', async () => {
      // given
      courseReviewRepository.courseReviews.push({
        id: '1',
        courseId: 'course-id',
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
      await courseReviewService.createCourseReviewReaction(userId, {
        courseReviewId: '1',
        reactionType: CourseReviewReactionType.Like.text,
      });

      // when
      const result = await courseReviewService.removeCourseReviewReaction(
        userId,
        {
          courseReviewId: '1',
          reactionType: CourseReviewReactionType.Like.text,
        },
      );

      // then
      expect(result).toEqual(
        expect.objectContaining({
          fk_user_id: userId,
          fk_course_review_id: '1',
          reaction: CourseReviewReactionType.Like.text,
        }),
      );
      expect(courseReviewLikeRepository.courseReviewLikes.length).toBe(0);
      expect(courseReviewRepository.courseReviews[0].likes).toBe(0);
    });
  });
});
