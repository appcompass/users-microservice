import * as moment from 'moment';

import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';

import { ConfirmRegistrationDto } from '../dto/auth-confirm-registration.dto';
import { ForgotPasswordDto } from '../dto/auth-forgot-password.dto';
import { RegisterUserDto } from '../dto/auth-register.dto';
import { ResetPasswordDto } from '../dto/auth-reset-password.dto';
import { UserService } from '../services/user.service';
import { UsersService } from '../services/users.service';

@Controller()
export class AuthController {
  constructor(private readonly userService: UserService, private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() payload: RegisterUserDto) {
    return await this.userService.register(payload);
  }

  @Get('confirm-registration')
  async confirmRegistration(@Query() { code }: ConfirmRegistrationDto) {
    return await this.userService.confirmRegistration(code);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return await this.userService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() { code, password }: ResetPasswordDto) {
    return await this.userService.resetPassword({ code, password });
  }

  @UseGuards(AuthGuard())
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @MessagePattern('user.login')
  async handleUserLoginEvent(@Payload() payload) {
    const { id, decodedToken } = payload;
    const data = {
      lastLogin: moment(),
      tokenExpiration: moment.unix(decodedToken.exp)
    };

    return await this.usersService.update(id, data);
  }
}
