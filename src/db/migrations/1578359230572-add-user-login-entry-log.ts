import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserLoginEntryLog1578359230572 implements MigrationInterface {
  name = 'addUserLoginEntryLog1578359230572';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `
      CREATE OR REPLACE FUNCTION adds_user_login_entry() RETURNS TRIGGER AS
      $BODY$
      BEGIN
        IF (old.last_login != new.last_login) THEN
          INSERT INTO user_logins (user_id, login_at)
          VALUES (new.id, new.last_login);
        END IF;
        RETURN new;
      END;
      $BODY$ LANGUAGE PLPGSQL;

      CREATE TRIGGER add_user_login_entry
        AFTER UPDATE
        ON users
        FOR EACH ROW
      EXECUTE PROCEDURE adds_user_login_entry();
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP FUNCTION adds_user_login_entry() CASCADE');
  }
}
