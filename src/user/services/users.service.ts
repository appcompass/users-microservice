import { Connection, FindConditions, FindManyOptions, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly connection: Connection,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findAll(options?: FindManyOptions<User>): Promise<User[]> {
    return await this.userRepository.find(options);
  }

  async findBy(conditions: FindConditions<User>) {
    return await this.userRepository.findOne(conditions);
  }

  async save(data: Partial<User>) {
    return await this.userRepository.save(data);
  }

  async create(data: Partial<User>) {
    return await this.connection.transaction(async (entityManager) => await entityManager.insert(User, data));
  }

  async update(id: number, data: Partial<User>) {
    const { affected } = await this.connection.transaction(
      async (entityManager) =>
        await entityManager.createQueryBuilder().update(User).set(data).where('id = :id', { id }).execute()
    );
    return { affected };
  }

  async delete(id: number) {
    const { affected } = await this.connection.transaction(
      async (entityManager) =>
        await entityManager.createQueryBuilder().delete().from(User).where('id = :id', { id }).execute()
    );

    return { affected };
  }
}
