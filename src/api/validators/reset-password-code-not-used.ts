import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { getManager } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { PasswordResetService } from '../services/password-reset.service';

@ValidatorConstraint({ name: 'resetPasswordCodeNotUsed', async: true })
@Injectable()
export class ResetPasswordCodeNotUsedValidator implements ValidatorConstraintInterface {
  constructor(protected readonly passwordResetService: PasswordResetService) {}
  async validate(code: string) {
    try {
      const passwordReset = await getManager().transaction(
        async (manager) => await this.passwordResetService.findBy(manager, { code, used: false })
      );
      return !!passwordReset;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `code '${args.value}' is not valid.`;
  }
}

export function ResetPasswordCodeNotUsed(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'ResetPasswordCodeNotUsed',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ResetPasswordCodeNotUsedValidator
    });
  };
}
