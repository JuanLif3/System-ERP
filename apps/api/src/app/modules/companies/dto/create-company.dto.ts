// apps/api/src/app/modules/companies/dto/create-company.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El RUT es obligatorio' })
  // Podríamos agregar un Regex para validar formato RUT chileno más adelante
  rut: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña es muy débil (requiere mayúscula, minúscula y número)',
  })
  password: string; // Este campo es solo para transporte, no persiste en Company
}