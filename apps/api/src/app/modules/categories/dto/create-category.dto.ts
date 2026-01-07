import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  // ¡NO DEBE HABER NADA MÁS AQUÍ!
  // Si ves "categoryId", "price" o "sku", BÓRRALOS INMEDIATAMENTE.
}