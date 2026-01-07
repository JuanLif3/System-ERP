import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- IMPORTAR
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; // <--- IMPORTAR ENTIDAD
import { AuthModule } from '../auth/auth.module'; // <--- IMPORTAR AUTH PARA LOS DECORADORES

@Module({
  imports: [
    // Esto es lo que le faltaba para poder inyectar el repositorio en el servicio
    TypeOrmModule.forFeature([User]), 
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Es probable que AuthModule necesite esto, déjalo exportado
})
export class UsersModule {}