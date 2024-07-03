import { MigrationInterface, QueryRunner } from 'typeorm';

export class TablePersonalSchedule1719942971413 implements MigrationInterface {
  name = 'TablePersonalSchedule1719942971413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" DROP CONSTRAINT "FK_f3938e59accda9216c864670627"`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" RENAME COLUMN "table" TO "tableTitle"`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" ADD CONSTRAINT "FK_f3938e59accda9216c864670627" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" DROP CONSTRAINT "FK_f3938e59accda9216c864670627"`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" RENAME COLUMN "tableTitle" TO "table"`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" ADD CONSTRAINT "FK_f3938e59accda9216c864670627" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
