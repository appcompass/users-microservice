import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../../auth/decorators/permissions.decorator';
import { FilterListQuery } from '../dto/filter-list.dto';
import { CreateUserPayload } from '../dto/user-create.dto';
import { UpdateUserPrivateDto, UpdateUserPublicDto } from '../dto/user-update.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService, private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard())
  @Post()
  @Permissions('users.user.create')
  async create(@Body() payload: CreateUserPayload) {
    return this.usersService.create(payload);
  }

  @UseGuards(AuthGuard())
  @Get()
  @Permissions('users.user.read')
  async list(@Query() query: FilterListQuery<User>) {
    const { skip, take, order } = query;
    const options = {
      skip: +skip,
      take: +take,
      order
    };
    return this.usersService.findAll(options);
  }

  @UseGuards(AuthGuard())
  @Put(':id')
  @Permissions('users.user.update')
  async updateRequest(@Param('id') id: number, @Body() payload: UpdateUserPublicDto) {
    return await this.updateUser(id, payload);
  }

  @UseGuards(AuthGuard())
  @Delete(':id')
  @Permissions('users.user.delete')
  async delete(@Param('id') id: number) {
    return this.usersService.delete(id);
  }

  @MessagePattern('users.user.find-by')
  async findBy(@Payload() payload) {
    return await this.usersService.findBy(payload);
  }

  @MessagePattern('users.user.update')
  async updateMessage(@Payload() payload: UpdateUserPrivateDto) {
    const { id, ...data } = payload;
    return await this.updateUser(id, data);
  }

  private async updateUser(id: number, payload: UpdateUserPublicDto | UpdateUserPrivateDto) {
    const { password, ...data } = payload;

    if (password) data['password'] = await this.userService.setPassword(payload.password);
    return await this.usersService.update(id, data);
  }
}
