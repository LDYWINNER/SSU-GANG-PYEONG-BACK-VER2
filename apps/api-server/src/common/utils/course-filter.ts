export const semesters = ['2024_spring'];

export const latestSemester = '2024_spring';

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

export const addKeywordSearch = (qb, keyword) => {
  const likeKeyword = `%${keyword}%`;

  return qb
    .where('course.crs ILIKE :keyword', { keyword: likeKeyword })
    .orWhere('course.courseTitle ILIKE :keyword', { keyword: likeKeyword })
    .orWhere(':keyword ILIKE ANY(course.recent_two_instructors)', {
      keyword: likeKeyword,
    });
};
