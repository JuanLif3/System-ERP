import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// PartialType hace que todos los campos de CreateProductDto sean opcionales automáticamente
export class UpdateProductDto extends PartialType(CreateProductDto) {}