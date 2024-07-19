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
  ) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User not found: ${userId}`);
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException(`Course not found: ${courseId}`);
    }

    const newCourseReview = this.courseReviewRepository.create({
      ...rest,
      course,
      user,
    });
    const savedCourseReview =
      await this.courseReviewRepository.save(newCourseReview);
    return { ...savedCourseReview };
  };

  likeCourseReview = async (userId: string, courseReviewId: string) => {
    await this.courseReviewRepository.update(courseReviewId, {
      likes: () => 'likes + 1',
    });

    const courseReviewLike = this.courseReviewLikeRepository.create({
      fk_user_id: userId,
      fk_course_review_id: courseReviewId,
    });
    return await this.courseReviewLikeRepository.save(courseReviewLike);
  };

  unlikeCourseReview = async (userId: string, courseReviewId: string) => {
    await this.courseReviewRepository.update(courseReviewId, {
      likes: () => 'likes - 1',
    });

    const courseReviewLike = await this.courseReviewLikeRepository.findOne({
      where: { fk_user_id: userId, fk_course_review_id: courseReviewId },
    });
    if (!courseReviewLike) {
      throw new NotFoundException(
        `Course review like not found: ${courseReviewId}`,
      );
    }

    await this.courseReviewLikeRepository.remove(courseReviewLike);

    return courseReviewLike;
  };

  countLikes = async (courseReviewId: string) => {
    const likes = await this.courseReviewLikeRepository.find({
      where: { fk_course_review_id: courseReviewId },
    });

    return {
      count: likes.length,
      likers: [...likes.map((like) => like.fk_user_id)],
    };
  };
}
