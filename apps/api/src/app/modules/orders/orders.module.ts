import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { AuthModule } from '../auth/auth.module';
import { Product } from '../products/entities/product.entity';
import { OrderDeletionRequest } from './entities/order-deletion-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, OrderDeletionRequest]), 
    AuthModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}