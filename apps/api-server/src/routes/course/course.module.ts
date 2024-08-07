import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Course,
  CourseReview,
  CourseLike,
  CourseReviewLike,
  Table,
  User,
} from '../../entity';
import { ReviewService } from './review/review.service';
import { ReviewController } from './review/review.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseReview,
      CourseLike,
      CourseReviewLike,
      User,
      Table,
    ]),
  ],
  controllers: [CourseController, ReviewController],
  providers: [CourseService, ReviewService],
})
export class CourseModule {}
