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
    const { password, email } = loginDto;

    // 1. Buscar usuario por email (incluyendo la relacion con la compañia)
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['company'], // Muy importante para multi-tenancy
      select: {
        id: true,
        password: true,
        email: true,
        fullName: true,
        roles: true,
        company: { id: true, name: true} // Solo traemos lo necesario de company
      }
    });

    // 2. Validar si existe y si la contraseña coincide
    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar JWT con payload personalizado
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      companyId: user.company.id, // CRÍTICO para Multi-tenancy
    };

    return {
      user: {
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        company: user.company.name
      },
      token: this.jwtService.sign(payload),
    };
  }
}
