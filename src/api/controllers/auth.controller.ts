import { MessagingService } from 'src/messaging/messaging.service';
import { getConnection } from 'typeorm';

import { Body, ConsoleLogger, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiNotFoundResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { notFoundResponseOptions, unprocessableEntityResponseOptions } from '../api.contract-shapes';
import { ConfirmRegistrationDto } from '../dto/auth-confirm-registration.dto';
import { ForgotPasswordDto } from '../dto/auth-forgot-password.dto';
import { RegisterUserDto } from '../dto/auth-register.dto';
import { ResetPasswordDto } from '../dto/auth-reset-password.dto';
import { NoEmptyPayloadPipe } from '../pipes/no-empty-payload.pipe';
import { UserService } from '../services/user.service';

@Controller('v1')
@ApiUnprocessableEntityResponse(unprocessableEntityResponseOptions)
export class AuthController {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly userService: UserService,
    private readonly messagingService: MessagingService
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Post('register')
  async register(@Body(new NoEmptyPayloadPipe()) payload: RegisterUserDto) {
    return await getConnection().transaction(async (manager) => {
      const { activationCode, userId, email } = await this.userService.register(manager, payload);

      this.logger.log(`User '${email}' (id: '${userId}') registered successfully.  Activation Code: ${activationCode}`);

      await this.messagingService.emitAsync('users.user.registered', { userId, email, activationCode });

      return { userId };
    });
  }

  @Get('confirm-registration')
  @ApiNotFoundResponse(notFoundResponseOptions)
  async confirmRegistration(@Query() { code }: ConfirmRegistrationDto) {
    return await getConnection().transaction(async (manager) => {
      return await this.userService.confirmRegistration(manager, code);
    });
  }

  @Post('forgot-password')
  @ApiNotFoundResponse(notFoundResponseOptions)
  async forgotPassword(@Body(new NoEmptyPayloadPipe()) { email }: ForgotPasswordDto) {
    return await getConnection().transaction(async (manager) => {
      return await this.userService.forgotPassword(manager, email);
    });
  }

  @Post('reset-password')
  @ApiNotFoundResponse(notFoundResponseOptions)
  async resetPassword(@Body(new NoEmptyPayloadPipe()) { code, password }: ResetPasswordDto) {
    return await getConnection().transaction(async (manager) => {
      return await this.userService.resetPassword(manager, { code, password });
    });
  }

  @UseGuards(AuthGuard())
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
