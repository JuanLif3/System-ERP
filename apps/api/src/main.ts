import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // --- CORRECCIÓN CORS PARA PRODUCCIÓN ---
  app.enableCors({
    // Aceptamos la URL que venga en variables de entorno O localhost (para que sigas desarrollando)
    origin: [
      'http://localhost:4200',
      'http://localhost:5173', // Por si usas Vite en local
      process.env.FRONTEND_URL || '*', // La URL de Vercel (la pondremos luego en Render)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }) 
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();