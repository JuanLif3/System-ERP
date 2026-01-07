import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Configurar prefijo global (esto ya debería estar, pero verifícalo)
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 2. HABILITAR CORS (Esta es la solución)
  app.enableCors({
    origin: 'http://localhost:4200', // Permitir solo a nuestro Frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Activamos validaciones globales (Recomendación extra del arquitecto)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina datos que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían datos extra
      transform: true, // Convierte tipos automáticamente (ej: string a number en params)
    }) 
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();