import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserBlock1721396024794 implements MigrationInterface {
  name = 'UserBlock1721396024794';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "block" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fk_hater_id" uuid NOT NULL, "fk_hated_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d0925763efb591c2e2ffb267572" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2f3e38fb8fe91438bc6bbd3188" ON "block" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_bda1e3b61b87eea0e0e13db824" ON "block" ("fk_hater_id", "fk_hated_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bda1e3b61b87eea0e0e13db824"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f3e38fb8fe91438bc6bbd3188"`,
    );
    await queryRunner.query(`DROP TABLE "block"`);
  }
}
