import { getConnection } from 'typeorm';

import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { ConfirmRegistrationDto } from '../dto/auth-confirm-registration.dto';
import { ForgotPasswordDto } from '../dto/auth-forgot-password.dto';
import { RegisterUserDto } from '../dto/auth-register.dto';
import { ResetPasswordDto } from '../dto/auth-reset-password.dto';
import { UpdateUserPrivateDto } from '../dto/user-update.dto';
import { UserService } from '../services/user.service';
import { UsersService } from '../services/users.service';

@Controller()
export class InterServiceController {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly usersService: UsersService
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @MessagePattern('users.user.find-or-create-by-email')
  async findOrCreateUser(@Payload() email: string) {
    return await getConnection().transaction(async (manager) => {
      try {
        return await this.usersService.findBy(manager, { email });
      } catch (error) {
        const password = await this.userService.setPassword(this.userService.randomPassword());
        const data = {
          email,
          password,
          activationCode: '',
          active: true
        };
        const { generatedMaps } = await this.usersService.create(manager, data);
        const [{ id }] = generatedMaps;
        return await this.usersService.findBy(manager, { id });
      }
    });
  }

  @MessagePattern('users.user.register')
  async register(@Payload() payload: RegisterUserDto) {
    return await getConnection().transaction(async (manager) => {
      const { activationCode, userId, email } = await this.userService.register(manager, payload);

      this.logger.log(`User '${email}' registered successfully.  Activation Code: ${activationCode}`);

      return { activationCode, userId, email };
    });
  }

  @MessagePattern('users.user.confirm-registration')
  async confirmRegistration(@Payload() { code }: ConfirmRegistrationDto) {
    return await getConnection().transaction(async (manager) => {
      return await this.userService.confirmRegistration(manager, code);
    });
  }

  @MessagePattern('users.user.forgot-password')
  async forgotPassword(@Payload() { email }: ForgotPasswordDto) {
    return await getConnection().transaction(async (manager) => {
      return await this.userService.forgotPassword(manager, email);
    });
  }

  @MessagePattern('users.user.reset-password')
  async resetPassword(@Payload() { code, password }: ResetPasswordDto) {
    return await getConnection().transaction(async (manager) => {
      return await this.userService.resetPassword(manager, { code, password });
    });
  }

  @MessagePattern('users.user.find-by')
  async findBy(@Payload() payload) {
    return await getConnection().transaction(async (manager) => {
      try {
        const user = await this.usersService.findBy(manager, payload);
        return { ...user };
      } catch (error) {
        return null;
      }
    });
  }

  @MessagePattern('users.user.update')
  async updateUser(@Payload() payload: UpdateUserPrivateDto) {
    const { id, ...data } = payload;
    return await getConnection().transaction(async (manager) => {
      return await this.userService.updateUser(manager, id, data);
    });
  }

  @MessagePattern('users.confirmation.register.roles')
  handleEventConfirmations(@Payload() payload: boolean) {
    return payload
      ? this.logger.log('Service Roles registered successfully')
      : this.logger.error('Service Roles not registered successfully');
  }
}
