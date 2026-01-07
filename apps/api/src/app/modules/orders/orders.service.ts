import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    const { items } = createOrderDto;

    // 1. Iniciar Transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      let totalItems = 0;
      const orderItems: OrderItem[] = [];

      // 2. Iterar sobre cada item solicitado
      for (const item of items) {
        // Buscar producto (bloqueando lectura para consistencia, opcional)
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId, company: { id: user.company.id } },
        });

        if (!product) {
          throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
        }

        // Validar Stock
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
        }

        // Descontar Stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        // Crear el Item de la Orden
        const orderItem = queryRunner.manager.create(OrderItem, {
          quantity: item.quantity,
          price: product.price, // Tomamos el precio ACTUAL del producto
          product: product,
        });

        // Cálculos acumulativos
        totalAmount += product.price * item.quantity;
        totalItems += item.quantity;
        orderItems.push(orderItem);
      }

      // 3. Crear la Cabecera de la Orden
      const order = queryRunner.manager.create(Order, {
        total: totalAmount,
        totalItems: totalItems,
        status: OrderStatus.COMPLETED,
        user: user,
        company: user.company,
        items: orderItems, // TypeORM se encarga de guardar esto gracias a cascade: true
      });

      // 4. Guardar todo
      await queryRunner.manager.save(order);

      // 5. Commit
      await queryRunner.commitTransaction();

      // Retornar la orden limpia (sin datos sensibles de usuario)
      return {
        id: order.id,
        total: order.total,
        items: order.items.length,
        status: order.status,
        createdAt: order.createdAt
      };

    } catch (error) {
      // 6. Rollback si algo falla
      await queryRunner.rollbackTransaction();
      this.handleDBErrors(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: User) {
    return this.orderRepository.find({
      where: { company: { id: user.company.id } },
      relations: ['items', 'items.product', 'user'], // Traer detalles
      order: { createdAt: 'DESC' },
    });
  }

  private handleDBErrors(error: any): never {
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error; // Re-lanzar errores controlados
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Error al procesar la orden');
  }
}