import { CourseReviewLike } from '../../../../src/entity';

export class StubCourseReviewLikeRepository {
  courseReviewLikes = [];

  create(courseReviewLike: Partial<CourseReviewLike>): CourseReviewLike {
    return {
      ...courseReviewLike,
      id: 'course-review-like-id',
    } as CourseReviewLike;
  }

  save(courseReviewLike: CourseReviewLike): Promise<CourseReviewLike> {
    this.courseReviewLikes.push(courseReviewLike);
    return Promise.resolve(courseReviewLike);
  }

  findOne(conditions: any): Promise<CourseReviewLike> {
    return this.courseReviewLikes.find(
      (crl) =>
        crl.fk_user_id === conditions.where.fk_user_id &&
        crl.fk_course_review_id === conditions.where.fk_course_review_id,
    );
  }

  find(conditions: any): Promise<CourseReviewLike[]> {
    return Promise.resolve(
      this.courseReviewLikes.filter(
        (crl) =>
          crl.fk_course_review_id.id ===
          conditions.where.fk_course_review_id.id,
      ),
    );
  }

  remove(courseReviewLike: CourseReviewLike): Promise<CourseReviewLike> {
    const index = this.courseReviewLikes.findIndex(
      (crl) =>
        crl.fk_user_id === courseReviewLike.fk_user_id &&
        crl.fk_course_review_id === courseReviewLike.fk_course_review_id,
    );
    if (index >= 0) {
      const result = this.courseReviewLikes[index];
      this.courseReviewLikes.splice(index, 1);
      return result;
    }
    return Promise.reject(new Error('Course Review Like not found'));
  }

  async delete({
    fk_user_id: userId,
    fk_course_review_id: courseReviewId,
  }): Promise<CourseReviewLike> {
    const index = this.courseReviewLikes.findIndex(
      (crl) =>
        crl.fk_user_id === userId && crl.fk_course_review_id === courseReviewId,
    );
    if (index >= 0) {
      const result = this.courseReviewLikes[index];
      this.courseReviewLikes.splice(index, 1);
      return result;
    }
    return Promise.reject(new Error('Course Review Like not found'));
  }

  async count(condition: any): Promise<number> {
    return this.courseReviewLikes.filter(
      (crl) => crl.fk_course_review_id === condition.where.fk_course_review_id,
    ).length;
  }
}
