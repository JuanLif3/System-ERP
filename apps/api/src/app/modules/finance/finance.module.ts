import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { AuthModule } from '../auth/auth.module';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [
    // Importamos las entidades que vamos a consultar
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    AuthModule
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}