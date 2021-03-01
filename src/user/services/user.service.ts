import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as moment from 'moment';

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

  async register(data: RegisterUserDto) {
    const activationCode = this.createHash(data.email);
    const password = await this.setPassword(data.password);
    const email = data.email;
    const { identifiers } = await this.usersService.create({
      email,
      password,
      activationCode
    });
    const [identifier] = identifiers;
    const userId: number = identifier.id;
    return { activationCode, userId, email };
  }

  async setPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async confirmRegistration(activationCode: string) {
    const user = await this.usersService.findBy({ activationCode });
    const { affected } = await this.usersService.update(user.id, {
      active: true,
      activatedAt: moment(),
      activationCode: ''
    });

    return { confirmation: !!affected };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findBy({ email });
    if (!user) return null;
    const hashKey = `${user.email}-${moment().toISOString()}`;
    const code = this.createHash(hashKey);
    await this.passwordResetService.create({
      code,
      user: user
    });
    await this.messagingService.emitAsync('users.user.forgot-password', { code, user });
    return { sentEmail: true };
  }

  async resetPassword({ code, password }: Omit<ResetPasswordDto, 'password_confirm'>) {
    const passwordReset = await this.passwordResetService.findBy({ code });
    const id = passwordReset.userId;
    if (!passwordReset) return null;

    const { affected } = await this.usersService.update(id, {
      password: await this.setPassword(password)
    });
    this.messagingService.emit('authentication.user.logout', { id });
    return { passwordReset: !!affected };
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findBy({ email, active: true });
    if (!user) return null;
    if (await bcrypt.compare(pass, user.password)) return user;
  }

  async updateUser(id: number, payload: UpdateUserPublicDto | UpdateUserPrivateDto) {
    const { password, ...data } = payload;

    if (password) data['password'] = await this.setPassword(payload.password);
    return await this.usersService.update(id, data);
  }
}
