import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend access
  app.enableCors();

  // Global API prefix
  app.setGlobalPrefix('api');

  // Enable validation pipes for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Changed to false to allow extra fields (ESP-01 might send extra data)
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // Automatically convert string numbers to numbers
      },
      // Better error messages for debugging
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = Object.values(error.constraints || {});
          return `${error.property}: ${constraints.join(', ')}`;
        });
        console.error('❌ Validation Error:', messages.join('; '));
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  await app.listen(3000);
  console.log(
    '🚀 Fuel Pump Management System API running on http://localhost:3000/api',
  );
}
bootstrap();
