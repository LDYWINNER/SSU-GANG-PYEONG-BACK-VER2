import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolScheduleOptionalProp1720104811124
  implements MigrationInterface
{
  name = 'SchoolScheduleOptionalProp1720104811124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ALTER COLUMN "complicatedCourseOption" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ALTER COLUMN "twoOptionsDay" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ALTER COLUMN "optionsTime" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ALTER COLUMN "optionsTime" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ALTER COLUMN "twoOptionsDay" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ALTER COLUMN "complicatedCourseOption" SET NOT NULL`,
    );
  }
}
