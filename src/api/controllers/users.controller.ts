import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { getConnection } from 'typeorm';

import {
  Body,
  ConsoleLogger,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';

import { Permissions } from '../../auth/decorators/permissions.decorator';
import { unauthorizedResponseOptions, unprocessableEntityResponseOptions } from '../api.contract-shapes';
import { OrderQuery } from '../api.types';
import { CreateUserPayload } from '../dto/user-create.dto';
import { UpdateUserPublicDto } from '../dto/user-update.dto';
import { User } from '../entities/user.entity';
import { NoEmptyPayloadPipe } from '../pipes/no-empty-payload.pipe';
import { QueryOrderPipe } from '../pipes/query-order.pipe';
import { UserService } from '../services/user.service';
import { UsersService } from '../services/users.service';

@Controller('v1/users')
@ApiBearerAuth()
@ApiUnauthorizedResponse(unauthorizedResponseOptions)
@ApiUnprocessableEntityResponse(unprocessableEntityResponseOptions)
export class UsersController {
  constructor(
    private readonly logger: ConsoleLogger,
    private readonly userService: UserService,
    private readonly usersService: UsersService
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @UseGuards(AuthGuard(), PermissionsGuard)
  @Post()
  @Permissions('users.user.create')
  async create(@Body() payload: CreateUserPayload) {
    const password = await this.userService.setPassword(payload.password);
    const data = {
      ...payload,
      password,
      activationCode: '',
      active: true
    };
    return await getConnection().transaction(async (manager) => {
      const { generatedMaps } = await this.usersService.create(manager, data);
      const [{ id }] = generatedMaps;

      return await this.usersService.findBy(manager, { id });
    });
  }

  @UseGuards(AuthGuard(), PermissionsGuard)
  @Get()
  @Permissions('users.user.read')
  async list(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(20), ParseIntPipe) take: number,
    @Query('order', new DefaultValuePipe(''), QueryOrderPipe) order: OrderQuery<User>,
    @Query('filter', new DefaultValuePipe('')) filter?: string
  ) {
    return await getConnection().transaction(async (manager) => {
      try {
        const { data, total } = await this.usersService.findAll(manager, { skip, take, order, filter });
        return {
          data,
          pagination: {
            total,
            skip,
            take
          }
        };
      } catch (error) {
        throw new UnprocessableEntityException(error.message);
      }
    });
  }

  @UseGuards(AuthGuard(), PermissionsGuard)
  @Put(':id')
  @Permissions('users.user.update')
  async updateRequest(@Param('id') id: number, @Body(new NoEmptyPayloadPipe()) payload: UpdateUserPublicDto) {
    return await getConnection().transaction(async (manager) => {
      return await this.userService.updateUser(manager, id, payload);
    });
  }

  @UseGuards(AuthGuard(), PermissionsGuard)
  @Delete(':id')
  @Permissions('users.user.delete')
  async delete(@Param('id') id: number) {
    return await getConnection().transaction(async (manager) => {
      return await this.usersService.delete(manager, id);
    });
  }
}
