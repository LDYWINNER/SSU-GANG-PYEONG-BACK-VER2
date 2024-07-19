import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPostCount1721385720583 implements MigrationInterface {
  name = 'UserPostCount1721385720583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "postCount" TO "courseReviewCount"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "courseReviewCount" TO "postCount"`,
    );
  }
}
