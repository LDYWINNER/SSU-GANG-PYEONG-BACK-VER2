import { SchoolSchedule } from '../../../../src/entity';

export class StubSchoolScheduleRepository {
  schoolSchedules = [];

  create(schoolSchedule: Partial<SchoolSchedule>): SchoolSchedule {
    return {
      ...schoolSchedule,
      id: 'school-schedule-id',
    } as SchoolSchedule;
  }

  save(schoolSchedule: SchoolSchedule): Promise<SchoolSchedule> {
    this.schoolSchedules.push(schoolSchedule);
    return Promise.resolve(schoolSchedule);
  }

  findOne(conditions: any): Promise<SchoolSchedule> {
    return Promise.resolve(
      this.schoolSchedules.find(
        (schoolSchedule) => schoolSchedule.id === conditions.where.id,
      ),
    );
  }

  findOneBy(conditions: any): Promise<SchoolSchedule> {
    return Promise.resolve(
      this.schoolSchedules.find(
        (schoolSchedule) => schoolSchedule.id === conditions.id,
      ),
    );
  }

  find(conditions: any): Promise<SchoolSchedule[]> {
    return Promise.resolve(
      this.schoolSchedules.filter(
        (schoolSchedule) =>
          schoolSchedule.tableEntity.id === conditions.where.tableEntity.id,
      ),
    );
  }

  async update(
    id: string,
    newschoolSchedule: Partial<SchoolSchedule>,
  ): Promise<any> {
    const index = this.schoolSchedules.findIndex(
      (newschoolSchedule) => newschoolSchedule.id === id,
    );
    if (index >= 0) {
      this.schoolSchedules[index] = {
        ...this.schoolSchedules[index],
        ...newschoolSchedule,
      };
      return this.schoolSchedules[index];
    }
    return Promise.reject(new Error('School Schedule not found'));
  }

  async remove(
    schoolSchedule: SchoolSchedule | SchoolSchedule[],
  ): Promise<SchoolSchedule | SchoolSchedule[]> {
    if (Array.isArray(schoolSchedule)) {
      const removedSchedules: SchoolSchedule[] = [];
      const notFoundSchedules: SchoolSchedule[] = [];

      for (const schedule of schoolSchedule) {
        const index = this.schoolSchedules.findIndex(
          (ss) => ss.id === schedule.id,
        );
        if (index >= 0) {
          this.schoolSchedules.splice(index, 1);
          removedSchedules.push(schedule);
        } else {
          notFoundSchedules.push(schedule);
        }
      }

      if (notFoundSchedules.length > 0) {
        return Promise.reject(new Error('Some School Schedules not found'));
      }

      return Promise.resolve(removedSchedules);
    } else {
      const index = this.schoolSchedules.findIndex(
        (ss) => ss.id === schoolSchedule.id,
      );
      if (index >= 0) {
        this.schoolSchedules.splice(index, 1);
        return Promise.resolve(schoolSchedule);
      }
      return Promise.reject(new Error('School Schedule not found'));
    }
  }
}
