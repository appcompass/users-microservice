import { IsEmail, IsNotEmpty } from 'class-validator';

import { IsSameAs } from '../validators/same-as.validator';
import { IsEmailUsed } from '../validators/unique-email.validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsEmailUsed(true)
  readonly email: string;

  @IsNotEmpty()
  @IsSameAs('email')
  readonly email_confirm: string;
}
