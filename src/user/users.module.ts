import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DBConfigService, entities } from '../db/db-config.service';
import { MessagingModule } from '../messaging/messaging.module';
import { AuthController } from './controllers/auth.controller';
import { UsersController } from './controllers/users.controller';
import { PermissionsService } from './services/permissions.service';
import { RolesService } from './services/roles.service';
import { UserService } from './services/user.service';
import { UsersService } from './services/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OrderQueryValidator } from './validators/order-query-string.validator';
import { RegistrationCodeValidator } from './validators/registration-code.validator';
import { SameAsValidator } from './validators/same-as.validator';
import { EmailUsedValidator } from './validators/unique-email.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    MessagingModule,
    PassportModule.register({ defaultStrategy: 'jwt' })
    // JwtModule.registerAsync({
    //   imports: [MessagingService],
    //   useFactory: async (messagingService: MessagingService) => {
    //     const key = await messagingService.sendAsync<string, boolean>('authentication.public-key', true);
    //     return {
    //       verifyOptions: ''
    //     // secretOrKeyProvider: (requestType, tokenOrPayload) => {
    //     //   console.log(requestType, tokenOrPayload);
    //     //   switch (requestType) {
    //     //     case JwtSecretRequestType.SIGN:
    //     //       throw Error('this service is not able to sign tokens!');
    //     //     case JwtSecretRequestType.VERIFY:
    //     //       return await messagingService.sendAsync<string, boolean>('authentication.public-key', true);
    //     //     default:
    //     //       throw Error('trying to do something else?');
    //     //   }
    //     // }
    //     }
    // }
  ],
  controllers: [AuthController, UsersController],
  providers: [
    // {
    //   provide: JwtService,
    //   useFactory: async (messagingService: MessagingService) => ({
    //     verifyOptions:
    //   })
    //     await messagingService.sendAsync<string, boolean>('authentication.public-key', true),
    //   inject: [MessagingService]
    // },
    JwtStrategy,
    DBConfigService,
    UserService,
    PermissionsService,
    RolesService,
    UsersService,
    EmailUsedValidator,
    SameAsValidator,
    OrderQueryValidator,
    RegistrationCodeValidator
  ],
  exports: [TypeOrmModule, UserService, UsersService, PermissionsService, RolesService]
})
export class UsersModule {}
