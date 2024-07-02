import { Test, TestingModule } from '@nestjs/testing';
import { PersonalScheduleService } from '../../../src/routes/table/personal-schedule/personal-schedule.service';
import { PersonalSchedule } from '../../../src/entity/personal-schedule.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubPersonalScheduleRepository } from './stub/personal-schedule-repository';
import { NotFoundException } from '@nestjs/common';
import { StubTableRepository } from './stub/table-repository';
import { Table } from '../../../src/entity/table.entity';

describe('시간표 개인 스케줄 관련 서비스 테스트', () => {
  let personalScheduleService: PersonalScheduleService;
  let personalScheduleRepository: StubPersonalScheduleRepository;
  let tableRepository: StubTableRepository;
  const personalScheduleRepositoryToken = getRepositoryToken(PersonalSchedule);
  const tableRepositoryToken = getRepositoryToken(Table);
  const tableId = 'table_id';

  beforeEach(async () => {
    personalScheduleRepository = new StubPersonalScheduleRepository();
    tableRepository = new StubTableRepository();

    const userId = 'test_user_id';
    tableRepository.tables.push({
      id: 'test_table_id',
      title: 'table_name',
      user: userId,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonalScheduleService,
        {
          provide: personalScheduleRepositoryToken,
          useValue: personalScheduleRepository,
        },
        {
          provide: tableRepositoryToken,
          useValue: tableRepository,
        },
      ],
    }).compile();

    personalScheduleService = module.get<PersonalScheduleService>(
      PersonalScheduleService,
    );
  });

  describe('createPersonalSchedule 함수 테스트', () => {
    it('createPersonalSchedule 함수 결과값 테스트', async () => {
      // given
      const tableId = 'test_table_id';
      const personalScheduleData = {
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1, 3],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
      };
      const personalScheduleCount =
        personalScheduleRepository.personalSchedules.length;

      // when
      const result = await personalScheduleService.createPersonalSchedule(
        tableId,
        personalScheduleData,
      );

      // then
      expect(result).toEqual({
        id: 'personal-schedule-id',
        ...personalScheduleData,
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: 'test_user_id',
        },
      });
      expect(personalScheduleRepository.personalSchedules.length).toBe(
        personalScheduleCount + 1,
      );
      expect(personalScheduleRepository.personalSchedules).toContainEqual({
        id: 'personal-schedule-id',
        ...personalScheduleData,
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: 'test_user_id',
        },
      });
    });

    it('tableId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const tableId = 'invalid-table-id';
      const personalScheduleData = {
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1, 3],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
      };

      // then
      expect(
        personalScheduleService.createPersonalSchedule(
          tableId,
          personalScheduleData,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePersonalSchedule 함수 테스트', () => {
    it('개인 스케줄 제목(courseId) 변경 시 updatePersonalSchedule 함수 결과값 테스트', async () => {
      // given
      const personalScheduleId = 'personal_schedule_test_id';
      personalScheduleRepository.personalSchedules.push({
        id: 'personal_schedule_test_id',
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1, 3],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
        tableEntity: tableId,
      });
      const personalScheduleCount =
        personalScheduleRepository.personalSchedules.length;

      // when
      const result = await personalScheduleService.updatePersonalSchedule(
        personalScheduleId,
        {
          courseId: 'updated_course_id',
          sections: {
            section1: {
              days: [1, 3],
              startTimes: ['10:00'],
              endTimes: ['11:00'],
              locations: ['room1'],
            },
          },
        },
      );

      // then
      expect(result).toEqual({
        id: 'personal_schedule_test_id',
        courseId: 'updated_course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1, 3],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
        tableEntity: tableId,
      });
      expect(personalScheduleRepository.personalSchedules.length).toBe(
        personalScheduleCount,
      );
      expect(personalScheduleRepository.personalSchedules).toContainEqual({
        id: 'personal_schedule_test_id',
        courseId: 'updated_course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1, 3],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
        tableEntity: tableId,
      });
    });

    it('개인 스케줄 섹션 변경 시 updatePersonalSchedule 함수 결과값 테스트', async () => {
      // given
      const personalScheduleId = 'personal_schedule_test_id';
      personalScheduleRepository.personalSchedules.push({
        id: 'personal_schedule_test_id',
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1, 3],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
        tableEntity: tableId,
      });
      const personalScheduleCount =
        personalScheduleRepository.personalSchedules.length;

      // when
      const result = await personalScheduleService.updatePersonalSchedule(
        personalScheduleId,
        {
          courseId: 'course_id',
          sections: {
            section1: {
              days: [2, 4],
              startTimes: ['11:00'],
              endTimes: ['12:00'],
              locations: ['room2'],
            },
          },
        },
      );

      // then
      expect(result).toEqual({
        id: 'personal_schedule_test_id',
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [2, 4],
            startTimes: ['11:00'],
            endTimes: ['12:00'],
            locations: ['room2'],
          },
        },
        tableEntity: tableId,
      });
      expect(personalScheduleRepository.personalSchedules.length).toBe(
        personalScheduleCount,
      );
      expect(personalScheduleRepository.personalSchedules).toContainEqual({
        id: 'personal_schedule_test_id',
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [2, 4],
            startTimes: ['11:00'],
            endTimes: ['12:00'],
            locations: ['room2'],
          },
        },
        tableEntity: tableId,
      });
    });

    it('personalScheduleId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const personalScheduleId = 'invalid-personal-schedule-id';
      const newPersonalSchedule = {
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
      };

      // then
      expect(
        personalScheduleService.updatePersonalSchedule(
          personalScheduleId,
          newPersonalSchedule,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePersonalSchedule 함수 테스트', () => {
    it('deletePersonalSchedule 함수 결과값 테스트', async () => {
      // given
      const personalScheduleId = 'personal-schedule-id';
      personalScheduleRepository.personalSchedules.push({
        id: 'personal-schedule-id',
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
        tableEntity: tableId,
      });
      const personalScheduleCount =
        personalScheduleRepository.personalSchedules.length;

      // when
      const result =
        await personalScheduleService.deletePersonalSchedule(
          personalScheduleId,
        );

      // then
      expect(result).toEqual({
        id: 'personal-schedule-id',
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
        tableEntity: tableId,
      });
      expect(personalScheduleRepository.personalSchedules.length).toBe(
        personalScheduleCount - 1,
      );
      expect(personalScheduleRepository.personalSchedules).not.toContainEqual({
        id: 'personal-schedule-id',
        courseId: 'course_id',
        table: 'test_table',
        sections: {
          section1: {
            days: [1],
            startTimes: ['10:00'],
            endTimes: ['11:00'],
            locations: ['room1'],
          },
        },
        tableEntity: tableId,
      });
    });

    it('personalScheduleId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const personalScheduleId = 'invalid-personal-schedule-id';

      // then
      expect(
        personalScheduleService.deletePersonalSchedule(personalScheduleId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
