import { MigrationInterface, QueryRunner } from 'typeorm';

import { ConfigService } from '../../config/config.service';

export class addPasswordResetUsedColumn1625018560739 implements MigrationInterface {
  name = 'addPasswordResetUsedColumn1625018560739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const config = await new ConfigService().setConfigFromVault();
    const { schema } = config.get('db');
    await queryRunner.query(`
        ALTER TABLE "${schema}"."password_resets"
        ADD "used" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
        ALTER TABLE "${schema}"."password_resets"
        ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const config = await new ConfigService().setConfigFromVault();
    const { schema } = config.get('db');
    await queryRunner.query(`
        ALTER TABLE "${schema}"."password_resets"
        DROP COLUMN "updated_at"
    `);
    await queryRunner.query(`
        ALTER TABLE "${schema}"."password_resets"
        DROP COLUMN "used"
    `);
  }
}
