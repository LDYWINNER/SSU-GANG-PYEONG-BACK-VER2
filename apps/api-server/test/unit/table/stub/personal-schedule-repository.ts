import { PersonalSchedule } from '../../../../src/entity/personal-schedule.entity';

export class StubPersonalScheduleRepository {
  personalSchedules = [];

  create(personalSchedule: Partial<PersonalSchedule>): PersonalSchedule {
    return {
      ...personalSchedule,
      id: 'personal-schedule-id',
    } as PersonalSchedule;
  }

  save(personalSchedule: PersonalSchedule): Promise<PersonalSchedule> {
    this.personalSchedules.push(personalSchedule);
    return Promise.resolve(personalSchedule);
  }

  findOne(conditions: any): Promise<PersonalSchedule> {
    return Promise.resolve(
      this.personalSchedules.find(
        (personalSchedule) => personalSchedule.id === conditions.where.id,
      ),
    );
  }

  async update(
    id: string,
    newPersonalSchedule: Partial<PersonalSchedule>,
  ): Promise<any> {
    const index = this.personalSchedules.findIndex(
      (newPersonalSchedule) => newPersonalSchedule.id === id,
    );
    if (index >= 0) {
      this.personalSchedules[index] = {
        ...this.personalSchedules[index],
        ...newPersonalSchedule,
      };
      return this.personalSchedules[index];
    }
    return Promise.reject(new Error('Personal Schedule not found'));
  }

  async remove(personalSchedule: PersonalSchedule): Promise<PersonalSchedule> {
    const index = this.personalSchedules.findIndex(
      (ps) => ps.id === personalSchedule.id,
    );
    if (index >= 0) {
      this.personalSchedules.splice(index, 1);
      return personalSchedule;
    }
    return Promise.reject(new Error('Personal Schedule not found'));
  }
}
