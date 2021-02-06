import { LoggerOptions } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { PasswordReset } from '../user/entities/password-reset.entity';
import { UserLogin } from '../user/entities/user-login.entity';
import { User } from '../user/entities/user.entity';
import { DBNamingStrategy } from './naming.strategy';

export const entities: Function[] = [User, PasswordReset, UserLogin];

@Injectable()
export class DBConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions() {
    return this.config;
  }

  get config() {
    return {
      logging: (this.configService.get('NODE_ENV') === 'production'
        ? ['error', 'schema', 'warn']
        : 'all') as LoggerOptions,
      ...this.configService.get('db'),
      namingStrategy: new DBNamingStrategy(),
      entities,
      migrations: [`${__dirname}/migrations/*{.js,.ts}`],
      cli: {
        entitiesDir: 'src/db/entities',
        migrationsDir: 'src/db/migrations',
        subscribersDir: 'src/db/subscribers'
      }
    };
  }
}
