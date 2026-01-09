import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto'; 

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) { 
    const { email, password } = loginDto;

    // 1. Buscamos usuario (quitamos el 'select' para evitar errores de mapeo con relaciones)
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['company'], 
    });

    if (!user) 
      throw new UnauthorizedException('Credenciales no válidas (email)');

    // 2. Verificar si el USUARIO está activo
    if (!user.isActive)
        throw new UnauthorizedException('Usuario inactivo, contacte al admin');

    // 3. Verificar Password (BCRYPT)
    // NOTA: Si tu usuario en la BD tiene contraseña texto plano ("123456"), esto fallará.
    // Debes actualizar la contraseña en la BD o crear un usuario nuevo con el sistema ya parcheado.
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credenciales no válidas (password)');

    // 4. Verificar Empresa (Solo si el usuario pertenece a una)
    if (user.company && !user.company.isActive) {
        throw new UnauthorizedException('Su empresa ha sido suspendida. Contacte al soporte.');
    }

    // 5. Preparar Payload
    const payload = { 
        id: user.id, 
        email: user.email,
        roles: user.roles,
        companyId: user.company?.id // Puede ser undefined si es Super Admin
    };

    return {
      user: {
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        company: user.company?.name
      },
      token: this.jwtService.sign(payload),
    };
  }
}