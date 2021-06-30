import { EntityManager, FindConditions } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { PasswordReset } from '../entities/password-reset.entity';

@Injectable()
export class PasswordResetService {
  async findBy(manager: EntityManager, conditions: FindConditions<PasswordReset>) {
    return await manager.getRepository(PasswordReset).findOne(conditions);
  }

  async create(manager: EntityManager, data: Partial<PasswordReset>) {
    return await manager.insert(PasswordReset, data);
  }

  async update(manager: EntityManager, id: number, data: Partial<PasswordReset>) {
    const { affected } = await manager
      .createQueryBuilder()
      .update(PasswordReset)
      .set(data)
      .where('id = :id', { id })
      .execute();
    return { affected };
  }

  async delete(manager: EntityManager, id: number) {
    const { affected } = await manager
      .createQueryBuilder()
      .delete()
      .from(PasswordReset)
      .where('id = :id', { id })
      .execute();
    return { affected };
  }
}
