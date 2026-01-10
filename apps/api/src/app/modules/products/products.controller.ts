import { 
  Body, Controller, Get, Post, Patch, Param, ParseUUIDPipe, 
  UseInterceptors, UploadedFile, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
// IMPORTAR SERVICIO CLOUDINARY
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Auth()
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService // <--- INYECCIÓN
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Sin config de storage, archivo en memoria RAM
  async create( // <--- AGREGADO async
    @Body() createProductDto: CreateProductDto, 
    @GetUser() user: User,
    @UploadedFile() file: any // <--- Usamos 'any' para evitar error de tipos
  ) {
    // 1. Si hay archivo, subir a Cloudinary
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      createProductDto.imageUrl = result.secure_url; // URL segura de Cloudinary (https://...)
    }
    
    // 2. Crear producto
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.productsService.findAll(user);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update( // <--- AGREGADO async
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto, 
    @GetUser() user: User,
    @UploadedFile() file: any // <--- Usamos 'any'
  ) {
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      updateProductDto.imageUrl = result.secure_url;
    }
    
    return this.productsService.update(id, updateProductDto, user);
  }
}