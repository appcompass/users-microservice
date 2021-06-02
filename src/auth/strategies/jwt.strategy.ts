import * as moment from 'moment';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getManager } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ConfigService } from '../../config/config.service';
import { UsersService } from '../../user/services/users.service';
import { DecodedToken } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly userService: UsersService, readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('publicKey')
    });
  }

  async validate(token: DecodedToken) {
    const tokenExpiration = moment.unix(token.exp);
    const user = await getManager().transaction(
      async (manager) => await this.userService.findBy(manager, { id: token.sub })
    );
    return !moment(user.tokenExpiration).diff(tokenExpiration) && moment().isBefore(tokenExpiration) ? token : false;
  }
}
