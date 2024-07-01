import { MigrationInterface, QueryRunner } from 'typeorm';

export class TablePersonalSchedule1719813960356 implements MigrationInterface {
  name = 'TablePersonalSchedule1719813960356';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "table" RENAME COLUMN "subjects" TO "schoolSubjects"`,
    );
    await queryRunner.query(
      `CREATE TABLE "personal_schedule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courseId" character varying NOT NULL, "table" character varying NOT NULL, "sections" json NOT NULL, "tableEntityId" uuid, CONSTRAINT "PK_e8ab5a72977daf90ce2d2225265" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" ADD CONSTRAINT "FK_f3938e59accda9216c864670627" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" DROP CONSTRAINT "FK_f3938e59accda9216c864670627"`,
    );
    await queryRunner.query(`DROP TABLE "personal_schedule"`);
    await queryRunner.query(
      `ALTER TABLE "table" RENAME COLUMN "schoolSubjects" TO "subjects"`,
    );
  }
}
