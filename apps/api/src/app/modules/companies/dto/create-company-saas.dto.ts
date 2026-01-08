import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCompanySaasDto {
  // Datos de la Empresa
  @IsString() @IsNotEmpty() companyName: string;
  @IsString() @IsNotEmpty() companyRUT: string;
  
  // --- AGREGAR ESTO ---
  @IsString() 
  @IsNotEmpty({ message: 'El teléfono de la empresa es obligatorio' }) 
  companyPhone: string;
  // --------------------
  
  // Datos del Dueño
  @IsString() @IsNotEmpty() ownerFullName: string;
  @IsEmail() @IsNotEmpty() ownerEmail: string;
  @IsString() @MinLength(6) ownerPassword: string;
}