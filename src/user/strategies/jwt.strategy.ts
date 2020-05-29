import * as moment from 'moment';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { MessagingService } from '../../messaging/messaging.service';
import { UsersService } from '../services/users.service';
import { DecodedToken } from '../types/token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService, private readonly messagingService: MessagingService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: async (request, rawJwtToken, done) =>
        this.messagingService
          .sendAsync<string, boolean>('authentication.public-key', true)
          .then(publicKey => done(null, publicKey))
    });
  }

  async validate(token: DecodedToken) {
    const user = await this.userService.findBy({ id: token.sub });
    if (user.tokenExpiration.isBefore(moment.unix(token.exp))) return false;

    return user;
  }
}
