import { Module, Sse } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './modules/orders/orders.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { FinanceModule } from './modules/finance/finance.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as Joi from 'joi';
import { join } from 'path';
import { CloudinaryProvider } from './modules/cloudinary/cloudinary.provider';
import { CloudinaryService } from './modules/cloudinary/cloudinary.service';

@Module({
  imports: [

    // 1. Configura cion de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, // Disponible para toda la app sin re-importar
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
      }),
    }),

    // 2. Configuracion asincrona de base de datos (TypeORM + NeonDB)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true, // Carga automática de entidades en los módulos
        synchronize: configService.get<string>('NODE_ENV') === 'development', // ¡CUIDADO! True solo en dev. Crea tablas automáticamente.
        ssl: true, 
          extra: {
            ssl: {
              rejectUnauthorized: false, // Necesario para algunas configuraciones de Neon/AWS
          },
        },
      }),
    }),
    ServeStaticModule.forRoot({
      // Usamos process.cwd() para asegurar que busque en la raíz del proyecto (donde creaste la carpeta)
      // y no en la carpeta 'dist' compilada.
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads',
    }),
    

    OrdersModule,
    AuthModule,
    CategoriesModule,
    CompaniesModule,
    ExpensesModule,
    FinanceModule,
    ProductsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService]
})
export class AppModule {}
