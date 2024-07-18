import { CourseLike } from '../../../../src/entity';

export class StubCourseLikeRepository {
  courseLikes = [];

  create(courseLike: Partial<CourseLike>): CourseLike {
    return {
      ...courseLike,
      id: 'course-like-id',
    } as CourseLike;
  }

  save(courseLike: CourseLike): Promise<CourseLike> {
    this.courseLikes.push(courseLike);
    return Promise.resolve(courseLike);
  }

  findOne(conditions: any): Promise<CourseLike> {
    return this.courseLikes.find(
      (cl) =>
        cl.fk_user_id === conditions.where.fk_user_id &&
        cl.fk_course_id === conditions.where.fk_course_id,
    );
  }

  remove(courseLike: CourseLike): Promise<CourseLike> {
    const index = this.courseLikes.findIndex(
      (cl) =>
        cl.fk_user_id === courseLike.fk_user_id &&
        cl.fk_course_id === courseLike.fk_course_id,
    );
    if (index >= 0) {
      const result = this.courseLikes[index];
      this.courseLikes.splice(index, 1);
      return result;
    }
    return Promise.reject(new Error('Course Like not found'));
  }

  async delete({
    fk_user_id: userId,
    fk_course_id: courseId,
  }): Promise<CourseLike> {
    const index = this.courseLikes.findIndex(
      (cl) => cl.fk_user_id === userId && cl.fk_course_id === courseId,
    );
    if (index >= 0) {
      const result = this.courseLikes[index];
      this.courseLikes.splice(index, 1);
      return result;
    }
    return Promise.reject(new Error('Course Like not found'));
  }

  async count(condition: any): Promise<number> {
    return this.courseLikes.filter(
      (cl) => cl.fk_course_id === condition.where.fk_course_id,
    ).length;
  }
}
