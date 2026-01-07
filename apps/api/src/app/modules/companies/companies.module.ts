// apps/api/src/app/modules/companies/companies.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Importante
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company } from './entities/company.entity'; // <--- Importar la entidad

@Module({
  imports: [
    // Registramos que este módulo es responsable de la entidad Company.
    // Esto crea el "Repository" y permite inyectarlo en el Service.
    TypeOrmModule.forFeature([Company]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService], // Exportamos el servicio por si otros módulos necesitan validar empresas
})
export class CompaniesModule {}