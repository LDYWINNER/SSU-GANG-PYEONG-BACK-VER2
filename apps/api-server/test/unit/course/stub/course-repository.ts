import { Brackets } from 'typeorm';
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

  find(): Promise<Course[]> {
    return Promise.resolve(this.courses);
  }

  // query builder stub
  parameterObject: any = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createQueryBuilder(alias: string): StubCourseRepository {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  leftJoinAndSelect(relation: string, alias: string): StubCourseRepository {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  where(condition: string, parameters: object): StubCourseRepository {
    this.parameterObject = { ...this.parameterObject, ...parameters };
    return this;
  }

  andWhere(condition: any, parameters: object): StubCourseRepository {
    if (condition instanceof Brackets) {
      this.parameterObject = { ...this.parameterObject, keyword: 'Object' };
    } else if (condition.crs !== undefined) {
      this.parameterObject = { ...this.parameterObject, upperCourses: true };
    }

    this.parameterObject = { ...this.parameterObject, ...parameters };
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  orderBy(field: string): StubCourseRepository {
    return this;
  }

  getManyAndCount(): Promise<[Course[], number]> {
    const { semester, upperCourses, keyword, subjects, subject } =
      this.parameterObject;
    let filteredCourses = this.courses;

    const upperCourseItems = [
      '475',
      '476',
      '487',
      '488',
      '499',
      '522',
      '523',
      '524',
      '587',
      '593',
      '596',
      '599',
      '696',
      '697',
      '698',
      '699',
      '700',
    ];

    if (semester) {
      filteredCourses = filteredCourses.filter((course) =>
        course.semesters.includes(semester),
      );
    }

    if (upperCourses) {
      filteredCourses = filteredCourses.filter(
        (course) => !upperCourseItems.includes(course.crs),
      );
    }

    if (subjects) {
      filteredCourses = filteredCourses.filter((course) =>
        subjects.includes(course.subj),
      );
    } else if (subject) {
      filteredCourses = filteredCourses.filter(
        (course) => course.subj === subject,
      );
    }

    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      filteredCourses = filteredCourses.filter((course) =>
        course?.courseTitle.toLowerCase().includes(keywordLower),
      );
    }

    return Promise.resolve([filteredCourses, filteredCourses.length]);
  }
}
