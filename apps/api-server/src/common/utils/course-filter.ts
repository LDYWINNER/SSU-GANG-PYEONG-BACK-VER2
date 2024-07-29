import { pipe } from 'fxjs';
import { Brackets } from 'typeorm';

export const semesters = ['2024_fall'];

export const latestSemester = '2024_fall';

export const upperCourseCondition = [
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

export const subjectMapping = {
  'ACC/BUS': ['ACC', 'BUS'],
  'EST/EMP': ['EST', 'EMP'],
  SHCourse: ['AMS', 'ACC', 'BUS', 'CSE', 'ESE', 'EST', 'EMP', 'MEC'],
};

export const applySubjectFilter = (subject, qb) =>
  subject && subject !== 'ALL'
    ? pipe(
        () => (subject in subjectMapping ? subjectMapping[subject] : [subject]),
        (subjects) => {
          const operator = subject === 'SHCourse' ? 'NOT IN' : 'IN';
          return qb.andWhere(`course.subj ${operator} (:...subjects)`, {
            subjects,
          });
        },
      )(qb)
    : qb;

export const applyKeywordFilter = (keyword, qb) =>
  keyword
    ? qb.andWhere(new Brackets((qb) => addKeywordSearch(keyword, qb)))
    : qb;

export const addKeywordSearch = (keyword, qb) => {
  const likeKeyword = `%${keyword}%`;

  console.log('keyword', keyword, qb);

  return qb
    .where('course.crs ILIKE :keyword', { keyword: likeKeyword })
    .orWhere('course.courseTitle ILIKE :keyword', { keyword: likeKeyword })
    .orWhere(':keyword ILIKE ANY(course.recent_two_instructors)', {
      keyword: likeKeyword,
    });
};

export const applyOrdering = (subject, qb) => {
  if (subject === 'SHCourse') return qb.orderBy('course.subj');
  if (subject !== 'ACC/BUS') return qb.orderBy('course.crs');
  return qb;
};
