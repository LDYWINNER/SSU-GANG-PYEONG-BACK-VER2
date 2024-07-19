import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course, CourseLike, Table } from '../../entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseLike)
    private readonly courseLikeRepository: Repository<CourseLike>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  getAllCourses = async () => {
    const courses = await this.courseRepository.find({
      relations: ['reviews'],
    });

    return {
      count: courses.length,
      items: courses,
    };
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

  getTableCourses = async ({
    subject,
    keyword,
  }: {
    subject?: string;
    keyword?: string;
  }) => {
    const semesterCondition = ['2024_spring'];
    const upperCourseCondition = [
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

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.reviews', 'review')
      .where('course.semesters && ARRAY[:...semesters]', {
        semesters: semesterCondition,
      })
      .andWhere('course.crs NOT IN (:...upperCourses)', {
        upperCourses: upperCourseCondition,
      });

    if (subject !== 'ALL') {
      switch (subject) {
        case 'ACC/BUS':
          queryBuilder.andWhere('course.subj IN (:...subjects)', {
            subjects: ['ACC', 'BUS'],
          });
          break;
        case 'EST/EMP':
          queryBuilder.andWhere('course.subj IN (:...subjects)', {
            subjects: ['EST', 'EMP'],
          });
          break;
        case 'SHCourse':
          queryBuilder.andWhere('course.subj NOT IN (:...subjects)', {
            subjects: ['AMS', 'ACC', 'BUS', 'CSE', 'ESE', 'EST', 'EMP', 'MEC'],
          });
          break;
        default:
          queryBuilder.andWhere('course.subj = :subject', { subject });
          break;
      }
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('course.crs ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('course.courseTitle ILIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere(
              'course.id IN (SELECT id FROM course, UNNEST(course.recent_two_instructors) AS instructor WHERE instructor ILIKE :keyword)',
              {
                keyword: `%${keyword}%`,
              },
            );
        }),
      );
    }

    if (subject === 'SHCourse') {
      queryBuilder.orderBy('course.subj');
    } else if (subject !== 'ACC/BUS') {
      queryBuilder.orderBy('course.crs');
    }

    const [items, count] = await queryBuilder.getManyAndCount();
    return { items, count };
  };

  getQueryCourses = async ({
    subject,
    keyword,
  }: {
    subject?: string;
    keyword?: string;
  }) => {
    const queryBuilder = this.courseRepository.createQueryBuilder('course');

    if (subject !== 'ALL') {
      switch (subject) {
        case 'ACC/BUS':
          queryBuilder.andWhere('course.subj IN (:...subjects)', {
            subjects: ['ACC', 'BUS'],
          });
          break;
        case 'EST/EMP':
          queryBuilder.andWhere('course.subj IN (:...subjects)', {
            subjects: ['EST', 'EMP'],
          });
          break;
        case 'SHCourse':
          queryBuilder.andWhere('course.subj NOT IN (:...subjects)', {
            subjects: ['AMS', 'ACC', 'BUS', 'CSE', 'ESE', 'EST', 'EMP', 'MEC'],
          });
          break;
        default:
          queryBuilder.andWhere('course.subj = :subject', { subject });
          break;
      }
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('course.crs ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('course.courseTitle ILIKE :keyword', {
              keyword: `%${keyword}%`,
            })
            .orWhere(
              'course.id IN (SELECT id FROM course, UNNEST(course.recent_two_instructors) AS instructor WHERE instructor ILIKE :keyword)',
              {
                keyword: `%${keyword}%`,
              },
            );
        }),
      );
    }

    if (subject === 'SHCourse') {
      queryBuilder.orderBy('course.subj');
    } else if (subject !== 'ACC/BUS') {
      queryBuilder.orderBy('course.crs');
    }

    const [items, count] = await queryBuilder.getManyAndCount();
    return { items, count };
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

  formatTableCourses = async (tableId: string) => {
    // 초기 설정
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['schoolSubjects'],
    });

    if (!table) {
      throw new NotFoundException(`Table not found with id: ${tableId}`);
    }

    // 데이터 가공
    const courses = table.schoolSubjects.map(async (schoolSubject) => {
      const course = await this.courseRepository.findOne({
        where: { id: schoolSubject.courseId },
      });
      if (!course) {
        throw new NotFoundException(
          `Course not found with id: ${schoolSubject.courseId}`,
        );
      }

      if (course.subj === 'CHI' && course.crs === '111') {
        return CourseService.formatComplicatedCourse(
          course,
          schoolSubject.complicatedCourseOption,
        );
      } else if (schoolSubject.twoOptionsDay !== undefined) {
        return CourseService.formatTwoOptionsDayCourse(
          course,
          schoolSubject.twoOptionsDay,
        );
      } else if (schoolSubject.optionsTime !== undefined) {
        return CourseService.formatOptionsTimeCourse(
          course,
          schoolSubject.optionsTime,
        );
      } else {
        return course;
      }
    });

    return courses;
  };

  private static formatComplicatedCourse(
    course: Course,
    courseInfo: any,
  ): Course {
    const complicatedCourseOption =
      courseInfo.complicatedCourseOption as string;
    const selectedOptions = complicatedCourseOption.split('  ');

    course.day = this.updateStringList(course.day, selectedOptions[0]);
    course.startTime = this.updateStringList(
      course.startTime,
      selectedOptions[1],
    );
    course.endTime = this.updateStringList(course.endTime, selectedOptions[3]);

    return course;
  }

  private static formatTwoOptionsDayCourse(
    course: Course,
    courseInfo: any,
  ): Course {
    const selectedDay = courseInfo.twoOptionsDay as string;
    const tempDays = course.day.split(', ');
    const tempLocation = course.location.split(', ');
    const tempStartTime = course.startTime.split(', ');
    const tempEndTime = course.endTime.split(', ');

    tempDays.pop();
    tempDays.push(selectedDay);
    course.day = tempDays.join(', ');

    const [lastTwoDaysArray, recDays] = this.extractDaysAndRecDays(tempDays);
    this.updateLocationTimeInstructor(
      course,
      tempLocation,
      tempStartTime,
      tempEndTime,
      selectedDay,
      lastTwoDaysArray,
      recDays,
    );

    return course;
  }

  private static formatOptionsTimeCourse(
    course: Course,
    courseInfo: any,
  ): Course {
    const selectedTime = courseInfo.optionsTime as string;
    const tempStartTime = course.startTime.split(', ');
    const tempEndTime = course.endTime.split(', ');

    tempStartTime.pop();
    tempEndTime.pop();

    const startTimeArray = tempStartTime.pop()!.split('/');
    const endTimeArray = tempEndTime.pop()!.split('/');

    const matchedIndex = startTimeArray.findIndex(
      (time) => time === selectedTime,
    );
    const newStartTime = startTimeArray[matchedIndex];
    const newEndTime = endTimeArray[matchedIndex];

    tempStartTime.push(newStartTime);
    tempEndTime.push(newEndTime);

    course.startTime = tempStartTime.join(', ');
    course.endTime = tempEndTime.join(', ');

    return course;
  }

  private static updateStringList(list: string, newItem: string): string {
    const tempList = list.split(', ');
    tempList.pop();
    tempList.push(newItem);
    return tempList.join(', ');
  }

  private static extractDaysAndRecDays(tempDays: string[]): [string[], string] {
    const lastTwoDays = tempDays.pop()!;
    const lastTwoDaysArray = lastTwoDays.split('/');
    let recDays = '';
    if (lastTwoDaysArray[1].includes('(')) {
      recDays = lastTwoDaysArray[1].split('(')[1];
    }
    return [lastTwoDaysArray, recDays];
  }

  private static updateLocationTimeInstructor(
    course: Course,
    tempLocation: string[],
    tempStartTime: string[],
    tempEndTime: string[],
    selectedDay: string,
    lastTwoDaysArray: string[],
    recDays: string,
  ) {
    const lastLocation = tempLocation.at(-1);
    const lastStartTimes = tempStartTime.at(-1);
    const lastInstructors = course.past_instructors.at(-1);

    if (lastLocation?.includes('/')) {
      this.updateLocation(course, tempLocation, selectedDay, lastTwoDaysArray);
    }

    if (lastStartTimes?.includes('/')) {
      this.updateTime(
        course,
        tempStartTime,
        tempEndTime,
        selectedDay,
        lastTwoDaysArray,
        recDays,
      );
    }

    if (lastInstructors?.includes('/')) {
      this.updateInstructor(course, selectedDay, lastTwoDaysArray);
    }
  }

  private static updateLocation(
    course: Course,
    tempLocation: string[],
    selectedDay: string,
    lastTwoDaysArray: string[],
  ) {
    const lastTwoLocations = tempLocation.pop()!;
    const lastTwoLocationsArray = lastTwoLocations.split('/');
    const newLocation =
      selectedDay === lastTwoDaysArray[0]
        ? lastTwoLocationsArray[0]
        : lastTwoLocationsArray[1];
    tempLocation.push(newLocation);
    course.location = tempLocation.join(', ');
  }

  private static updateTime(
    course: Course,
    tempStartTime: string[],
    tempEndTime: string[],
    selectedDay: string,
    lastTwoDaysArray: string[],
    recDays: string,
  ) {
    let lastTwoStartTimes = tempStartTime.pop()!;
    let lastTwoEndTimes = tempEndTime.pop()!;

    if (recDays !== '') {
      lastTwoStartTimes = lastTwoStartTimes.split('(')[0];
      lastTwoEndTimes = lastTwoEndTimes.split('(')[0];
    }

    const lastTwoStartTimesArray = lastTwoStartTimes.split('/');
    const lastTwoEndTimesArray = lastTwoEndTimes.split('/');
    const newStartTime =
      selectedDay === lastTwoDaysArray[0]
        ? lastTwoStartTimesArray[0]
        : lastTwoStartTimesArray[1];
    const newEndTime =
      selectedDay === lastTwoDaysArray[0]
        ? lastTwoEndTimesArray[0]
        : lastTwoEndTimesArray[1];

    if (recDays !== '') {
      tempStartTime.push(newStartTime + '(' + recDays);
      tempEndTime.push(newEndTime + '(' + recDays);
    } else {
      tempStartTime.push(newStartTime);
      tempEndTime.push(newEndTime);
    }

    course.startTime = tempStartTime.join(', ');
    course.endTime = tempEndTime.join(', ');
  }

  private static updateInstructor(
    course: Course,
    selectedDay: string,
    lastTwoDaysArray: string[],
  ) {
    const lastTwoInstructors = course.past_instructors.pop()!;
    const lastTwoInstructorsArray = lastTwoInstructors.split('/');
    const newInstructor =
      selectedDay === lastTwoDaysArray[0]
        ? lastTwoInstructorsArray[0]
        : lastTwoInstructorsArray[1];
    course.past_instructors.push(newInstructor);
  }
}
