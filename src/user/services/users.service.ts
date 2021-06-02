import { EntityManager, FindConditions, FindManyOptions } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  async findAll(manager: EntityManager, options?: FindManyOptions<User>): Promise<User[]> {
    return await manager.getRepository(User).find(options);
  }

  async findBy(manager: EntityManager, conditions: FindConditions<User>) {
    return await manager.getRepository(User).findOneOrFail(conditions);
  }

  async create(manager: EntityManager, data: Partial<User>) {
    return await manager.createQueryBuilder().insert().into(User).values(data).execute();
  }

  async update(manager: EntityManager, id: number, data: Partial<User>) {
    const { affected } = await manager.createQueryBuilder().update(User).set(data).where('id = :id', { id }).execute();
    return { affected };
  }

  async delete(manager: EntityManager, id: number) {
    const { affected } = await manager.createQueryBuilder().delete().from(User).where('id = :id', { id }).execute();
    return { affected };
  }
}
