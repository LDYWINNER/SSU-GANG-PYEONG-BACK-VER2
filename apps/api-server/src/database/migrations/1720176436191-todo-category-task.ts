import { MigrationInterface, QueryRunner } from 'typeorm';

export class TodoCategoryTask1720176436191 implements MigrationInterface {
  name = 'TodoCategoryTask1720176436191';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "to_do_task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "isCompleted" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categorySubj" character varying NOT NULL DEFAULT '', "completeDate" character varying NOT NULL, "toDoCategoryId" uuid, "userId" uuid, CONSTRAINT "PK_d5583bdc2e8d7fed3bd0968a1a1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "to_do_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "isEditable" boolean NOT NULL DEFAULT true, "color" text NOT NULL, "icon" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_082e5fc725d23a61d66b4ad107a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "to_do_task" ADD CONSTRAINT "FK_2761a3cdd4154010cb62e804fca" FOREIGN KEY ("toDoCategoryId") REFERENCES "to_do_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "to_do_task" ADD CONSTRAINT "FK_96c0c1a946d326eb737da9fa614" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "to_do_category" ADD CONSTRAINT "FK_64745fd10024a915ef62916a02b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "to_do_category" DROP CONSTRAINT "FK_64745fd10024a915ef62916a02b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "to_do_task" DROP CONSTRAINT "FK_96c0c1a946d326eb737da9fa614"`,
    );
    await queryRunner.query(
      `ALTER TABLE "to_do_task" DROP CONSTRAINT "FK_2761a3cdd4154010cb62e804fca"`,
    );
    await queryRunner.query(`DROP TABLE "to_do_category"`);
    await queryRunner.query(`DROP TABLE "to_do_task"`);
  }
}
