import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserPayload } from '../dto/user-create.dto';
import { SortUserListQuery } from '../dto/user-list.dto';
import { UpdateUserPrivateDto, UpdateUserPublicDto } from '../dto/user-update.dto';
import { UserService } from '../services/user.service';
import { UsersService } from '../services/users.service';

@Controller()
export class UsersController {
  constructor(private readonly userService: UserService, private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard())
  @Post('users')
  async create(@Body() payload: CreateUserPayload) {
    return this.usersService.create(payload);
  }

  @UseGuards(AuthGuard())
  @Get('users')
  async list(@Query() query: SortUserListQuery) {
    const { skip, take, order } = query;
    // TODO: pull this out into a utility function. All list requests will have this option.
    const structuredOrder = order
      .split(',')
      .map((row) => row.split(':'))
      .reduce((o, [k, v]) => ((o[k.trim()] = (v || 'asc').trim()), o), {});

    const options = {
      skip: +skip,
      take: +take,
      order: structuredOrder
    };

    return this.usersService.findAll(options);
  }

  @MessagePattern('user.find-by')
  async findBy(@Payload() payload) {
    return await this.usersService.findBy(payload);
  }

  @UseGuards(AuthGuard())
  @Put('users/:id')
  async updateRequest(@Param('id') id: number, @Body() payload: UpdateUserPublicDto) {
    return await this.updateUser(id, payload);
  }

  @UseGuards(AuthGuard())
  @Delete('users/:id')
  async delete(@Param('id') id: number) {
    return this.usersService.delete(id);
  }

  @MessagePattern('user.update')
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
