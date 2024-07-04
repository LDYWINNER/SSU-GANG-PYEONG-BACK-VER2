import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolSchedule1720101120123 implements MigrationInterface {
  name = 'SchoolSchedule1720101120123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ADD "tableTitle" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "school_schedule" DROP COLUMN "tableTitle"`,
    );
  }
}
