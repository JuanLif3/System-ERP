import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm'; // <--- Importante para transacciones
import { Company } from './entities/company.entity';
import { User } from '../users/entities/user.entity';
import { CreateCompanySaasDto } from './dto/create-company-saas.dto';
import { UserRoles } from '../../common/enums/roles.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(private readonly dataSource: DataSource) {}

  async createCompanySaaS(dto: CreateCompanySaasDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear la Empresa
      const newCompany = queryRunner.manager.create(Company, {
        name: dto.companyName,
        rut: dto.companyRUT,
        address: 'Dirección pendiente', // Placeholder
        // --- AGREGAMOS ESTOS CAMPOS FALTANTES ---
        phone: dto.companyPhone,
        email: dto.ownerEmail,  // Usamos el mismo correo del dueño para la empresa
        isActive: true
      });
      
      const savedCompany = await queryRunner.manager.save(newCompany);
      // 2. Crear el Usuario Dueño (Vinculado a la empresa)
      const hashedPassword = await bcrypt.hash(dto.ownerPassword, 10);
      
      const newOwner = queryRunner.manager.create(User, {
        fullName: dto.ownerFullName,
        email: dto.ownerEmail,
        password: hashedPassword,
        roles: UserRoles.ADMIN, // Es Admin de SU empresa
        company: savedCompany,  // <--- AQUÍ ESTÁ EL AISLAMIENTO
        isActive: true
      });
      
      await queryRunner.manager.save(newOwner);

      // 3. Confirmar todo
      await queryRunner.commitTransaction();

      return {
        message: 'Pyme creada exitosamente',
        company: savedCompany,
        owner: { email: newOwner.email, name: newOwner.fullName }
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Manejo básico de errores (ej: email duplicado)
      if (error.code === '23505') throw new BadRequestException('El email o RUT ya existe');
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return await this.dataSource.getRepository(Company).find({
      order: { createdAt: 'DESC' } // Las más nuevas primero
    });
  }

  // Alternar estado
  async toggleStatus(id: string) {
    const company = await this.dataSource.getRepository(Company).findOneBy({ id });
    if (!company) throw new BadRequestException('Empresa no encontrada');
    
    company.isActive = !company.isActive;
    return await this.dataSource.getRepository(Company).save(company);
  }
}