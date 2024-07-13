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

  async update(
    id: string,
    newCourseReview: Partial<CourseReview>,
  ): Promise<any> {
    const index = this.courseReviews.findIndex((cr) => cr.id === id);
    if (index >= 0) {
      this.courseReviews[index] = {
        ...this.courseReviews[index],
        ...newCourseReview,
      };
      return this.courseReviews[index];
    }
    return Promise.reject(new Error('Course Review not found'));
  }

  async remove(courseReview: CourseReview): Promise<CourseReview> {
    const index = this.courseReviews.findIndex(
      (rc) => rc.id === courseReview.id,
    );
    if (index >= 0) {
      this.courseReviews.splice(index, 1);
      return courseReview;
    }
    return Promise.reject(new Error('Course Review not found'));
  }
}
