import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from '../../../src/routes/table/table.service';
import { Table } from 'apps/api-server/src/entity/table.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubTableRepository } from './stub-repository';
import { NotFoundException } from '@nestjs/common';

describe('유저 시간표 테이블 관련 서비스 테스트', () => {
  let tableService: TableService;
  let tableRepository: StubTableRepository;
  const tableRepositoryToken = getRepositoryToken(Table);
  const userId = 'user_id';

  beforeEach(async () => {
    tableRepository = new StubTableRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        {
          provide: tableRepositoryToken,
          useValue: tableRepository,
        },
      ],
    }).compile();

    tableService = module.get<TableService>(TableService);
  });

  describe('createNewTable 함수 테스트', () => {
    it('createTable 함수 결과값 테스트', () => {
      // given
      const userId = 'user_id';
      const tableName = 'table_name';
      const tableRowCount = tableRepository.tables.length;

      // when
      const result = tableService.createTable(userId, tableName);

      // then
      expect(result).toEqual({
        id: 'table-id',
        title: 'table_name',
        subjects: [],
        user: userId,
      });
      expect(tableRepository.tables.length).toBe(tableRowCount + 1);
      expect(tableRepository.tables).toContainEqual({
        id: 'table-id',
        title: 'table_name',
        subjects: [],
        user: userId,
      });
    });

    it('userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';
      const tableName = 'table_name';

      // then
      expect(tableService.createTable(userId, tableName)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTable 함수 테스트', () => {
    it('테이블 이름 변경 시 updateTable 함수 결과값 테스트', () => {
      // given
      const tableId = 'table_name_test_id';
      const tableRowCount = tableRepository.tables.length;
      tableRepository.tables.push({
        id: 'table_name_test_id',
        title: 'table_name',
        subjects: ['subject1', 'subject2'],
        user: userId,
      });

      // when
      const result = tableService.updateTable(tableId, {
        title: 'new_table_name',
        subjects: ['subject1', 'subject2'],
      });

      // then
      expect(result).toEqual({
        id: 'table_name_test_id',
        title: 'new_table_name',
      });
      expect(tableRepository.tables.length).toBe(tableRowCount);
      expect(tableRepository.tables).toContainEqual({
        id: 'table_name_test_id',
        title: 'new_table_name',
        subjects: ['subject1', 'subject2'],
        user: userId,
      });
    });

    it('시간표 항목 변경 시 updateTable 함수 결과값 테스트', () => {
      // given
      const tableId = 'table_subjects_test_id';
      const tableRowCount = tableRepository.tables.length;
      tableRepository.tables.push({
        id: 'table_subjects_test_id',
        title: 'table_name',
        subjects: ['subject1', 'subject2'],
        user: userId,
      });

      // when
      const result = tableService.updateTable(tableId, {
        title: 'table_name',
        subjects: ['subject1', 'subject3'],
      });

      // then
      expect(result).toEqual({
        id: 'table_subjects_test_id',
        subjects: ['subject1', 'subject3'],
      });
      expect(tableRepository.tables.length).toBe(tableRowCount);
      expect(tableRepository.tables).toContainEqual({
        id: 'table_subjects_test_id',
        title: 'table_name',
        subjects: ['subject1', 'subject3'],
        user: userId,
      });
    });

    it('테이블 이름과 시간표 항목 모두 변경 시 updateTable 함수 결과값 테스트', () => {
      // given
      const tableId = 'table_both_test_id';
      const tableRowCount = tableRepository.tables.length;
      tableRepository.tables.push({
        id: 'table_both_test_id',
        title: 'new_table_name',
        subjects: ['subject3', 'subject1', 'subject4'],
        user: userId,
      });

      // when
      const result = tableService.updateTable(tableId, {
        title: 'new_table_name',
        subjects: ['subject3', 'subject1', 'subject4'],
      });

      // then
      expect(result).toEqual({
        id: 'table_both_test_id',
        title: 'new_table_name',
        subjects: ['subject3', 'subject1', 'subject4'],
      });
      expect(tableRepository.tables.length).toBe(tableRowCount);
      expect(tableRepository.tables).toContainEqual({
        id: 'table_both_test_id',
        title: 'new_table_name',
        subjects: ['subject3', 'subject1', 'subject4'],
        user: userId,
      });
    });

    it('tableId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const tableId = 'invalid-table-id';
      const newTable = {
        title: 'new_table_name',
        subjects: ['subject1'],
      };

      // then
      expect(tableService.updateTable(tableId, newTable)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteTable 함수 테스트', () => {
    it('deleteTable 함수 결과값 테스트', () => {
      // given
      const tableId = 'table_name';
      const tableRowCount = tableRepository.tables.length;

      // when
      tableRepository.tables.push({
        id: 'table-id',
        title: 'table_name',
        subjects: [],
        user: userId,
      });
      const result = tableService.deleteTable(tableId);

      // then
      expect(result).toEqual({
        id: 'table-id',
        title: 'table_name',
        subjects: [],
        user: userId,
      });
      expect(tableRepository.tables.length).toBe(tableRowCount - 1);
      expect(tableRepository.tables).not.toContainEqual({
        id: 'table-id',
        title: 'table_name',
        subjects: [],
        user: userId,
      });
    });

    it('tableId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const tableId = 'invalid-table-id';

      // then
      expect(tableService.deleteTable(tableId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
