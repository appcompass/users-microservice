import { MigrationInterface, QueryRunner } from 'typeorm';

import { ConfigService } from '../../config/config.service';
import { getVaultConfig } from '../../config/vault.utils';

export class addUserLoginEntryLog1578359230572 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const config = new ConfigService(await getVaultConfig());
    const schema = config.get('dbSchema');
    await queryRunner.query(
      `
      CREATE OR REPLACE FUNCTION ${schema}.adds_user_login_entry() RETURNS TRIGGER AS
      $BODY$
      BEGIN
        IF (old.last_login != new.last_login) THEN
          INSERT INTO ${schema}.user_logins (user_id, login_at)
          VALUES (new.id, new.last_login);
        END IF;
        RETURN new;
      END;
      $BODY$ LANGUAGE PLPGSQL;

      CREATE TRIGGER add_user_login_entry
        AFTER UPDATE
        ON ${schema}.users
        FOR EACH ROW
      EXECUTE PROCEDURE ${schema}.adds_user_login_entry();
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const config = new ConfigService(await getVaultConfig());
    const schema = config.get('dbSchema');
    await queryRunner.query(`DROP FUNCTION ${schema}.adds_user_login_entry() CASCADE`);
  }
}
