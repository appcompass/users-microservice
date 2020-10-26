import { PasswordReset } from 'src/user/entities/password-reset.entity';
import { ConnectionOptions } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { Permission } from '../user/entities/permission.entity';
import { RolePermission } from '../user/entities/role-permission.entity';
import { Role } from '../user/entities/role.entity';
import { UserLogin } from '../user/entities/user-login.entity';
import { UserPermission } from '../user/entities/user-permission.entity';
import { UserRole } from '../user/entities/user-role.entity';
import { User } from '../user/entities/user.entity';
import { DBNamingStrategy } from './naming.strategy';

export const entities: Function[] = [
  User,
  PasswordReset,
  Role,
  Permission,
  UserLogin,
  UserRole,
  UserPermission,
  RolePermission
];

@Injectable()
export class DBConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return this.config;
  }

  get config() {
    return {
      logging: this.configService.get('NODE_ENV') === 'production' ? ['error', 'schema', 'warn'] : 'all',
      type: this.configService.get('DB_TYPE'),
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      username: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
      synchronize: this.configService.get('DB_SYNCHRONIZE'),
      migrationsRun: this.configService.get('DB_SYNCHRONIZE'),
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
