import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskIndexTuning1721938589224 implements MigrationInterface {
  name = 'TaskIndexTuning1721938589224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_c42f8246fa90bc34df6d4098a3" ON "to_do_task" ("completeDate") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c42f8246fa90bc34df6d4098a3"`,
    );
  }
}
