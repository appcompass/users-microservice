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

import { Permissions } from '../../auth/decorators/permissions.decorator';
import { FilterListQuery } from '../dto/filter-list.dto';
import { CreateUserPayload } from '../dto/user-create.dto';
import { UpdateUserPublicDto } from '../dto/user-update.dto';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { UsersService } from '../services/users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly usersService: UsersService
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @UseGuards(AuthGuard())
  @Post('users')
  @Permissions('users.user.create')
  async create(@Body() payload: CreateUserPayload) {
    return await this.usersService.create(payload);
  }

  @UseGuards(AuthGuard())
  @Get('users')
  @Permissions('users.user.read')
  async list(@Query() query: FilterListQuery<User>) {
    const { skip, take, order } = query;
    const options = {
      skip: +skip,
      take: +take,
      order
    };
    try {
      return await this.usersService.findAll(options);
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  @UseGuards(AuthGuard())
  @Put('users/:id')
  @Permissions('users.user.update')
  async updateRequest(@Param('id') id: number, @Body() payload: UpdateUserPublicDto) {
    return await this.userService.updateUser(id, payload);
  }

  @UseGuards(AuthGuard())
  @Delete('users/:id')
  @Permissions('users.user.delete')
  async delete(@Param('id') id: number) {
    return await this.usersService.delete(id);
  }
}
