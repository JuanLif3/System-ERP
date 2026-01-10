import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
// Importamos multer para evitar errores de tipado
import 'multer';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';


@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // --- CREAR ---
  async create(createProductDto: CreateProductDto, user: User, file?: Express.Multer.File) {
    try {
      let imageUrl = null;
      // Desestructuramos para sacar categoryId aparte
      const { categoryId, ...productDetails } = createProductDto;

      if (file) {
        imageUrl = await this.cloudinaryService.uploadImage(file);
      }

      const product = this.productRepository.create({
        ...productDetails,
        imageUrl: imageUrl,
        company: user.company,
        // Asignamos la relación usando el ID que viene del frontend
        category: { id: categoryId } as Category, 
      });

      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // --- BUSCAR TODOS ---
  async findAll(queryParameters: any, user: User) {
    const { limit = 10, offset = 0 } = queryParameters;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      where: { company: { id: user.company.id } },
      relations: ['category'], // Para que el frontend reciba el objeto completo con nombre
    });
  }

  // --- BUSCAR UNO ---
  async findOne(id: string, user: User) {
    const product = await this.productRepository.findOne({
      where: { id, company: { id: user.company.id } },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);
    return product;
  }

  // --- ACTUALIZAR ---
  async update(id: string, updateProductDto: UpdateProductDto, user: User, file?: Express.Multer.File) {
    const product = await this.findOne(id, user);
    
    // Desestructuramos
    const { categoryId, ...rest } = updateProductDto;

    // 1. Manejo de Imagen
    if (file) {
      try {
        const newImageUrl = await this.cloudinaryService.uploadImage(file);
        product.imageUrl = newImageUrl;
      } catch (error) {
        this.logger.error('Error uploading to Cloudinary', error);
        throw new InternalServerErrorException('Could not upload image');
      }
    }

    // 2. Manejo de Categoría
    if (categoryId) {
      // Type casting simple para actualizar la relación
      product.category = { id: categoryId } as Category;
    }

    // 3. Merge del resto
    this.productRepository.merge(product, rest);
    
    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // --- ELIMINAR ---
  async remove(id: string, user: User) {
    const product = await this.findOne(id, user);
    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}