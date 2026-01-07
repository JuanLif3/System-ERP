import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';

// DTO Auxiliar para cada item de la lista
class CreateOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

// DTO Principal
export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'La orden debe tener al menos un producto' })
  @ValidateNested({ each: true }) // Valida cada objeto dentro del array
  @Type(() => CreateOrderItemDto) // Transforma el JSON a la clase auxiliar
  items: CreateOrderItemDto[];
}