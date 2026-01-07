import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRoles } from '../../../common/enums/roles.enum'; // Asegúrate que la ruta sea correcta

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(UserRoles, { message: 'Rol inválido' })
  @IsNotEmpty()
  roles: UserRoles;
}