import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnDeleteCascade1719997790967 implements MigrationInterface {
  name = 'OnDeleteCascade1719997790967';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" DROP CONSTRAINT "FK_a7a7009e98543b00925015c46db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" DROP CONSTRAINT "FK_40dd3637a1149d232fbbe9151e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" DROP CONSTRAINT "FK_f3938e59accda9216c864670627"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_schedule" DROP CONSTRAINT "FK_90d7859003d4d1727ea62dddc9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" ADD CONSTRAINT "FK_a7a7009e98543b00925015c46db" FOREIGN KEY ("boardPostId") REFERENCES "board_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" ADD CONSTRAINT "FK_40dd3637a1149d232fbbe9151e5" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" ADD CONSTRAINT "FK_f3938e59accda9216c864670627" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ADD CONSTRAINT "FK_90d7859003d4d1727ea62dddc9a" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "school_schedule" DROP CONSTRAINT "FK_90d7859003d4d1727ea62dddc9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" DROP CONSTRAINT "FK_f3938e59accda9216c864670627"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" DROP CONSTRAINT "FK_40dd3637a1149d232fbbe9151e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" DROP CONSTRAINT "FK_a7a7009e98543b00925015c46db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_schedule" ADD CONSTRAINT "FK_90d7859003d4d1727ea62dddc9a" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" ADD CONSTRAINT "FK_f3938e59accda9216c864670627" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" ADD CONSTRAINT "FK_40dd3637a1149d232fbbe9151e5" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" ADD CONSTRAINT "FK_a7a7009e98543b00925015c46db" FOREIGN KEY ("boardPostId") REFERENCES "board_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
