import { MigrationInterface, QueryRunner } from 'typeorm';

export class LikeEntityDeleteCascade1721280155092
  implements MigrationInterface
{
  name = 'LikeEntityDeleteCascade1721280155092';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_likes" DROP CONSTRAINT "FK_8983473433b346c07390cb818de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" DROP CONSTRAINT "FK_952296769a7f8508a3572a1c7b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post_likes" DROP CONSTRAINT "FK_2b413ec816b9d4dbc72684d10eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment_likes" DROP CONSTRAINT "FK_677c0595c6ea3f749e3c53c4264"`,
    );
    await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "boardType"`);
    await queryRunner.query(`DROP TYPE "public"."board_boardtype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "board" ADD "boardType" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" ADD CONSTRAINT "FK_8983473433b346c07390cb818de" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" ADD CONSTRAINT "FK_952296769a7f8508a3572a1c7b4" FOREIGN KEY ("fk_course_review_id") REFERENCES "course_review"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post_likes" ADD CONSTRAINT "FK_2b413ec816b9d4dbc72684d10eb" FOREIGN KEY ("fk_board_post_id") REFERENCES "board_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment_likes" ADD CONSTRAINT "FK_677c0595c6ea3f749e3c53c4264" FOREIGN KEY ("fk_board_comment_id") REFERENCES "board_comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "board_comment_likes" DROP CONSTRAINT "FK_677c0595c6ea3f749e3c53c4264"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post_likes" DROP CONSTRAINT "FK_2b413ec816b9d4dbc72684d10eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" DROP CONSTRAINT "FK_952296769a7f8508a3572a1c7b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" DROP CONSTRAINT "FK_8983473433b346c07390cb818de"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'USER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER'`,
    );
    await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "boardType"`);
    await queryRunner.query(
      `CREATE TYPE "public"."board_boardtype_enum" AS ENUM('ALL', 'FREE', 'COURSE', 'COURSE_REGISTER', 'SECRET', 'FRESHMEN', 'PROMOTION', 'CLUB', 'SBU')`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ADD "boardType" "public"."board_boardtype_enum" NOT NULL DEFAULT 'ALL'`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment_likes" ADD CONSTRAINT "FK_677c0595c6ea3f749e3c53c4264" FOREIGN KEY ("fk_board_comment_id") REFERENCES "board_comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post_likes" ADD CONSTRAINT "FK_2b413ec816b9d4dbc72684d10eb" FOREIGN KEY ("fk_board_post_id") REFERENCES "board_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" ADD CONSTRAINT "FK_952296769a7f8508a3572a1c7b4" FOREIGN KEY ("fk_course_review_id") REFERENCES "course_review"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" ADD CONSTRAINT "FK_8983473433b346c07390cb818de" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
