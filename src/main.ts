import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketAdapter } from './common/adapters/socket.adapter';
import { GlobalExceptionFilter } from './common/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const conigService = app.get(ConfigService);
  app.enableCors();
  app.useWebSocketAdapter(new SocketAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      // transform: true,
      // forbidUnknownValues: true,
      // whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(conigService.get('PORT'));
}
bootstrap();
