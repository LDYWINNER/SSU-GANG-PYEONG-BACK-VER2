import { MigrationInterface, QueryRunner } from 'typeorm';

export class Course1720846917410 implements MigrationInterface {
  name = 'Course1720846917410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "course" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "avgGrade" integer NOT NULL, "classNbr" character varying NOT NULL, "subj" character varying NOT NULL, "crs" character varying NOT NULL, "courseTitle" character varying NOT NULL, "sbc" character varying NOT NULL, "cmp" character varying NOT NULL, "sctn" character varying NOT NULL, "credits" character varying NOT NULL, "day" character varying NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "past_instructors" text array NOT NULL, "recent_two_instructors" text array NOT NULL, "most_recent_instructor" character varying NOT NULL, "semesters" text array NOT NULL, CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "course_review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "semester" character varying NOT NULL, "instructor" character varying NOT NULL, "myLetterGrade" character varying NOT NULL, "teamProjectPresence" boolean NOT NULL, "quizPresence" boolean NOT NULL, "testQuantity" character varying NOT NULL, "testType" character varying NOT NULL, "generosity" character varying NOT NULL, "attendance" character varying NOT NULL, "homeworkQuantity" character varying NOT NULL, "difficulty" character varying NOT NULL, "overallGrade" integer NOT NULL, "overallEvaluation" character varying NOT NULL, "anonymity" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "courseId" uuid, "userId" uuid, CONSTRAINT "PK_6778f8a83352215ea3268869658" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."board_boardtype_enum" RENAME TO "board_boardtype_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."board_boardtype_enum" AS ENUM('ALL', 'FREE', 'COURSE', 'COURSE_REGISTER', 'SECRET', 'FRESHMEN', 'PROMOTION', 'CLUB', 'SBU')`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "boardType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "boardType" TYPE "public"."board_boardtype_enum" USING "boardType"::"text"::"public"."board_boardtype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "boardType" SET DEFAULT 'ALL'`,
    );
    await queryRunner.query(`DROP TYPE "public"."board_boardtype_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_9fac4258c1f8b81a63bc5fd46b8" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_6a98c500e1ee246e073af304c5b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_6a98c500e1ee246e073af304c5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_9fac4258c1f8b81a63bc5fd46b8"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."board_boardtype_enum_old" AS ENUM('ALL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "boardType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "boardType" TYPE "public"."board_boardtype_enum_old" USING "boardType"::"text"::"public"."board_boardtype_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "boardType" SET DEFAULT 'ALL'`,
    );
    await queryRunner.query(`DROP TYPE "public"."board_boardtype_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."board_boardtype_enum_old" RENAME TO "board_boardtype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "course_review"`);
    await queryRunner.query(`DROP TABLE "course"`);
  }
}
