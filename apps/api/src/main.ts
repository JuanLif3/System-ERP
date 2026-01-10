import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // Asegúrate de pasar el tipo <NestExpressApplication> para que useStaticAssets funcione
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- CONFIGURACIÓN DEL PREFIJO ---
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // --- CONFIGURACIÓN DE CORS ---
  // Definimos la lista blanca de orígenes
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://nortedev.cl',          
    'https://www.nortedev.cl',
    process.env.FRONTEND_URL, // Por si lo defines en variables de entorno
  ].filter(Boolean); // Filtra valores undefined/null

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origen (ej: Postman, Apps móviles)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        Logger.warn(`⛔ Bloqueado por CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // --- ARCHIVOS ESTÁTICOS (Opcional si usas Cloudinary, pero no hace daño dejarlo) ---
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // --- VALIDACIONES GLOBALES ---
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
  Logger.log(`🔓 Orígenes permitidos: ${allowedOrigins.join(', ')}`);
}

bootstrap();