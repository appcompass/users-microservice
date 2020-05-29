import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>
  ) {}

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async findByName(name: string): Promise<Permission | undefined> {
    return await this.permissionRepository.findOneOrFail({ name });
  }

  async create(permission: any): Promise<Permission> {
    return this.permissionRepository.save(permission);
  }
}
