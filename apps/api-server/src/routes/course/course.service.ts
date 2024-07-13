import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from '../../entity';
import { Brackets, In, Repository } from 'typeorm';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
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
    const upperCourseCondition = {
      crs: {
        $not: In([
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
        ]),
      },
    };

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.reviews', 'review')
      .where('course.semesters IN (:...semesters)', {
        semesters: semesterCondition,
      })
      .andWhere(upperCourseCondition);

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
            .orWhere('course.instructor_names ILIKE :keyword', {
              keyword: `%${keyword}%`,
            });
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
            .orWhere('course.instructor_names ILIKE :keyword', {
              keyword: `%${keyword}%`,
            });
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
}
