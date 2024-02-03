import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SocketAdapter } from './web-socket/socket.adapter';
import { UnauthorizedExceptionFilter } from './exception.filter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // app.useGlobalFilters(new UnauthorizedExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: [`${process.env.FRONTEND_URL}`, `${process.env.BACKEND_URL}`, "http://[::1]:3000"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useWebSocketAdapter(new SocketAdapter(app));

  await app.listen(process.env.BACKEND_PORT || 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();