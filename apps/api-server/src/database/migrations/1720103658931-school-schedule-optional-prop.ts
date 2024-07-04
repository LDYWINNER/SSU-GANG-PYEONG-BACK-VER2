import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolScheduleOptionalProp1720103658931
  implements MigrationInterface
{
  name = 'SchoolScheduleOptionalProp1720103658931';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "school_schedule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courseId" character varying NOT NULL, "tableTitle" character varying NOT NULL, "complicatedCourseOption" character varying NOT NULL, "twoOptionsDay" character varying NOT NULL, "optionsTime" character varying NOT NULL, "tableEntityId" uuid, CONSTRAINT "PK_9daee08f0f954c84f9fc645c6d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ADD CONSTRAINT "FK_90d7859003d4d1727ea62dddc9a" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "school_schedule" DROP CONSTRAINT "FK_90d7859003d4d1727ea62dddc9a"`,
    );
    await queryRunner.query(`DROP TABLE "school_schedule"`);
  }
}
