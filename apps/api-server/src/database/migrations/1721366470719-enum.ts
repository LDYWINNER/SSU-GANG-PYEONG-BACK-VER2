import { MigrationInterface, QueryRunner } from 'typeorm';

export class Enum1721366470719 implements MigrationInterface {
  name = 'Enum1721366470719';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."course_review_likes_reaction_enum" AS ENUM('LIKE', 'DISAGREE', 'HAPPY', 'SAD', 'FIRE', 'CLAP', 'WOW', 'HEART', 'BOOK_MARK', 'undefined')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" ADD "reaction" "public"."course_review_likes_reaction_enum" NOT NULL DEFAULT 'LIKE'`,
    );
    await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "boardType"`);
    await queryRunner.query(
      `CREATE TYPE "public"."board_boardtype_enum" AS ENUM('ALL', 'FREE', 'COURSE', 'COURSE_REGISTER', 'SECRET', 'FRESHMEN', 'PROMOTION', 'CLUB', 'SBU', 'undefined')`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ADD "boardType" "public"."board_boardtype_enum" NOT NULL DEFAULT 'ALL'`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'USER', 'undefined')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "boardType"`);
    await queryRunner.query(`DROP TYPE "public"."board_boardtype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "board" ADD "boardType" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" DROP COLUMN "reaction"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."course_review_likes_reaction_enum"`,
    );
  }
}
