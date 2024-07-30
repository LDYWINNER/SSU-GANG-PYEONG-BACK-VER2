import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course, CourseLike, SchoolSchedule, Table } from '../../entity';
import { Repository } from 'typeorm';
import {
  applyKeywordFilter,
  applyOrdering,
  applySubjectFilter,
  latestSemester,
  upperCourseCondition,
} from '../../common/utils/course-filter';
import { QueryCourseDto } from './dto/query-course.dto';
import { pipe, curry, go, map } from 'fxjs';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseLike)
    private readonly courseLikeRepository: Repository<CourseLike>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getAllCourses = async () => {
    const cacheKey = 'all-courses';
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult as { count: number; items: Course[] };
    }

    try {
      const courses = await this.courseRepository.find({
        relations: ['reviews'],
      });
      if (!courses) {
        throw new NotFoundException('All Courses not found');
      }

      await this.cacheManager.set(
        cacheKey,
        { items: courses, count: courses.length },
        60 * 60 * 5,
      );

      return {
        count: courses.length,
        items: courses,
      };
    } catch (error) {
      console.log(error);
    }
  };

  getSingleCourse = async (courseId: string) => {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['reviews'],
    });
    if (!course) {
      throw new NotFoundException(`Course not found with id: ${courseId}`);
    }

    return course;
  };

  getTableCourses = async ({ subject, keyword }: QueryCourseDto) => {
    const cacheKey = `table-courses-${subject}-${keyword}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult as { count: number; items: Course[] };
    }

    try {
      const queryBuilder = this.courseRepository
        .createQueryBuilder('course')
        .leftJoinAndSelect('course.reviews', 'review')
        .where('course.semesters ILIKE :latestSemester', {
          latestSemester: `%${latestSemester}%`,
        })
        .andWhere('NOT (course.crs = ANY(:upperCourses))', {
          upperCourses: upperCourseCondition,
        });

      const applyFilters = pipe(
        curry(applySubjectFilter)(subject),
        curry(applyKeywordFilter)(keyword),
        curry(applyOrdering)(subject),
      );

      const finalQueryBuilder = applyFilters(queryBuilder);

      const [items, count] = await finalQueryBuilder.getManyAndCount();

      await this.cacheManager.set(cacheKey, { items, count }, 60 * 60 * 5);

      return { items, count };
    } catch (error) {
      console.log(error);
    }
  };

  getQueryCourses = async ({ subject, keyword }: QueryCourseDto) => {
    const cacheKey = `query-courses-${subject}-${keyword}`;
    const cachedResult = await this.cacheManager.get(cacheKey);

    if (cachedResult) {
      return cachedResult as { count: number; items: Course[] };
    }

    try {
      const queryBuilder = this.courseRepository.createQueryBuilder('course');

      const applyFilters = pipe(
        curry(applySubjectFilter)(subject),
        curry(applyKeywordFilter)(keyword),
        curry(applyOrdering)(subject),
      );

      const finalQueryBuilder = applyFilters(queryBuilder);

      const [items, count] = await finalQueryBuilder.getManyAndCount();

      await this.cacheManager.set(cacheKey, { items, count }, 60 * 60 * 5);

      return { items, count };
    } catch (error) {
      console.log(error);
    }
  };

  likeCourse = async (userId: string, courseId: string) => {
    await this.courseRepository.update(courseId, {
      likes: () => 'likes + 1',
    });

    const courseLike = this.courseLikeRepository.create({
      fk_user_id: userId,
      fk_course_id: courseId,
    });
    return await this.courseLikeRepository.save(courseLike);
  };

  unlikeCourse = async (userId: string, courseId: string) => {
    await this.courseRepository.update(courseId, {
      likes: () => 'likes - 1',
    });

    const courseLike = await this.courseLikeRepository.findOne({
      where: { fk_user_id: userId, fk_course_id: courseId },
    });
    if (!courseLike) {
      throw new NotFoundException(`Course like not found with id: ${courseId}`);
    }

    await this.courseLikeRepository.remove(courseLike);

    return courseLike;
  };

  countLikes = async (courseId: string) => {
    const likes = await this.courseLikeRepository.find({
      where: { fk_course_id: courseId },
    });

    return {
      count: likes.length,
      likers: [...likes.map((like) => like.fk_user_id)],
    };
  };

  getMyLikeCourse = async (userId: string) => {
    const courseLikes = await this.courseLikeRepository.find({
      where: { fk_user_id: userId },
    });
    if (!courseLikes) {
      return { count: 0, items: [] };
    }

    const coursesPromises = courseLikes.map((courseLike) => {
      return this.courseRepository.findOne({
        where: { id: courseLike.fk_course_id },
        relations: ['reviews'],
        order: { likes: 'DESC' },
      });
    });

    const courses = await Promise.all(coursesPromises);

    return {
      count: courses.length,
      items: courses,
    };
  };

  formatTableCourses = async (tableId: string) => {
    // 초기 설정
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['schoolSubjects'],
    });

    if (!table) {
      throw new NotFoundException(`Table not found with id: ${tableId}`);
    }

    const findCourse = async (courseId: string) => {
      const course = await this.courseRepository.findOne({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundException(`Course not found with id: ${courseId}`);
      }
      return course;
    };

    const formatCourse = curry(
      (schoolSubject: SchoolSchedule, course: Course) =>
        go(
          course,
          CourseService.applyComplicatedCourseFormat(schoolSubject),
          CourseService.applyTwoOptionsDayFormat(schoolSubject),
          CourseService.applyOptionsTimeFormat(schoolSubject),
        ),
    );

    const processCourses = pipe(
      map(async (schoolSubject: SchoolSchedule) => {
        const course = await findCourse(schoolSubject.courseId);
        return formatCourse(schoolSubject)(course);
      }),
      (promises) => Promise.all(promises),
    );

    return processCourses(table.schoolSubjects);
  };

  private static applyComplicatedCourseFormat = curry(
    (schoolSubject: SchoolSchedule, course: Course) => {
      if (
        course.subj === 'CHI' &&
        course.crs === '111' &&
        schoolSubject.complicatedCourseOption
      ) {
        const [day, startTime, , endTime] =
          schoolSubject.complicatedCourseOption.split('  ');
        return {
          ...course,
          day: CourseService.updateStringList(course.day, day),
          startTime: CourseService.updateStringList(
            course.startTime,
            startTime,
          ),
          endTime: CourseService.updateStringList(course.endTime, endTime),
        };
      }
      return course;
    },
  );

  private static applyTwoOptionsDayFormat = curry(
    (schoolSubject: SchoolSchedule, course: Course) => {
      if (schoolSubject.twoOptionsDay) {
        const selectedDay = schoolSubject.twoOptionsDay;
        return pipe(
          CourseService.updateDay(selectedDay),
          CourseService.updateLocationTimeInstructorForTwoOptionsDay(
            selectedDay,
          ),
        )(course);
      }
      return course;
    },
  );

  private static applyOptionsTimeFormat = curry(
    (schoolSubject: SchoolSchedule, course: Course) => {
      if (schoolSubject.optionsTime) {
        const selectedTime = schoolSubject.optionsTime;
        return CourseService.updateTimeForOptionsTime(selectedTime)(course);
      }
      return course;
    },
  );

  private static updateStringList = (list: string, newItem: string): string =>
    pipe(
      (l: string) => l.split(', '),
      (arr: string[]) => [...arr.slice(0, -1), newItem],
      (arr: string[]) => arr.join(', '),
    )(list);

  private static updateDay =
    (selectedDay: string) =>
    (course: Course): Course => ({
      ...course,
      day: pipe(
        (d: string) => d.split(', '),
        (arr: string[]) => [...arr.slice(0, -1), selectedDay],
        (arr: string[]) => arr.join(', '),
      )(course.day),
    });

  private static updateLocationTimeInstructorForTwoOptionsDay =
    (selectedDay: string) =>
    (course: Course): Course => {
      const [lastTwoDaysArray, recDays] = CourseService.extractDaysAndRecDays(
        course.day,
      );

      return pipe(
        CourseService.updateLocation(selectedDay, lastTwoDaysArray),
        CourseService.updateTimeForTwoOptionsDay(
          selectedDay,
          lastTwoDaysArray,
          recDays,
        ),
        CourseService.updateInstructor(selectedDay, lastTwoDaysArray),
      )(course);
    };

  private static extractDaysAndRecDays = (day: string): [string[], string] => {
    const days = day.split(', ');
    const lastTwoDays = days[days.length - 1];
    const lastTwoDaysArray = lastTwoDays.split('/');
    const recDays = lastTwoDaysArray[1]?.includes('(')
      ? lastTwoDaysArray[1].split('(')[1]
      : '';
    return [lastTwoDaysArray, recDays];
  };

  private static updateLocation = curry(
    (
      selectedDay: string,
      lastTwoDaysArray: string[],
      course: Course,
    ): Course => {
      const locations = course.location.split(', ');
      const lastTwoLocations = locations[locations.length - 1].split('/');
      const newLocation =
        selectedDay === lastTwoDaysArray[0]
          ? lastTwoLocations[0]
          : lastTwoLocations[1];

      return {
        ...course,
        location: [...locations.slice(0, -1), newLocation].join(', '),
      };
    },
  );

  private static updateTimeForTwoOptionsDay = curry(
    (
      selectedDay: string,
      lastTwoDaysArray: string[],
      recDays: string,
      course: Course,
    ): Course => {
      const updateTimeHelper = (timeString: string) => {
        const times = timeString.split(', ');
        let lastTwoTimes = times[times.length - 1];

        if (recDays) {
          lastTwoTimes = lastTwoTimes.split('(')[0];
        }

        const lastTwoTimesArray = lastTwoTimes.split('/');
        const newTime =
          selectedDay === lastTwoDaysArray[0]
            ? lastTwoTimesArray[0]
            : lastTwoTimesArray[1];

        return [
          ...times.slice(0, -1),
          recDays ? `${newTime}(${recDays}` : newTime,
        ].join(', ');
      };

      return {
        ...course,
        startTime: updateTimeHelper(course.startTime),
        endTime: updateTimeHelper(course.endTime),
      };
    },
  );

  private static updateInstructor = curry(
    (
      selectedDay: string,
      lastTwoDaysArray: string[],
      course: Course,
    ): Course => {
      const instructors = course.past_instructors;
      const lastTwoInstructors = instructors[instructors.length - 1].split('/');
      const newInstructor =
        selectedDay === lastTwoDaysArray[0]
          ? lastTwoInstructors[0]
          : lastTwoInstructors[1];

      return {
        ...course,
        past_instructors: [...instructors.slice(0, -1), newInstructor],
      };
    },
  );

  private static updateTimeForOptionsTime =
    (selectedTime: string) =>
    (course: Course): Course => {
      const updateTimeHelper = (timeString: string) => {
        const times = timeString.split(', ');
        const lastTimes = times[times.length - 1].split('/');
        const newTime =
          lastTimes.find((time) => time === selectedTime) || lastTimes[0];
        return [...times.slice(0, -1), newTime].join(', ');
      };

      return {
        ...course,
        startTime: updateTimeHelper(course.startTime),
        endTime: updateTimeHelper(course.endTime),
      };
    };
}
