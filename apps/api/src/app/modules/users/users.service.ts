import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoles } from '../../common/enums/roles.enum'; // <--- IMPORTANTE: Importar el Enum

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // --- CREAR USUARIO (Normal) ---
  async create(createUserDto: CreateUserDto, currentUser: User) {
    const { password, ...userData } = createUserDto;

    const existing = await this.userRepository.findOneBy({ email: userData.email });
    if (existing) throw new BadRequestException('El correo ya está registrado');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      // Asignamos la empresa del admin creador
      company: currentUser.company, 
    });

    const savedUser = await this.userRepository.save(user);
    delete savedUser.password;
    return savedUser;
  }

  // --- LISTAR USUARIOS (Filtrado por empresa y ocultando al admin actual) ---
  async findAll(currentUser: User) {
    if (!currentUser.company) {
        // Si es SuperAdmin (sin empresa), ve todos los usuarios
        return this.userRepository.find({ order: { fullName: 'ASC' } });
    }

    return this.userRepository.find({
      where: { 
        company: { id: currentUser.company.id },
        id: Not(currentUser.id) // Excluye al usuario que hace la petición
      },
      order: { fullName: 'ASC' },
    });
  }

  // --- BUSCAR UNO ---
  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // --- ACTUALIZAR USUARIO ---
  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    // Verificamos que el usuario pertenezca a la misma empresa (si el admin tiene empresa)
    const query: any = { id };
    if (currentUser.company) {
        query.company = { id: currentUser.company.id };
    }

    const user = await this.userRepository.findOne({ where: query });

    if (!user) throw new NotFoundException('Usuario no encontrado o no tienes permisos');

    // Si viene password, la encriptamos
    if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = this.userRepository.merge(user, updateUserDto);
    await this.userRepository.save(updatedUser);
    
    delete updatedUser.password;
    return updatedUser;
  }

  // --- MÉTODO DE EMERGENCIA PARA CREAR SUPER ADMIN ---
  async createSuperAdminSeed() {
    const email = 'superadmin@nexus.cl'; 
    const password = 'AdminQS123.';      
    const fullName = 'Nexus Super Admin';

    const existing = await this.userRepository.findOneBy({ email });
    
    if (existing) {
        // Restaurar acceso si ya existe
        existing.password = await bcrypt.hash(password, 10);
        existing.roles = UserRoles.SUPER_ADMIN; // <--- USO CORRECTO DEL ENUM
        existing.isActive = true;
        existing.company = null; 
        await this.userRepository.save(existing);
        return `Usuario ${email} RESTAURADO. Nueva pass: ${password}`;
    }

    // Crear nuevo
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      fullName,
      email,
      password: hashedPassword,
      roles: UserRoles.SUPER_ADMIN, // <--- USO CORRECTO DEL ENUM
      isActive: true,
      company: null, 
    });

    await this.userRepository.save(user);
    return `Usuario Super Admin creado exitosamente: ${email} / ${password}`;
  }
}