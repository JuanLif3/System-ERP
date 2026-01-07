import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm'; 
import * as bcrypt from 'bcrypt'; 

import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './entities/company.entity';
import { User } from '../users/entities/user.entity';
import { UserRoles } from '../../common/enums/roles.enum';

@Injectable()
export class CompaniesService {
  logger: any;
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const { password, ...companyData } = createCompanyDto;

    // 1. Iniciar QueryRunner (Transaccion)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Crear la pyme
      // Usamos queryRunner.manager para que la operación
      const newCompany = queryRunner.manager.create(Company, {
        ...companyData,
    });
    const savedCompany = await queryRunner.manager.save(newCompany);

    // 3. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Crear el usuario admin vinculado a la pyme
    const adminUser = queryRunner.manager.create(User, {
      fullName: `Admin ${companyData.name}`, // Nombre por defecto
      email: savedCompany.email, // Usamos el email de la pyme
      password: hashedPassword,
      roles: UserRoles.ADMIN,
      company: savedCompany, // <--- Vinculación clave
    });

    await queryRunner.manager.save(adminUser);
    
    // 5. Configurar transacción (Commit)
    await queryRunner.commitTransaction();

    return {
      message: 'Pyme y usuario admin creados exitosamente',
      company: savedCompany,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
      },
    };

  } catch (error) {
      // 6. En caso de error, rollback
      await queryRunner.rollbackTransaction();
      this.handleDBErrors(error);
    } finally {
      // 7. Liberar el queryRunner
      await queryRunner.release();
    }
  }

  // Solo asegúrate que handleDBErrors tenga el logger si quieres logs bonitos
  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error); // Log en servidor
    throw new InternalServerErrorException('Please check server logs');
  }
  
  // Agrega implementaciones vacías/simples de los otros métodos si se borraron,
  // para que no de error de compilación
  findAll() { return this.companyRepository.find(); }
  findOne(id: string) { return this.companyRepository.findOneBy({ id }); }
  update(id: string, updateDto: any) { return this.companyRepository.update(id, updateDto); }
  remove(id: string) { return this.companyRepository.delete(id); }
}