import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { DBModule } from './db/db.module';
import { MessagingModule } from './messaging/messaging.module';
import { UsersModule } from './user/users.module';

@Module({
  imports: [ConfigModule, DBModule, UsersModule, MessagingModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
