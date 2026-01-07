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
        // ... (Tu código de búsqueda de producto y validación sigue igual) ...

        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId, company: { id: user.company.id } },
        });

        if (!product) {
            throw new NotFoundException(`Producto ${item.productId} no encontrado`);
        }

        if (product.stock < item.quantity) {
             throw new BadRequestException(`Stock insuficiente. Disponible: ${product.stock}`);
        }

        // --- CORRECCIÓN AQUÍ ---
        // Método A (El que tenías): Modificar objeto y guardar
        // product.stock -= item.quantity;
        // await queryRunner.manager.save(product); 
        
        // Método B (Más Robusto): Instrucción directa de decremento a la DB
        await queryRunner.manager.decrement(Product, { id: product.id }, 'stock', item.quantity);
        // -----------------------

        // Crear el Item de la Orden (Usamos el precio del producto encontrado)
        const orderItem = queryRunner.manager.create(OrderItem, {
          quantity: item.quantity,
          price: product.price, 
          product: product, // TypeORM vinculará el ID correctamente
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

  async remove(id: string, user: User) {
    // 1. Verificar Permisos (Solo ADMIN puede anular)
    if (user.roles !== 'ADMIN') {
      throw new BadRequestException('Solo los administradores pueden anular ventas');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Buscar la orden con sus items para saber qué devolver
      const order = await queryRunner.manager.findOne(Order, {
        where: { id, company: { id: user.company.id } },
        relations: ['items', 'items.product'],
      });

      if (!order) throw new NotFoundException('Orden no encontrada');

      // 3. Devolver Stock (Reversa)
      for (const item of order.items) {
        // Incrementamos el stock del producto
        await queryRunner.manager.increment(
            Product, 
            { id: item.product.id }, 
            'stock', 
            item.quantity
        );
      }

      // 4. Eliminar la Orden (Cascade borrará los items)
      await queryRunner.manager.remove(order);

      await queryRunner.commitTransaction();
      return { message: 'Venta anulada y stock restaurado' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}