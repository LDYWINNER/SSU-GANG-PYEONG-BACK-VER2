import { Test, TestingModule } from '@nestjs/testing';
import { SchoolScheduleService } from '../../../src/routes/table/school-schedule/school-schedule.service';
import { SchoolSchedule } from '../../../src/entity';
import { Table } from '../../../src/entity/table.entity';
import { StubTableRepository } from './stub/table-repository';
import { StubSchoolScheduleRepository } from './stub/school-schedule-repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('시간표 학교 스케줄 관련 서비스 테스트', () => {
  let schoolScheduleService: SchoolScheduleService;
  let schoolScheduleRepository: StubSchoolScheduleRepository;
  let tableRepository: StubTableRepository;
  const schoolScheduleRepositoryToken = getRepositoryToken(SchoolSchedule);
  const tableRepositoryToken = getRepositoryToken(Table);
  const userId = 'test_user_id';
  const tableId = 'test_table_id';

  beforeEach(async () => {
    schoolScheduleRepository = new StubSchoolScheduleRepository();
    tableRepository = new StubTableRepository();

    tableRepository.tables.push({
      id: tableId,
      title: 'table_name',
      user: userId,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolScheduleService,
        {
          provide: schoolScheduleRepositoryToken,
          useValue: schoolScheduleRepository,
        },
        {
          provide: tableRepositoryToken,
          useValue: tableRepository,
        },
      ],
    }).compile();

    schoolScheduleService = module.get<SchoolScheduleService>(
      SchoolScheduleService,
    );
  });

  describe('createSchoolSchedule 함수 테스트', () => {
    it('createSchoolSchedule 함수 결과값 테스트', async () => {
      // given
      const schoolScheduleDto = {
        tableId,
        courseId: '65ead96f50d4111ca6f57b00',
        tableTitle: 'test_table',
        optionsTime: '2:00 PM',
      };
      const schoolScheduleCount =
        schoolScheduleRepository.schoolSchedules.length;

      // when
      const result =
        await schoolScheduleService.createSchoolSchedule(schoolScheduleDto);

      // then
      expect(result).toEqual({
        id: 'school-schedule-id',
        ...schoolScheduleDto,
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: 'test_user_id',
        },
      });
      expect(schoolScheduleRepository.schoolSchedules.length).toBe(
        schoolScheduleCount + 1,
      );
      expect(schoolScheduleRepository.schoolSchedules).toContainEqual({
        id: 'school-schedule-id',
        ...schoolScheduleDto,
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
      const schoolScheduleDto = {
        tableId,
        courseId: '65ead96f50d4111ca6f57b00',
        tableTitle: 'test_table',
        optionsTime: '2:00 PM',
      };

      // then
      expect(
        schoolScheduleService.createSchoolSchedule(schoolScheduleDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSchoolSchedule 함수 테스트', () => {
    it('deleteSchoolSchedule 함수 결과값 테스트', async () => {
      // given
      const schoolScheduleId = 'school-schedule-id';
      schoolScheduleRepository.schoolSchedules.push({
        id: 'school-schedule-id',
        courseId: '65ead96f50d4111ca6f57b00',
        tableTitle: 'test_table',
        optionsTime: '2:00 PM',
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: userId,
        },
      });
      const schoolScheduleCount =
        schoolScheduleRepository.schoolSchedules.length;

      // when
      const result =
        await schoolScheduleService.deleteSchoolSchedule(schoolScheduleId);

      // then
      expect(result).toEqual({
        id: 'school-schedule-id',
        courseId: '65ead96f50d4111ca6f57b00',
        tableTitle: 'test_table',
        optionsTime: '2:00 PM',
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: userId,
        },
      });
      expect(schoolScheduleRepository.schoolSchedules.length).toBe(
        schoolScheduleCount - 1,
      );
      expect(schoolScheduleRepository.schoolSchedules).not.toContainEqual({
        id: 'school-schedule-id',
        courseId: '65ead96f50d4111ca6f57b00',
        tableTitle: 'test_table',
        optionsTime: '2:00 PM',
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: userId,
        },
      });
    });

    it('schoolScheduleId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const schoolScheduleId = 'invalid-personal-schedule-id';

      // then
      expect(
        schoolScheduleService.deleteSchoolSchedule(schoolScheduleId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAllSchoolSchedule 함수 테스트', () => {
    it('deleteAllSchoolSchedule 함수 결과값 테스트', async () => {
      // given
      schoolScheduleRepository.schoolSchedules.push({
        id: 'school-schedule-id-1',
        courseId: '65ead96f50d4111ca6f57b00',
        tableTitle: 'test_table',
        optionsTime: '2:00 PM',
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: userId,
        },
      });
      schoolScheduleRepository.schoolSchedules.push({
        id: 'school-schedule-id-2',
        courseId: '6436c2657efba14cf3f90000',
        tableTitle: 'test_table',
        optionsTime: '10:30 AM',
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: userId,
        },
      });
      const schoolScheduleCount =
        schoolScheduleRepository.schoolSchedules.length;

      // when
      const result =
        await schoolScheduleService.deleteAllSchoolSchedule(tableId);

      // then
      expect(result).toEqual({
        count: 2,
        items: [
          {
            id: 'school-schedule-id-1',
            courseId: '65ead96f50d4111ca6f57b00',
            tableTitle: 'test_table',
            optionsTime: '2:00 PM',
            tableEntity: {
              id: 'test_table_id',
              title: 'table_name',
              user: userId,
            },
          },
          {
            id: 'school-schedule-id-2',
            courseId: '6436c2657efba14cf3f90000',
            tableTitle: 'test_table',
            optionsTime: '10:30 AM',
            tableEntity: {
              id: 'test_table_id',
              title: 'table_name',
              user: userId,
            },
          },
        ],
      });
      expect(schoolScheduleRepository.schoolSchedules.length).toBe(
        schoolScheduleCount - 2,
      );
      expect(schoolScheduleRepository.schoolSchedules).not.toContainEqual({
        id: 'school-schedule-id-1',
        courseId: '65ead96f50d4111ca6f57b00',
        tableTitle: 'test_table',
        optionsTime: '2:00 PM',
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: userId,
        },
      });
      expect(schoolScheduleRepository.schoolSchedules).not.toContainEqual({
        id: 'school-schedule-id-2',
        courseId: '6436c2657efba14cf3f90000',
        tableTitle: 'test_table',
        optionsTime: '10:30 AM',
        tableEntity: {
          id: 'test_table_id',
          title: 'table_name',
          user: userId,
        },
      });
    });

    it('tableId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const tableId = 'invalid-table-id';

      // then
      expect(
        schoolScheduleService.deleteAllSchoolSchedule(tableId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
