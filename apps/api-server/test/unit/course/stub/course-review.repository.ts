import { CourseReview } from '../../../../src/entity';

export class StubCourseReviewRepository {
  courseReviews = [];

  create(courseReview: Partial<CourseReview>): CourseReview {
    return {
      ...courseReview,
      id: 'course-review-id',
    } as CourseReview;
  }

  save(courseReview: CourseReview): Promise<CourseReview> {
    this.courseReviews.push(courseReview);
    return Promise.resolve(courseReview);
  }

  findOne(conditions: any): Promise<CourseReview> {
    return Promise.resolve(
      this.courseReviews.find(
        (courseReview) => courseReview.id === conditions.where.id,
      ),
    );
  }

  findOneBy(conditions: any): Promise<CourseReview> {
    return Promise.resolve(
      this.courseReviews.find(
        (courseReview) => courseReview.id === conditions.id,
      ),
    );
  }

  find(conditions: any): Promise<CourseReview[]> {
    return Promise.resolve(
      this.courseReviews.filter(
        (courseReview) => courseReview.user.id === conditions.where.user.id,
      ),
    );
  }
}
