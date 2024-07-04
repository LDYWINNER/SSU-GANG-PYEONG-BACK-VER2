import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initialization1720085948305 implements MigrationInterface {
  name = 'Initialization1720085948305';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const typeExistsQuery = `
    SELECT EXISTS (
      SELECT 1
      FROM pg_type
      WHERE typname = 'user_role_enum'
      AND typtype = 'e'
    );
  `;
    const [{ exists }] = await queryRunner.query(typeExistsQuery);

    if (!exists) {
      // Create the enum type only if it does not already exist
      await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM ('USER', 'ADMIN', 'MODERATOR');
    `);
    }

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(
      `CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_6bbe63d2fe75e7f0ba1710351d" UNIQUE ("user_id"), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "board" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_865a0f2e22c140d261b1df80eb1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "board_comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "boardPostId" uuid, CONSTRAINT "PK_95c375493b1d9cf8e945fe4bf23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "board_post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "contents" character varying NOT NULL, "views" integer NOT NULL DEFAULT '0', "anonymity" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), "boardId" uuid, "userId" uuid, CONSTRAINT "PK_49b58dfdcb4daf72283096609f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "personal_schedule" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "courseId" character varying NOT NULL, "tableTitle" character varying NOT NULL, "sections" json NOT NULL, "tableEntityId" uuid, CONSTRAINT "PK_e8ab5a72977daf90ce2d2225265" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "table" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_28914b55c485fc2d7a101b1b2a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', "postCount" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ADD CONSTRAINT "FK_c9951f13af7909d37c0e2aec484" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" ADD CONSTRAINT "FK_8fcc34d97882a87cae13e26f80b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" ADD CONSTRAINT "FK_a7a7009e98543b00925015c46db" FOREIGN KEY ("boardPostId") REFERENCES "board_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" ADD CONSTRAINT "FK_40dd3637a1149d232fbbe9151e5" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" ADD CONSTRAINT "FK_bf59093f5afa4b0c79cbc7a96f1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_schedule" ADD CONSTRAINT "FK_f3938e59accda9216c864670627" FOREIGN KEY ("tableEntityId") REFERENCES "table"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "personal_schedule" DROP CONSTRAINT "FK_f3938e59accda9216c864670627"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" DROP CONSTRAINT "FK_bf59093f5afa4b0c79cbc7a96f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_post" DROP CONSTRAINT "FK_40dd3637a1149d232fbbe9151e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" DROP CONSTRAINT "FK_a7a7009e98543b00925015c46db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board_comment" DROP CONSTRAINT "FK_8fcc34d97882a87cae13e26f80b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" DROP CONSTRAINT "FK_c9951f13af7909d37c0e2aec484"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "table"`);
    await queryRunner.query(`DROP TABLE "personal_schedule"`);
    await queryRunner.query(`DROP TABLE "board_post"`);
    await queryRunner.query(`DROP TABLE "board_comment"`);
    await queryRunner.query(`DROP TABLE "board"`);
    await queryRunner.query(`DROP TABLE "refresh_token"`);
  }
}
