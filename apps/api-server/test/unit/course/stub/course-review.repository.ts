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

  async update(id: string, newCourseReview: any): Promise<any> {
    const index = this.courseReviews.findIndex((cr) => cr.id === id);
    console.log(newCourseReview.likes(), 'newCourseReview');
    if (index >= 0) {
      if (newCourseReview.likes() === 'likes + 1') {
        this.courseReviews[index] = {
          ...this.courseReviews[index],
          likes: this.courseReviews[index].likes + 1,
        };
        return this.courseReviews[index];
      } else {
        this.courseReviews[index] = {
          ...this.courseReviews[index],
          likes: this.courseReviews[index].likes - 1,
        };
        return this.courseReviews[index];
      }
    }
    return Promise.reject(new Error('Course Review not found'));
  }
}
