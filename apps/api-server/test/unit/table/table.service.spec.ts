import { Test, TestingModule } from '@nestjs/testing';
import { TableService } from '../../../src/routes/table/table.service';
import { Table } from '../../../src/entity/table.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StubTableRepository } from './stub/table-repository';
import { NotFoundException } from '@nestjs/common';
import { StubUserRepository } from '../user/stub-repository';
import { User } from '../../../src/entity/user.entity';
import { UserType } from '../../../src/common/enum/user.enum';

describe('유저 시간표 테이블 관련 서비스 테스트', () => {
  let tableService: TableService;
  let tableRepository: StubTableRepository;
  let userRepository: StubUserRepository;
  const tableRepositoryToken = getRepositoryToken(Table);
  const userRepositoryToken = getRepositoryToken(User);
  const userId = 'user_id';

  beforeEach(async () => {
    tableRepository = new StubTableRepository();
    userRepository = new StubUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        {
          provide: tableRepositoryToken,
          useValue: tableRepository,
        },
        {
          provide: userRepositoryToken,
          useValue: userRepository,
        },
      ],
    }).compile();

    tableService = module.get<TableService>(TableService);
  });

  describe('createTable 함수 테스트', () => {
    it('createTable 함수 결과값 테스트', async () => {
      // given
      const userId = 'test_user_id';
      const tableName = 'table_name';
      const tableRowCount = tableRepository.tables.length;

      // when
      const result = await tableService.createTable(userId, {
        title: tableName,
      });

      // then
      expect(result).toEqual({
        id: 'table-id',
        title: 'table_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
      expect(tableRepository.tables.length).toBe(tableRowCount + 1);
      expect(tableRepository.tables).toContainEqual({
        id: 'table-id',
        title: 'table_name',
        user: {
          createdAt: new Date('2024-06-28T18:19:29.764Z'),
          email: 'test_email',
          id: 'test_user_id',
          password: 'test_password',
          courseReviewCount: 0,
          role: UserType.User.text,
          updateAt: new Date('2024-06-28T18:19:29.764Z'),
          username: 'test_name',
        },
      });
    });

    it('userId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const userId = 'invalid-user-id';
      const tableName = 'table_name';

      // then
      expect(
        tableService.createTable(userId, { title: tableName }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTable 함수 테스트', () => {
    it('테이블 이름 변경 시 updateTable 함수 결과값 테스트', async () => {
      // given
      const tableId = 'table_name_test_id';
      tableRepository.tables.push({
        id: 'table_name_test_id',
        title: 'table_name',
        user: userId,
      });
      const tableRowCount = tableRepository.tables.length;

      // when
      const result = await tableService.updateTable(tableId, {
        title: 'new_table_name',
      });

      // then
      expect(result).toEqual({
        id: 'table_name_test_id',
        title: 'new_table_name',
        user: 'user_id',
      });
      expect(tableRepository.tables.length).toBe(tableRowCount);
      expect(tableRepository.tables).toContainEqual({
        id: 'table_name_test_id',
        title: 'new_table_name',
        user: 'user_id',
      });
    });

    it('tableId가 존재하지 않으면 에러가 납니다', () => {
      // given
      const tableId = 'invalid-table-id';
      const newTable = {
        title: 'new_table_name',
      };

      // then
      expect(tableService.updateTable(tableId, newTable)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteTable 함수 테스트', () => {
    it('deleteTable 함수 결과값 테스트', async () => {
      // given
      const tableId = 'table-id';
      tableRepository.tables.push({
        id: 'table-id',
        title: 'table_name',
        user: userId,
      });
      const tableRowCount = tableRepository.tables.length;

      // when
      const result = await tableService.deleteTable(tableId);

      // then
      expect(result).toEqual({
        id: 'table-id',
        title: 'table_name',
        user: 'user_id',
      });
      expect(tableRepository.tables.length).toBe(tableRowCount - 1);
      expect(tableRepository.tables).not.toContainEqual({
        id: 'table-id',
        title: 'table_name',
        schoolSubjects: [],
        personalSubjects: [],
        user: 'user_id',
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
