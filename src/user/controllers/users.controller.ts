import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { getConnection } from 'typeorm';

import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
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
import { FilterListQuery } from '../dto/filter-list.dto';
import { CreateUserPayload } from '../dto/user-create.dto';
import { UpdateUserPublicDto } from '../dto/user-update.dto';
import { User } from '../entities/user.entity';
import { NoEmptyPayloadPipe } from '../pipes/no-empty-payload.pipe';
import { UserService } from '../services/user.service';
import { UsersService } from '../services/users.service';

@Controller('v1/users')
@ApiBearerAuth()
@ApiUnauthorizedResponse(unauthorizedResponseOptions)
@ApiUnprocessableEntityResponse(unprocessableEntityResponseOptions)
export class UsersController {
  constructor(
    private readonly logger: Logger,
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
  async list(@Query() query: FilterListQuery<User>) {
    return await getConnection().transaction(async (manager) => {
      const { skip, take, order } = query;
      const options = {
        skip: +skip,
        take: +take,
        order
      };
      try {
        return await this.usersService.findAll(manager, options);
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
