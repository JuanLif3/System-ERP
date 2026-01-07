import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      // Validar SKU único PERO solo dentro de la misma empresa
      // (Opcional avanzado: hacerlo con query directa, por ahora confiamos en el save)
      
      const product = this.productRepository.create({
        ...createProductDto,
        company: user.company, // <--- AQUÍ OCURRE LA MAGIA DEL MULTI-TENANT
      });

      return await this.productRepository.save(product);

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(user: User) {
    // Solo devolvemos los productos de la empresa del usuario
    return this.productRepository.find({
      where: {
        company: { id: user.company.id }, // <--- FILTRO AUTOMÁTICO
        isActive: true, // Por defecto mostramos solo los activos en el listado general
      },
      order: { createdAt: 'DESC' }
    });
  }

  // Helper de errores
  private handleDBErrors(error: any): never {
    this.logger.error(error);
    throw new BadRequestException('Error gestionando productos (Revisar logs)');
  }
}