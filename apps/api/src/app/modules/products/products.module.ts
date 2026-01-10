import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity'; 
import { AuthModule } from '../auth/auth.module'; 
// IMPORTAR CLOUDINARY
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), 
    AuthModule,
    CloudinaryModule // <--- AGREGADO AQUÍ
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}