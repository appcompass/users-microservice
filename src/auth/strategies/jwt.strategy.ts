import * as moment from 'moment';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/user/services/users.service';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { MessagingService } from '../../messaging/messaging.service';
import { DecodedToken } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService, private readonly messagingService: MessagingService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: (request, rawJwtToken, done) =>
        this.messagingService
          .sendAsync<string, boolean>('authentication.public-key', true)
          .then((publicKey) => done(null, publicKey))
    });
  }

  async validate(token: DecodedToken) {
    const tokenExpiration = moment.unix(token.exp);
    const user = await this.userService.findBy({ id: token.sub });
    return !moment(user.tokenExpiration).diff(tokenExpiration) && moment().isBefore(tokenExpiration) ? token : false;
  }
}
