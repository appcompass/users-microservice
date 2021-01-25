import { Logger, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { DBConfigService, entities } from '../db/db-config.service';
import { MessagingModule } from '../messaging/messaging.module';
import { AuthController } from './controllers/auth.controller';
import { InterServiceController } from './controllers/inter-service.controller';
import { UsersController } from './controllers/users.controller';
import { PasswordResetService } from './services/password-reset.service';
import { UserService } from './services/user.service';
import { UsersService } from './services/users.service';
import { OrderQueryValidator } from './validators/order-query-string.validator';
import { RegistrationCodeValidator } from './validators/registration-code.validator';
import { SameAsValidator } from './validators/same-as.validator';
import { EmailUsedValidator } from './validators/unique-email.validator';

@Module({
  imports: [TypeOrmModule.forFeature(entities), MessagingModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController, UsersController, InterServiceController],
  providers: [
    JwtStrategy,
    DBConfigService,
    UserService,
    PasswordResetService,
    UsersService,
    EmailUsedValidator,
    SameAsValidator,
    OrderQueryValidator,
    RegistrationCodeValidator,
    Logger
  ],
  exports: [TypeOrmModule, UserService, PasswordResetService, UsersService]
})
export class UsersModule {}
