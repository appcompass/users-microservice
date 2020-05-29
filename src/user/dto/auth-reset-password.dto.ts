import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { IsSameAs } from '../validators/same-as.validator';
import { IsEmailUsed } from '../validators/unique-email.validator';

export class ResetPasswordDto {
  @IsString()
  readonly code: string;

  @IsEmail()
  @IsEmailUsed(true)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @IsSameAs('password')
  readonly password_confirm: string;
}
