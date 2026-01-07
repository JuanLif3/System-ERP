// apps/api/src/app/modules/companies/companies.service.ts
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    try {
      // 1. Crear la instancia (no guarda todavía)
      const company = this.companyRepository.create(createCompanyDto);
      
      // 2. Guardar en DB
      // NOTA: Aquí falta la lógica para crear el usuario ADMIN. 
      // Lo haremos al configurar el módulo Users para usar transacciones.
      await this.companyRepository.save(company);

      return {
        message: 'Pyme creada exitosamente',
        company,
      };

    } catch (error: any) { // Tipado any temporal para capturar errores de DB
      this.handleDBErrors(error);
    }
  }

  // --- Helpers ---
  
  findAll() {
    return this.companyRepository.find();
  }

  findOne(id: string) {
    return this.companyRepository.findOneBy({ id });
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return this.companyRepository.update(id, updateCompanyDto);
  }

  remove(id: string) {
    return this.companyRepository.delete(id);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') { // Código PostgreSQL para Unique Constraint Violation
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}