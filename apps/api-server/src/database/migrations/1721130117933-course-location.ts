import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseLocation1721130117933 implements MigrationInterface {
  name = 'CourseLocation1721130117933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course" ADD "location" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "location"`);
  }
}
