import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Auth } from '../auth/decorators/auth.decorator'; // Nuestro decorador
import { GetUser } from '../../common/decorators/get-user.decorator'; // Nuestro extractor
import { User } from '../users/entities/user.entity';

@Controller('products')
@Auth() // <--- TODAS las rutas de abajo requieren Token
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User, // <--- Nest nos inyecta el usuario del token
  ) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.productsService.findAll(user);
  }
}