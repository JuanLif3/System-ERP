import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  hasExpiryDate?: boolean;

  @IsDateString() // Valida formato ISO 8601 (YYYY-MM-DD)
  @IsOptional()
  expiryDate?: Date;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}