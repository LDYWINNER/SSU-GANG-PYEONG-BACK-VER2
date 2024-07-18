import { MigrationInterface, QueryRunner } from 'typeorm';

export class FollowEntity1721322858204 implements MigrationInterface {
  name = 'FollowEntity1721322858204';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "follow" DROP CONSTRAINT "FK_2acc0102116c5bcdd875f4a0260"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "follow" ADD CONSTRAINT "FK_2acc0102116c5bcdd875f4a0260" FOREIGN KEY ("fk_leader_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
