import { Course } from '../../../../src/entity';

export class StubCourseRepository {
  courses = [];

  create(course: Partial<Course>): Course {
    return {
      ...course,
      id: 'course-id',
    } as Course;
  }

  save(course: Course): Promise<Course> {
    this.courses.push(course);
    return Promise.resolve(course);
  }

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

  async update(id: string, newCourse: Partial<Course>): Promise<any> {
    const index = this.courses.findIndex((c) => c.id === id);
    if (index >= 0) {
      this.courses[index] = {
        ...this.courses[index],
        ...newCourse,
      };
      return this.courses[index];
    }
    return Promise.reject(new Error('Course not found'));
  }

  async remove(course: Course): Promise<Course> {
    const index = this.courses.findIndex((c) => c.id === course.id);
    if (index >= 0) {
      this.courses.splice(index, 1);
      return course;
    }
    return Promise.reject(new Error('Course not found'));
  }
}
