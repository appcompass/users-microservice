import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';

import { Injectable } from '@nestjs/common';

import { UsersService } from '../services/users.service';

@ValidatorConstraint({ name: 'isEmailUsed', async: true })
@Injectable()
export class EmailUsedValidator implements ValidatorConstraintInterface {
  constructor(protected readonly usersService: UsersService) {}
  async validate(email: string, args: ValidationArguments) {
    const isUsedCheck = args.constraints[0];
    const user = await this.usersService.findBy({ email });
    return isUsedCheck ? !!user : !user;
  }

  defaultMessage(args: ValidationArguments) {
    return `user with email '${args.value}' already exists.`;
  }
}

export function IsEmailUsed(isUsedCheck: boolean, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsEmailUsed',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [isUsedCheck],
      options: validationOptions,
      validator: EmailUsedValidator
    });
  };
}
