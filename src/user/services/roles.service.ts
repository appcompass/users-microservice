import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Role } from '../entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find();
  }

  async findByName(name: string): Promise<Role | undefined> {
    return await this.roleRepository.findOneOrFail({ name });
  }

  async create(Role: any): Promise<Role> {
    return await this.roleRepository.save(Role);
  }
}
