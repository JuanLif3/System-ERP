import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // --- LISTA DE DOMINIOS PERMITIDOS ---
  // Aquí definimos quién tiene llave para entrar a tu casa
  const allowedOrigins = [
    'http://localhost:4200',        // Desarrollo Angular/React
    'http://localhost:5173',        // Desarrollo Vite
    'https://nortedev.cl',          // <--- TU DOMINIO OFICIAL
    'https://www.nortedev.cl',      // <--- TU DOMINIO CON WWW
    process.env.FRONTEND_URL,       // La URL de Vercel original (system-erp...)
  ];

  // --- CONFIGURACIÓN CORS INTELIGENTE ---
  app.enableCors({
    origin: (origin, callback) => {
      // 1. Permitir solicitudes sin origen (ej: Postman o llamadas servidor a servidor)
      if (!origin) return callback(null, true);

      // 2. Verificar si el origen está en la lista blanca
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // 3. Si no está, lo bloqueamos y avisamos en el log (útil para debug en Railway)
        Logger.warn(`⛔ Bloqueado por CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
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
  // Imprimimos en consola los dominios aceptados para que estés seguro al iniciar
  Logger.log(`🔓 Orígenes permitidos: ${allowedOrigins.filter(o => o).join(', ')}`);
}

bootstrap();