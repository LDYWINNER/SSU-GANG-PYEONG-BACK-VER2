import { MigrationInterface, QueryRunner } from 'typeorm';

export class BoardPostType1720682002272 implements MigrationInterface {
  name = 'BoardPostType1720682002272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."board_boardtype_enum" AS ENUM('ALL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ADD "boardType" "public"."board_boardtype_enum" NOT NULL DEFAULT 'ALL'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "boardType"`);
    await queryRunner.query(`DROP TYPE "public"."board_boardtype_enum"`);
  }
}
