import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as moment from 'moment';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '../../config/config.service';
import { MessagingService } from '../../messaging/messaging.service';
import { User } from '../../user/entities/user.entity';
import { RegisterUserDto } from '../dto/auth-register.dto';
import { ResetPasswordDto } from '../dto/auth-reset-password.dto';
import { PasswordResetService } from './password-reset.service';
import { UsersService } from './users.service';

@Injectable()
export class UserService {
  private saltRounds = 10;
  passport;
  constructor(
    private readonly configService: ConfigService,
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
    await this.usersService.create({
      email,
      password,
      activationCode
    });
    await this.sendRegistrationEmail(email, activationCode);

    return { sentEmail: true };
  }

  async sendRegistrationEmail(recipient: string, activationCode: string) {
    const confirmationLink = this.getConfirmationLink(activationCode);

    return await this.messagingService.sendAsync<boolean, any>('notifier.send.email', {
      recipient,
      subject: 'Confirm Registration',
      body: [
        {
          text: 'Thank you for registering!'
        },
        {
          text: 'Please use the following link to confirm your email address:'
        },
        {
          text: confirmationLink,
          link: confirmationLink
        }
      ]
    });
  }

  async setPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  private getConfirmationLink(activationCode: string) {
    // TODO: update this to get this value from the UI service.
    const baseUrl = this.configService.get('PUBLIC_BASE_URL');

    return `${baseUrl}/confirm-registration?code=${activationCode}`;
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
    // TODO: this.sendPasswordResetConfirmationEmail(code, email);
    return { sentEmail: true };
  }

  async resetPassword({ code, password }: Omit<ResetPasswordDto, 'password_confirm'>) {
    const passwordReset = await this.passwordResetService.findBy({ code });
    if (!passwordReset) return null;

    const { affected } = await this.usersService.update(passwordReset.userId, {
      password: await this.setPassword(password)
    });

    return { passwordReset: !!affected };
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findBy({ email, active: true });
    if (!user) return null;
    if (await bcrypt.compare(pass, user.password)) return user;
  }
}
