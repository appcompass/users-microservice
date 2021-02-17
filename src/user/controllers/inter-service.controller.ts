import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

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

  @MessagePattern('users.user.find-by')
  async findBy(@Payload() payload) {
    const user = await this.usersService.findBy(payload);
    return { ...user };
  }

  @MessagePattern('users.user.update')
  async updateMessage(@Payload() payload: UpdateUserPrivateDto) {
    const { id, ...data } = payload;
    return await this.userService.updateUser(id, data);
  }

  @MessagePattern('users.confirmation.register.roles')
  handleEventConfirmations(@Payload() payload: boolean) {
    return payload
      ? this.logger.log('Service Roles registered successfully')
      : this.logger.error('Service Roles not registered successfully');
  }
}
