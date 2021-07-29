import { IsNotEmpty, IsString } from 'class-validator';

import { ResetPasswordCodeNotUsed } from '../validators/reset-password-code-not-used';
import { IsSameAs } from '../validators/same-as.validator';

export class ResetPasswordDto {
  @IsString()
  @ResetPasswordCodeNotUsed()
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @IsSameAs('password')
  readonly passwordConfirm: string;
}
