import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Course,
  CourseReview,
  CourseReviewLike,
  User,
} from '../../../../src/entity';
import { Repository } from 'typeorm';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { CourseReviewReactionType } from '../../../../src/common/enum/course-review-reaction.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(CourseReview)
    private readonly courseReviewRepository: Repository<CourseReview>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseReviewLike)
    private readonly courseReviewLikeRepository: Repository<CourseReviewLike>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  createCourseReview = async (
    userId: string,
    { courseId, ...rest }: CreateCourseReviewDto,
  ): Promise<CourseReview> => {
    const [user, course] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.courseRepository.findOne({ where: { id: courseId } }),
    ]);

    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    if (!course) {
      throw new NotFoundException(`Course not found: ${courseId}`);
    }

    user.courseReviewCount += 1;
    await this.userRepository.save(user);

    const newCourseReview = this.courseReviewRepository.create({
      ...rest,
      course,
      user,
    });
    const savedCourseReview =
      await this.courseReviewRepository.save(newCourseReview);

    return savedCourseReview;
  };

  createCourseReviewReaction = async (
    userId: string,
    {
      courseReviewId,
      reactionType,
    }: { courseReviewId: string; reactionType: string },
  ) => {
    if (reactionType === CourseReviewReactionType.Like.text) {
      await this.courseReviewRepository.update(courseReviewId, {
        likes: () => 'likes + 1',
      });
    }

    const courseReviewLike = this.courseReviewLikeRepository.create({
      fk_user_id: userId,
      fk_course_review_id: courseReviewId,
      reaction: reactionType,
    });
    return await this.courseReviewLikeRepository.save(courseReviewLike);
  };

  removeCourseReviewReaction = async (
    userId: string,
    {
      courseReviewId,
      reactionType,
    }: {
      courseReviewId: string;
      reactionType: string;
    },
  ) => {
    if (reactionType === CourseReviewReactionType.Like.text) {
      await this.courseReviewRepository.update(courseReviewId, {
        likes: () => 'likes - 1',
      });
    }

    const courseReviewLike = await this.courseReviewLikeRepository.findOne({
      where: {
        fk_user_id: userId,
        fk_course_review_id: courseReviewId,
        reaction: reactionType,
      },
    });
    if (!courseReviewLike) {
      throw new NotFoundException(
        `Course review like not found: ${courseReviewId}`,
      );
    }

    await this.courseReviewLikeRepository.remove(courseReviewLike);

    return courseReviewLike;
  };

  getCourseReviewReaction = async (courseReviewId: string) => {
    const reactions = await this.courseReviewLikeRepository.find({
      where: { fk_course_review_id: courseReviewId },
    });

    return {
      totalCount: reactions.length,
      items: reactions,
    };
  };

  async getMyScrappedCourseReview(userId: string) {
    const courseReviewLikes = await this.courseReviewLikeRepository.find({
      where: {
        fk_user_id: userId,
        reaction: CourseReviewReactionType.BookMark.text,
      },
    });

    if (!courseReviewLikes) {
      return { count: 0, items: [] };
    }

    const courseReviewsPromise = courseReviewLikes.map((courseReviewLike) => {
      return this.courseReviewRepository.findOne({
        where: { id: courseReviewLike.fk_course_review_id },
        relations: ['course', 'user'],
      });
    });

    const courseReviews = await Promise.all(courseReviewsPromise);

    return {
      count: courseReviews.length,
      items: courseReviews,
    };
  }
}
