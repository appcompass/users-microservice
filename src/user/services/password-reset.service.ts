import { Connection, FindConditions, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PasswordReset } from '../entities/password-reset.entity';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly connection: Connection,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>
  ) {}

  async findBy(conditions: FindConditions<PasswordReset>) {
    return await this.passwordResetRepository.findOne(conditions);
  }

  async create(data: Partial<PasswordReset>) {
    return await this.connection.transaction(async (entityManager) => await entityManager.insert(PasswordReset, data));
  }

  async delete(id: number) {
    const { affected } = await this.connection.transaction(
      async (entityManager) =>
        await entityManager.createQueryBuilder().delete().from(PasswordReset).where('id = :id', { id }).execute()
    );

    return { affected };
  }
}
