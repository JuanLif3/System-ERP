import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer'; // <--- IMPORTANTE

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @Type(() => Number) // <--- CONVIERTE "1000" (String) A 1000 (Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number) // <--- CONVIERTE EL STRING A NÚMERO
  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean() // Opcional: Si isActive da problemas, usa @Transform(({ value }) => value === 'true')
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}