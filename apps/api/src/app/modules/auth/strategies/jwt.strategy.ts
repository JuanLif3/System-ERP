import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
        secretOrKey: configService.get('JWT_SECRET'),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Espera header: "Authorization: Bearer <token>"
    });
  }

  // Este metodo se ejecuta si el token es válido
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    // Buscamos el usuario y cargamos su relacion con la compañia
    const user = await this.userRepository.findOne({
        where: { id },
        relations: ['company'], // Importante cargar la compañia
    });

    if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
    }
    if (!user.isActive) { // Asumimos que AbstractEntity tiene isActive (si no, bórralo o agrégalo)
        throw new UnauthorizedException('Usuario inactivo');
    }

    return user;
  }

}