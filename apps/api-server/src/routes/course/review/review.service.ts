import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course, CourseReview, User } from '../../../../src/entity';
import { Repository } from 'typeorm';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(CourseReview)
    private readonly courseReviewRepository: Repository<CourseReview>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
}
