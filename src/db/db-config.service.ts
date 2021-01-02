import { ConnectionOptions } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { PasswordReset } from '../user/entities/password-reset.entity';
import { UserLogin } from '../user/entities/user-login.entity';
import { User } from '../user/entities/user.entity';
import { DBNamingStrategy } from './naming.strategy';

export const entities: Function[] = [User, PasswordReset, UserLogin];

@Injectable()
export class DBConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.config;
  }

  get config() {
    return {
      logging: this.configService.get('NODE_ENV') === 'production' ? ['error', 'schema', 'warn'] : 'all',
      type: this.configService.get('dbType'),
      host: this.configService.get('dbHost'),
      port: this.configService.get('dbPort'),
      username: this.configService.get('dbUser'),
      password: this.configService.get('dbPassword'),
      database: this.configService.get('dbName'),
      schema: this.configService.get('dbSchema'),
      synchronize: this.configService.get('dbSyncronize'),
      migrationsRun: this.configService.get('dbSyncronize'),
      namingStrategy: new DBNamingStrategy(),
      entities,
      migrations: [`${__dirname}/migrations/*{.js,.ts}`],
      cli: {
        entitiesDir: 'src/db/entities',
        migrationsDir: 'src/db/migrations',
        subscribersDir: 'src/db/subscribers'
      }
    } as ConnectionOptions;
  }
}
