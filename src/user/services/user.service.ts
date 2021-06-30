import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as moment from 'moment';
import { EntityManager } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { MessagingService } from '../../messaging/messaging.service';
import { User } from '../../user/entities/user.entity';
import { RegisterUserDto } from '../dto/auth-register.dto';
import { ResetPasswordDto } from '../dto/auth-reset-password.dto';
import { UpdateUserPrivateDto, UpdateUserPublicDto } from '../dto/user-update.dto';
import { PasswordResetService } from './password-reset.service';
import { UsersService } from './users.service';

@Injectable()
export class UserService {
  private saltRounds = 10;
  passport;
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetService: PasswordResetService,
    private readonly messagingService: MessagingService
  ) {}

  createHash(from: string) {
    return crypto.createHash('sha256').update(from).digest('hex');
  }

  async register(manager: EntityManager, data: RegisterUserDto) {
    const activationCode = this.createHash(data.email);
    const password = await this.setPassword(data.password);
    const email = data.email.toLowerCase();
    const { generatedMaps } = await this.usersService.create(manager, {
      email,
      password,
      activationCode
    });
    const [{ id }] = generatedMaps;
    const userId: number = id;
    return { activationCode, userId, email };
  }

  randomPassword(length: number = 16) {
    return crypto.randomBytes(length).toString('hex');
  }

  async setPassword(password: string): Promise<string> {
    return bcrypt.hashSync(password, this.saltRounds);
  }

  async confirmRegistration(manager: EntityManager, activationCode: string) {
    try {
      const user = await this.usersService.findBy(manager, { activationCode });
      const { affected } = await this.usersService.update(manager, user.id, {
        active: true,
        activatedAt: moment(),
        activationCode: ''
      });
      return { confirmation: !!affected };
    } catch (error) {
      return { confirmation: false };
    }
  }

  async forgotPassword(manager: EntityManager, email: string) {
    try {
      const user = await this.usersService.findBy(manager, { email });
      if (!user) return null;
      const hashKey = `${user.email}-${moment().toISOString()}`;
      const code = this.createHash(hashKey);
      await this.passwordResetService.create(manager, {
        code,
        user: user
      });
      await this.messagingService.emitAsync('users.user.forgot-password', { code, user });
      return { sentEmail: true };
    } catch (error) {
      return { sentEmail: false };
    }
  }

  async resetPassword(manager: EntityManager, { code, password }: Omit<ResetPasswordDto, 'passwordConfirm'>) {
    const passwordReset = await this.passwordResetService.findBy(manager, { code });
    if (!passwordReset?.userId) return null;

    const id = passwordReset.userId;

    const { affected } = await this.usersService.update(manager, id, {
      password: await this.setPassword(password)
    });
    await this.messagingService.emitAsync('authentication.user.logout', { id });
    await this.passwordResetService.update(manager, passwordReset.id, {
      used: true
    });
    return { passwordReset: !!affected };
  }

  async validateUser(manager: EntityManager, email: string, pass: string): Promise<User | null> {
    try {
      const user = await this.usersService.findBy(manager, { email, active: true });
      if (!user) return null;
      if (bcrypt.compareSync(pass, user.password)) return user;
    } catch (error) {
      return null;
    }
  }

  async updateUser(manager: EntityManager, id: number, payload: UpdateUserPublicDto | UpdateUserPrivateDto) {
    const { password, ...data } = payload;

    if (password) data['password'] = await this.setPassword(payload.password);
    return await this.usersService.update(manager, id, data);
  }
}
