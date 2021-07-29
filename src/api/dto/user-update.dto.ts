import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import * as moment from 'moment';

import { IsEmailUsed } from '../validators/unique-email.validator';

export class UpdateUserPublicDto {
  @IsEmail()
  @IsEmailUsed(true)
  @IsOptional()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly password: string;
}

export class UpdateUserPrivateDto {
  @IsNumber()
  readonly id: number;

  @IsEmail()
  @IsEmailUsed(true)
  @IsOptional()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly password: string;

  @IsString()
  @IsOptional()
  readonly lastLogin: moment.Moment;

  @IsString()
  @IsOptional()
  readonly tokenExpiration: moment.Moment;
}
