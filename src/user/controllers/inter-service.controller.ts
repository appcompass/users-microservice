import { Body, Controller, Logger, Post } from '@nestjs/common';

import { UpdateUserPrivateDto } from '../dto/user-update.dto';
import { UserService } from '../services/user.service';
import { UsersService } from '../services/users.service';

@Controller()
export class InterServiceController {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly usersService: UsersService
  ) {
    this.logger.setContext(this.constructor.name);
  }

  // @UseGuards(AuthGuard('api'))
  @Post('users.user.find-by')
  async findBy(@Body() payload) {
    const user = await this.usersService.findBy(payload);
    return { ...user };
  }

  // @UseGuards(AuthGuard('api'))
  @Post('users.user.update')
  async updateMessage(@Body() payload: UpdateUserPrivateDto) {
    const { id, ...data } = payload;
    return await this.userService.updateUser(id, data);
  }

  // @UseGuards(AuthGuard('api'))
  @Post('users.confirmation.register.roles')
  handleEventConfirmations(@Body() payload: boolean) {
    return payload
      ? this.logger.log('Service Roles registered successfully')
      : this.logger.error('Service Roles not registered successfully');
  }
}
