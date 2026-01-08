import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto'; 
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) { 
    const { email, password } = loginDto;

    // 1. Buscamos usuario con su empresa cargada
    const user = await this.userRepository.findOne({
      where: { email },
      select: { password: true, email: true, id: true, fullName: true, roles: true, isActive: true },
      relations: ['company'], // <--- IMPORTANTE: Cargar la relación para validar SaaS
    });

    if (!user) 
      throw new UnauthorizedException('Credenciales no válidas (email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credenciales no válidas (password)');

    // 2. Verificar si el USUARIO está activo
    if (!user.isActive)
        throw new UnauthorizedException('Usuario inactivo, contacte al admin');

    // 3. --- VERIFICACIÓN DE SEGURIDAD SAAS ---
    // Si la empresa existe y está inactiva, bloqueamos el acceso
    if (user.company && !user.company.isActive) {
        throw new UnauthorizedException('Su empresa ha sido suspendida. Contacte al soporte.');
    }

    // 4. PREPARAR EL PAYLOAD (Esto faltaba en el código anterior)
    const payload = { 
        id: user.id, 
        email: user.email,
        roles: user.roles,
        companyId: user.company?.id // El SuperAdmin podría no tener company, usamos ?.
    };

    // 5. Retornar token y datos
    return {
      user: {
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        company: user.company?.name
      },
      token: this.jwtService.sign(payload), // <--- Ahora 'payload' ya existe
    };
  }
}
