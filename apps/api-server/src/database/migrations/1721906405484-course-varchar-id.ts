import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseVarcharId1721906405484 implements MigrationInterface {
  name = 'CourseVarcharId1721906405484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_9fac4258c1f8b81a63bc5fd46b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" DROP CONSTRAINT "FK_dbb47bb6a480266254d223160c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "PK_bf95180dd756fd204fb01ce4916"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD "id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP COLUMN "courseId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD "courseId" character varying`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a88be66c30ee792664f9ea6709"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" DROP COLUMN "fk_course_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" ADD "fk_course_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a88be66c30ee792664f9ea6709" ON "course_likes" ("fk_course_id", "fk_user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_9fac4258c1f8b81a63bc5fd46b8" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" ADD CONSTRAINT "FK_dbb47bb6a480266254d223160c6" FOREIGN KEY ("fk_course_id") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_likes" DROP CONSTRAINT "FK_dbb47bb6a480266254d223160c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_9fac4258c1f8b81a63bc5fd46b8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a88be66c30ee792664f9ea6709"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" DROP COLUMN "fk_course_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" ADD "fk_course_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a88be66c30ee792664f9ea6709" ON "course_likes" ("fk_user_id", "fk_course_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP COLUMN "courseId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD "courseId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "PK_bf95180dd756fd204fb01ce4916"`,
    );
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "course" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" ADD CONSTRAINT "FK_dbb47bb6a480266254d223160c6" FOREIGN KEY ("fk_course_id") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_9fac4258c1f8b81a63bc5fd46b8" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
