import { MigrationInterface, QueryRunner } from 'typeorm';

export class LikeFeature1721126104287 implements MigrationInterface {
  name = 'LikeFeature1721126104287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "course_review_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fk_user_id" uuid NOT NULL, "fk_course_review_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f41b38f908a878eb9b783f3a1fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66b342282fa7e595730e9a8d75" ON "course_review_likes" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_acbc144df006e8d6bfe432993d" ON "course_review_likes" ("fk_course_review_id", "fk_user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "course_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fk_user_id" uuid NOT NULL, "fk_course_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_27a0a53d61523df9affc5e02757" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7e733009ed9038cabddd910134" ON "course_likes" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a88be66c30ee792664f9ea6709" ON "course_likes" ("fk_course_id", "fk_user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "board_comment_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fk_user_id" uuid NOT NULL, "fk_board_comment_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_418483646a5dc0cad53c1b746e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d8033e6a4db07f0a35ec09792" ON "board_comment_likes" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_587b35c942b7f05a1bb41999f8" ON "board_comment_likes" ("fk_board_comment_id", "fk_user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "board_post_likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fk_user_id" uuid NOT NULL, "fk_board_post_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_371e227765a074aef486691aa20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe6c7f9bf700db09c1b177ea7d" ON "board_post_likes" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_96beeb6a347377835e6318e4d8" ON "board_post_likes" ("fk_board_post_id", "fk_user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" ADD "likes" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" ADD "likes" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD "likes" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD "likes" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" ADD CONSTRAINT "FK_952296769a7f8508a3572a1c7b4" FOREIGN KEY ("fk_course_review_id") REFERENCES "course_review"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" ADD CONSTRAINT "FK_2b0eb046f05d4ef7ce2ab40ee9b" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" ADD CONSTRAINT "FK_dbb47bb6a480266254d223160c6" FOREIGN KEY ("fk_course_id") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" ADD CONSTRAINT "FK_8983473433b346c07390cb818de" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment_likes" ADD CONSTRAINT "FK_677c0595c6ea3f749e3c53c4264" FOREIGN KEY ("fk_board_comment_id") REFERENCES "board_comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment_likes" ADD CONSTRAINT "FK_9d86ee507bef709d66fc0948720" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post_likes" ADD CONSTRAINT "FK_2b413ec816b9d4dbc72684d10eb" FOREIGN KEY ("fk_board_post_id") REFERENCES "board_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post_likes" ADD CONSTRAINT "FK_6dd694a0986bc4e1cdfb93d70cd" FOREIGN KEY ("fk_user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "board_post_likes" DROP CONSTRAINT "FK_6dd694a0986bc4e1cdfb93d70cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post_likes" DROP CONSTRAINT "FK_2b413ec816b9d4dbc72684d10eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment_likes" DROP CONSTRAINT "FK_9d86ee507bef709d66fc0948720"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment_likes" DROP CONSTRAINT "FK_677c0595c6ea3f749e3c53c4264"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" DROP CONSTRAINT "FK_8983473433b346c07390cb818de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_likes" DROP CONSTRAINT "FK_dbb47bb6a480266254d223160c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" DROP CONSTRAINT "FK_2b0eb046f05d4ef7ce2ab40ee9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review_likes" DROP CONSTRAINT "FK_952296769a7f8508a3572a1c7b4"`,
    );
    await queryRunner.query(`ALTER TABLE "course_review" DROP COLUMN "likes"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "likes"`);
    await queryRunner.query(`ALTER TABLE "board_post" DROP COLUMN "likes"`);
    await queryRunner.query(`ALTER TABLE "board_comment" DROP COLUMN "likes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_96beeb6a347377835e6318e4d8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe6c7f9bf700db09c1b177ea7d"`,
    );
    await queryRunner.query(`DROP TABLE "board_post_likes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_587b35c942b7f05a1bb41999f8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9d8033e6a4db07f0a35ec09792"`,
    );
    await queryRunner.query(`DROP TABLE "board_comment_likes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a88be66c30ee792664f9ea6709"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7e733009ed9038cabddd910134"`,
    );
    await queryRunner.query(`DROP TABLE "course_likes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_acbc144df006e8d6bfe432993d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66b342282fa7e595730e9a8d75"`,
    );
    await queryRunner.query(`DROP TABLE "course_review_likes"`);
  }
}
