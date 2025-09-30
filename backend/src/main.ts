import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import helmet from 'helmet';

async function bootstrap() {
  try {
    console.log('🚀 Starting Golden Horse Shipping API...');
    console.log('📦 Creating NestJS application...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    console.log('✅ NestJS application created successfully');

    // Verify database connection before proceeding
    console.log('🔍 Verifying database connection...');
    try {
      const dataSource = app.get(DataSource);
      if (!dataSource.isInitialized) {
        console.log('⚠️ DataSource not initialized, attempting to initialize...');
        await dataSource.initialize();
      }
      
      // Test the connection with a simple query
      await dataSource.query('SELECT 1');
      console.log('✅ Database connection verified successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      throw new Error(`Database connection verification failed: ${dbError.message}`);
    }

    // Enable CORS (restrict in production)
    // Security headers
    console.log('🔒 Configuring security headers...');
    app.use(helmet({
      // In dev, disable CSP to avoid blocking swagger/assets; in prod use defaults
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      // Allow serving uploads to be displayed on the frontend (potentially different origin)
      crossOriginResourcePolicy: false,
    }));

    const isProd = process.env.NODE_ENV === 'production';
    console.log(`🌍 Environment: ${isProd ? 'production' : 'development'}`);
    
    console.log('🔗 Configuring CORS...');
    app.enableCors({
      origin: isProd
        ? (process.env.COOLIFY_URL ? [process.env.COOLIFY_URL] : true)
        : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Global validation pipe
    console.log('✅ Setting up global validation pipe...');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // API prefix
    console.log('🔧 Setting global API prefix...');
    app.setGlobalPrefix('api');

    // Swagger documentation (disabled in production)
    if (!isProd) {
      console.log('📚 Setting up Swagger documentation...');
      const config = new DocumentBuilder()
        .setTitle('Golden Horse Shipping API')
        .setDescription('API documentation for Golden Horse Shipping system')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
      console.log('✅ Swagger documentation configured');
    }

    const port = process.env.PORT || 3001;
    const host = '0.0.0.0'; // Bind to all interfaces for Docker compatibility
    
    console.log(`🌐 Attempting to bind to ${host}:${port}...`);
    
    // Add timeout for app.listen to prevent hanging
    const listenPromise = app.listen(port, host);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Server startup timeout after 30 seconds')), 30000);
    });

    await Promise.race([listenPromise, timeoutPromise]);

    console.log(`🚀 Golden Horse Shipping API is running on: http://${host}:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`💚 Health Check: http://localhost:${port}/api/health`);
    console.log('✅ Server startup completed successfully!');

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

// Add graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

bootstrap().catch((error) => {
  console.error('💥 Bootstrap failed:', error);
  process.exit(1);
});
