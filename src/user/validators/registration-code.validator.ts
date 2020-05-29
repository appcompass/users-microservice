import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';

import { Injectable } from '@nestjs/common';

import { UsersService } from '../services/users.service';

@ValidatorConstraint({ name: 'isRegistrationCode', async: true })
@Injectable()
export class RegistrationCodeValidator implements ValidatorConstraintInterface {
  constructor(protected readonly usersService: UsersService) {}
  async validate(activationCode: string) {
    const user = await this.usersService.findBy({ activationCode });
    return !!user;
  }

  defaultMessage() {
    return 'Activation code not valid.';
  }
}

export function IsRegistrationCode(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsRegistrationCode',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: RegistrationCodeValidator
    });
  };
}
