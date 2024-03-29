import { EntityManager, FindConditions } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { FilterAllQuery, ResultsAndTotal } from '../api.types';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  async findAll(manager: EntityManager, options: FilterAllQuery<User>): Promise<ResultsAndTotal<User>> {
    const { skip, take, order, filter } = options;
    const params = { filter: `%${filter}%` };
    const baseQuery = manager.createQueryBuilder().select('u').from(User, 'u');
    const query = (filter ? baseQuery.where('u.email LIKE :filter') : baseQuery).setParameters(params);
    const [data, total] = await Promise.all([query.skip(skip).take(take).orderBy(order).getMany(), query.getCount()]);
    return { data, total };
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
