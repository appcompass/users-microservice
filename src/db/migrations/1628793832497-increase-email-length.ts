import { MigrationInterface, QueryRunner } from 'typeorm';

import { ConfigService } from '../../config/config.service';

export class increaseEmailLength1628793832497 implements MigrationInterface {
  name = 'increaseEmailLength1628793832497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const config = new ConfigService();
    const { schema } = config.get('DB_CONFIG');

    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      ALTER COLUMN "email" TYPE varchar(255)
    `);
    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      ALTER COLUMN "last_logout"
      SET DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const config = new ConfigService();
    const { schema } = config.get('DB_CONFIG');

    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      ALTER COLUMN "email" TYPE varchar(64)
    `);
    await queryRunner.query(`
      ALTER TABLE "${schema}"."users"
      ALTER COLUMN "last_logout"
      SET DEFAULT now()
    `);
  }
}
