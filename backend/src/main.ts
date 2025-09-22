import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (restrict in production)
  // Security headers
  app.use(helmet({
    // In dev, disable CSP to avoid blocking swagger/assets; in prod use defaults
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    // Allow serving uploads to be displayed on the frontend (potentially different origin)
    crossOriginResourcePolicy: false,
  }));

  const isProd = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: isProd
      ? (process.env.COOLIFY_URL ? [process.env.COOLIFY_URL] : true)
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation (disabled in production)
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Golden Horse Shipping API')
      .setDescription('API documentation for Golden Horse Shipping system')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Golden Horse Shipping API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
