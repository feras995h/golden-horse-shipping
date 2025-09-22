const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function bootstrap() {
  try {
    console.log('Starting NestJS application...');
    const app = await NestFactory.create(AppModule);
    
    console.log('Setting up CORS...');
    app.enableCors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    console.log('Setting global prefix...');
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3001;
    console.log(`Attempting to listen on port ${port}...`);
    await app.listen(port);

    console.log(`🚀 Golden Horse Shipping API is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
}

bootstrap();
