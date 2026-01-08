import { 
  Body, Controller, Get, Post, Patch, Param, ParseUUIDPipe, 
  UseInterceptors, UploadedFile // <--- Nuevos imports
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // <--- Importar
import { diskStorage } from 'multer'; // <--- Importar
import { extname } from 'path'; // <--- Importar
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

// Configuración de almacenamiento (Dónde y cómo se guarda)
const storageConfig = diskStorage({
  destination: './uploads', // Se guardarán en la raíz del proyecto carpeta 'uploads'
  filename: (req, file, cb) => {
    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
    cb(null, `${randomName}${extname(file.originalname)}`); // Nombre aleatorio + extensión (.jpg)
  },
});

@Auth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig })) // 'file' es el nombre del campo en el frontend
  create(
    @Body() createProductDto: CreateProductDto, 
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File // <--- Aquí capturamos el archivo
  ) {
    // Si subieron un archivo, generamos la URL
    if (file) {
      // Ajusta 'http://localhost:3000' si tu dominio cambia en producción
      createProductDto.imageUrl = `http://localhost:3000/uploads/${file.filename}`;
    }
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.productsService.findAll(user);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', { storage: storageConfig })) // También permitimos archivo al editar
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto, 
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (file) {
      updateProductDto.imageUrl = `http://localhost:3000/uploads/${file.filename}`;
    }
    return this.productsService.update(id, updateProductDto, user);
  }
}