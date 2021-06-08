import { useContainer } from 'class-validator';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { RedocModule, RedocOptions } from 'nestjs-redoc';

import {
  ClassSerializerInterceptor,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { MessagingConfigService } from './messaging/messaging.config';
import { MessagingService } from './messaging/messaging.service';
import { roles } from './service.data';

Error.stackTraceLimit = Infinity;

async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}

function applyValidators(app) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors: ValidationError[]) => new UnprocessableEntityException(errors, 'Validation Error')
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
}

async function addSwaggerDocs(app, configService) {
  const options = new DocumentBuilder()
    .setTitle('AppCompass Users Service')
    .setDescription('A microservice for the AppCompass Web Application Platform')
    .setVersion('1.0')
    .addTag(configService.get('npm_package_name'))
    .build();

  const document = SwaggerModule.createDocument(app, options);
  const redocOptions: RedocOptions = {
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false
  };

  await RedocModule.setup('/docs', app, document, redocOptions);
}

function applySecurity(app) {
  app.enableCors();

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    })
  );
}

async function startApp(app, configService) {
  const messagingConfigService = app.get(MessagingConfigService);

  app.connectMicroservice(messagingConfigService.eventsConfig);

  await app.startAllMicroservicesAsync();
  await app.listen(configService.get('servicePort'));
}

async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);

  applyValidators(app);
  await addSwaggerDocs(app, configService);
  applySecurity(app);

  await startApp(app, configService);

  app
    .get(MessagingService)
    .emit('authorization.register.roles', { data: roles, respondTo: 'users.confirmation.register.roles' });
}

bootstrap();
