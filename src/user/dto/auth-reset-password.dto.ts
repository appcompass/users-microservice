import { IsNotEmpty, IsString } from 'class-validator';

import { IsSameAs } from '../validators/same-as.validator';

export class ResetPasswordDto {
  @IsString()
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @IsSameAs('password')
  readonly password_confirm: string;
}
