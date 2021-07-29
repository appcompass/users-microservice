import { MigrationInterface, QueryRunner } from 'typeorm';

import { ConfigService } from '../../config/config.service';

export class addsLastLogoutColumn1627497873328 implements MigrationInterface {
  name = 'addsLastLogoutColumn1627497873328';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const config = await new ConfigService().setConfigFromVault();
    const { schema } = config.get('db');

    await queryRunner.query(`
      UPDATE "${schema}"."users" SET "token_expiration" = now()
    `);

    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      RENAME COLUMN "token_expiration" TO "last_logout"
    `);
    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      ALTER COLUMN "last_logout"
      SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      ALTER COLUMN "last_logout"
      SET DEFAULT 'now()'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const config = await new ConfigService().setConfigFromVault();
    const { schema } = config.get('db');
    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      ALTER COLUMN "last_logout" DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      ALTER COLUMN "last_logout" DROP NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      RENAME COLUMN "last_logout" TO "token_expiration"
    `);
  }
}
