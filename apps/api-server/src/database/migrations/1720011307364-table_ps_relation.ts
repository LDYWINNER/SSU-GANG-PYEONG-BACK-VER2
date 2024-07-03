import { MigrationInterface, QueryRunner } from 'typeorm';

export class TablePsRelation1720011307364 implements MigrationInterface {
  name = 'TablePsRelation1720011307364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "table" DROP CONSTRAINT "FK_fab65d6ac3edaa21dc7e2e05bf3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "table" ADD CONSTRAINT "FK_fab65d6ac3edaa21dc7e2e05bf3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "table" DROP CONSTRAINT "FK_fab65d6ac3edaa21dc7e2e05bf3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "table" ADD CONSTRAINT "FK_fab65d6ac3edaa21dc7e2e05bf3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
