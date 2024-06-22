import { MigrationInterface, QueryRunner } from 'typeorm';

export class BoardUpdate1718604743250 implements MigrationInterface {
  name = 'BoardUpdate1718604743250';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "board" DROP CONSTRAINT "FK_c9951f13af7909d37c0e2aec484"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "views" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "anonymity" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "userId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ADD CONSTRAINT "FK_c9951f13af7909d37c0e2aec484" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "board" DROP CONSTRAINT "FK_c9951f13af7909d37c0e2aec484"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "anonymity" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ALTER COLUMN "views" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ADD CONSTRAINT "FK_c9951f13af7909d37c0e2aec484" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
