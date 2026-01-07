import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Importar
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity'; // <--- Importar Entidad
import { AuthModule } from '../auth/auth.module'; // <--- Importar AuthModule (para los decoradores de seguridad)

@Module({
  imports: [
    // Registramos la entidad para que TypeORM inyecte el repositorio
    TypeOrmModule.forFeature([Category]),
    AuthModule, 
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}