import { MigrationInterface, QueryRunner } from "typeorm";

export class BoardUpdate1718602291484 implements MigrationInterface {
    name = 'BoardUpdate1718602291484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "board" ADD "views" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "board" ADD "category" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "board" ADD "anonymity" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "anonymity"`);
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "views"`);
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "title"`);
    }

}
