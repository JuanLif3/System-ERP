import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCompanySaasDto {
  // Datos de la Empresa
  @IsString() @IsNotEmpty() companyName: string;
  @IsString() @IsNotEmpty() companyRUT: string; // O NIT/DNI fiscal
  
  // Datos del Dueño (Juan)
  @IsString() @IsNotEmpty() ownerFullName: string;
  @IsEmail() @IsNotEmpty() ownerEmail: string;
  @IsString() @MinLength(6) ownerPassword: string;
}