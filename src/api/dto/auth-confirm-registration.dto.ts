import { IsNotEmpty, IsString } from 'class-validator';

import { IsRegistrationCode } from '../validators/registration-code.validator';

export class ConfirmRegistrationDto {
  @IsString()
  @IsNotEmpty()
  @IsRegistrationCode()
  readonly code: string;
}
