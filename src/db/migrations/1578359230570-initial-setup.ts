import { MigrationInterface, QueryRunner } from 'typeorm';

import { ConfigService } from '../../config/config.service';

export class initialSetup1578359230572 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const config = await new ConfigService().setConfigFromVault();
    const { schema } = config.get('db');
    await queryRunner.query(
      `CREATE TABLE "${schema}"."user_logins" ("id" SERIAL NOT NULL, "login_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "users_user_logins_id_pkey" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."users" ("id" SERIAL NOT NULL, "email" character varying(64) NOT NULL, "password" character varying(255) NOT NULL, "active" boolean NOT NULL DEFAULT false, "activation_code" character varying(64) NOT NULL, "activated_at" TIMESTAMP, "last_login" TIMESTAMP, "token_expiration" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "users_users_email_unique" UNIQUE ("email"), CONSTRAINT "users_users_id_pkey" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "${schema}"."password_resets" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "code" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "users_password_resets_code_unique" UNIQUE ("code"), CONSTRAINT "users_password_resets_id_pkey" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."user_logins" ADD CONSTRAINT "users_user_logins_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "${schema}"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."password_resets" ADD CONSTRAINT "users_password_resets_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "${schema}"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const config = await new ConfigService().setConfigFromVault();
    const { schema } = config.get('db');
    await queryRunner.query(
      `ALTER TABLE "${schema}"."password_resets" DROP CONSTRAINT "users_password_resets_user_id_foreign"`
    );
    await queryRunner.query(
      `ALTER TABLE "${schema}"."user_logins" DROP CONSTRAINT "users_user_logins_user_id_foreign"`
    );
    await queryRunner.query(`DROP TABLE "${schema}"."password_resets"`);
    await queryRunner.query(`DROP TABLE "${schema}"."users"`);
    await queryRunner.query(`DROP TABLE "${schema}"."user_logins"`);
  }
}
