import { Course } from '../../../../src/entity';

export class StubCourseRepository {
  courses = [];

  findOne(conditions: any): Promise<Course> {
    return Promise.resolve(
      this.courses.find((course) => course.id === conditions.where.id),
    );
  }

  findOneBy(conditions: any): Promise<Course> {
    return Promise.resolve(
      this.courses.find((course) => course.id === conditions.id),
    );
  }

  find(conditions: any): Promise<Course[]> {
    return Promise.resolve(
      this.courses.filter(
        (course) => course.user.id === conditions.where.user.id,
      ),
    );
  }
}
