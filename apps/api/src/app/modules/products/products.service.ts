import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    const product = this.productRepository.create({
      ...createProductDto,
      // Mapeo manual: Conectamos el ID que viene del formulario con la relación
      category: { id: createProductDto.categoryId }, 
      company: user.company,
    });
    
    return await this.productRepository.save(product);
  }

  async findAll(user: User) {
    return this.productRepository.find({
      where: { 
        company: { id: user.company.id } 
        // ¡IMPORTANTE! No pongas "isActive: true" aquí.
        // Queremos ver TODOS los productos en el inventario.
      },
      relations: ['category'], // Para que se vea el nombre de la categoría
      order: { name: 'ASC' },   // Ordenar alfabéticamente por defecto
    });
  }

  // Helper de errores
  private handleDBErrors(error: any): never {
    this.logger.error(error);
    throw new BadRequestException('Error gestionando productos (Revisar logs)');
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    // 1. Buscamos el producto asegurando que pertenezca a la empresa del usuario
    const product = await this.productRepository.findOne({ 
        where: { id, company: { id: user.company.id } } 
    });

    if (!product) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // 2. Separamos categoryId si viene en la petición
    const { categoryId, ...data } = updateProductDto;

    // 3. Fusionamos los datos simples (name, price, isActive, etc.)
    this.productRepository.merge(product, data);

    // 4. Si intentan cambiar la categoría, actualizamos la relación manualmente
    if (categoryId) {
        product.category = { id: categoryId } as any;
    }

    // 5. Guardamos
    return await this.productRepository.save(product);
  }

  
}