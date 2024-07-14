import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseAvgGrade1720937829565 implements MigrationInterface {
  name = 'CourseAvgGrade1720937829565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "avgGrade"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "avgGrade" double precision NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "avgGrade"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "avgGrade" integer NOT NULL`,
    );
  }
}
