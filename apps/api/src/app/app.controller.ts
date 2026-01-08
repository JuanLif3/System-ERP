import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './modules/users/entities/user.entity';
import { Company } from './modules/companies/entities/company.entity';
import { UserRoles } from './common/enums/roles.enum';

@Controller()
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('setup-saas') // <--- Esta es la ruta mágica
  async createSuperAdmin() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar si ya existe
      const existingAdmin = await queryRunner.manager.findOne(User, { 
        where: { email: 'superadmin@saas.com' } 
      });
      
      if (existingAdmin) {
        return { message: 'El Super Admin ya existe. No es necesario ejecutar esto.' };
      }

      // 2. Crear la Empresa Matriz (SaaS Host)
      const saasCompany = queryRunner.manager.create(Company, {
        name: 'SaaS Platform Host',
        rut: '99.999.999-9',
        address: 'Nube de Internet',
        phone: '+56900000000', // <--- AGREGAR ESTO
        email: 'contacto@saas.com' // <--- AGREGAR ESTO (por si también es obligatorio)
      });
      
      const savedCompany = await queryRunner.manager.save(saasCompany);

      // 3. Crear al Super Admin
      const hashedPassword = await bcrypt.hash('admin123456', 10); // <--- CONTRASEÑA POR DEFECTO
      
      const superAdmin = queryRunner.manager.create(User, {
        fullName: 'Super Administrator',
        email: 'superadmin@saas.com', // <--- CORREO DE ACCESO
        password: hashedPassword,
        roles: UserRoles.SUPER_ADMIN, // <--- EL PODER
        company: savedCompany,
        isActive: true,
      });
      
      await queryRunner.manager.save(superAdmin);

      await queryRunner.commitTransaction();

      return {
        message: '¡Instalación exitosa!',
        credentials: {
          email: 'superadmin@saas.com',
          password: 'admin123456 (Cámbiala inmediatamente)',
        },
        warning: 'Ahora ve al código y BORRA este endpoint setup-saas por seguridad.',
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { error: error.message };
    } finally {
      await queryRunner.release();
    }
  }
}