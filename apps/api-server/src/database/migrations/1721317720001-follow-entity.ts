import { MigrationInterface, QueryRunner } from 'typeorm';

export class FollowEntity1721317720001 implements MigrationInterface {
  name = 'FollowEntity1721317720001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "follow" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fk_leader_id" uuid NOT NULL, "fk_follower_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fda88bc28a84d2d6d06e19df6e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_db35db9bef60d5f4d9f9289d6e" ON "follow" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_44ba3c197eef7c48671310b19b" ON "follow" ("fk_leader_id", "fk_follower_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "follow" ADD CONSTRAINT "FK_2acc0102116c5bcdd875f4a0260" FOREIGN KEY ("fk_leader_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "follow" DROP CONSTRAINT "FK_2acc0102116c5bcdd875f4a0260"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_44ba3c197eef7c48671310b19b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_db35db9bef60d5f4d9f9289d6e"`,
    );
    await queryRunner.query(`DROP TABLE "follow"`);
  }
}
