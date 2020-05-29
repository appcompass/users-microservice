import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { IsEmailUsed } from '../validators/unique-email.validator';

export class CreateUserPayload {
  @IsEmail()
  @IsEmailUsed(false)
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
