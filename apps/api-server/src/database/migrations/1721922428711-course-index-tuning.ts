import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseIndexTuning1721922428711 implements MigrationInterface {
  name = 'CourseIndexTuning1721922428711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "semesters"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "semesters" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dcc660408b1846e6a8dd2de0fc" ON "course" ("subj") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d233c1c4ccfe5d35e7bc350d47" ON "course" ("crs") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_551eb7800f211468adc5cbcd1d" ON "course" ("semesters") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_551eb7800f211468adc5cbcd1d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d233c1c4ccfe5d35e7bc350d47"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dcc660408b1846e6a8dd2de0fc"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "semesters"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "semesters" text array NOT NULL`,
    );
  }
}
