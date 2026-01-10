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

      // 1. Subida a Cloudinary si existe archivo
      if (file) {
        imageUrl = await this.cloudinaryService.uploadImage(file);
      }

      // 2. Creación en BD
      const product = this.productRepository.create({
        ...createProductDto,
        imageUrl: imageUrl,
        company: user.company, 
        // Eliminamos user: user porque no existe en la entidad Product
      });

      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // --- BUSCAR TODOS (Paginado + Multi-tenant) ---
  async findAll(queryParameters: any, user: User) {
    const { limit = 10, offset = 0 } = queryParameters;
    
    return this.productRepository.find({
      take: limit,
      skip: offset,
      where: { 
        company: { id: user.company.id } // Solo productos de SU empresa
      },
      relations: ['category'], // Opcional: traer relaciones si las necesitas
    });
  }

  // --- BUSCAR UNO ---
  async findOne(id: string, user: User) {
    const product = await this.productRepository.findOne({
      where: { 
        id, 
        company: { id: user.company.id } 
      },
      relations: ['category'],
    });

    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);
    return product;
  }

  // --- ACTUALIZAR ---
  async update(id: string, updateProductDto: UpdateProductDto, user: User, file?: Express.Multer.File) {
    // 1. Verificamos que exista y pertenezca a la empresa
    const product = await this.findOne(id, user);

    // 2. Si hay nueva imagen, subirla
    if (file) {
      try {
        const newImageUrl = await this.cloudinaryService.uploadImage(file);
        product.imageUrl = newImageUrl;
      } catch (error) {
        this.logger.error('Error uploading to Cloudinary', error);
        throw new InternalServerErrorException('Could not upload image');
      }
    }

    // 3. Merge de datos y guardado
    this.productRepository.merge(product, updateProductDto);
    
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

  // --- MANEJO DE ERRORES ---
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}