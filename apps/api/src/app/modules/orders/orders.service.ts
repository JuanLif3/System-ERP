import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // <--- IMPORTANTE: DataSource
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDeletionRequest } from './entities/order-deletion-request.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService'); // <--- LOGGER DEFINIDO

  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderDeletionRequest) private readonly requestRepository: Repository<OrderDeletionRequest>,
    private readonly dataSource: DataSource, // <--- INYECCIÓN DE DATASOURCE
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    const { items, paymentMethod } = createOrderDto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of items) {
        const product = await queryRunner.manager.findOne(Product, { 
            where: { id: itemDto.productId, company: { id: user.company.id } } 
        });

        if (!product) throw new NotFoundException(`Producto ${itemDto.productId} no encontrado`);
        if (product.stock < itemDto.quantity) throw new BadRequestException(`Stock insuficiente para ${product.name}`);

        // Descontar Stock
        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(product);

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = itemDto.quantity;
        orderItem.price = product.price;
        
        orderItems.push(orderItem);
        totalAmount += product.price * itemDto.quantity;
      }

      const order = this.orderRepository.create({
        company: user.company,
        user: user,
        total: totalAmount,
        status: 'COMPLETED',
        paymentMethod: paymentMethod,
        items: orderItems,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      
      return savedOrder;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(user: User) {
    return await this.orderRepository.find({
      where: { company: { id: user.company.id } },
      relations: ['items', 'items.product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  // --- SOLICITUDES DE ELIMINACIÓN ---

  async requestDeletion(orderId: string, reason: string, user: User) {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['company'] });
    if (!order) throw new NotFoundException('Orden no encontrada');

    // Verificar si ya existe una solicitud pendiente
    const existing = await this.requestRepository.findOne({ 
        where: { order: { id: orderId }, status: 'PENDING' } 
    });
    // Si ya existe, no hacemos nada o devolvemos la existente
    if (existing) return existing;

    const request = this.requestRepository.create({
        reason,
        status: 'PENDING',
        order,
        requestedBy: user,
        company: user.company
    });

    return await this.requestRepository.save(request);
  }

  async getPendingRequests(user: User) {
    return await this.requestRepository.find({
        where: { 
            company: { id: user.company.id },
            status: 'PENDING'
        },
        relations: ['order', 'requestedBy'],
        order: { createdAt: 'DESC' }
    });
  }

  async resolveRequest(requestId: string, action: 'APPROVE' | 'REJECT') {
    const request = await this.requestRepository.findOne({ 
        where: { id: requestId },
        relations: ['order', 'order.company'] 
    });

    if (!request) throw new NotFoundException('Solicitud no encontrada');

    if (action === 'REJECT') {
        request.status = 'REJECTED';
        return await this.requestRepository.save(request);
    }

    if (action === 'APPROVE') {
        // Llamamos al método remove pasando el ID de la orden y un usuario "ficticio" o null
        // ya que la validación de seguridad ya se hizo al cargar la solicitud
        // Sin embargo, para reutilizar remove necesitamos el contexto.
        // Mejor ejecutamos la lógica de borrado aquí directamente.
        
        await this.remove(request.order.id, { company: request.order.company } as User);
        return { message: 'Orden eliminada y stock restaurado' };
    }
  }

  // --- ELIMINAR ORDEN (Restaurando Stock) ---
  async remove(id: string, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id, company: { id: user.company.id } },
        relations: ['items', 'items.product'],
      });

      if (!order) throw new NotFoundException('Orden no encontrada');

      // Restaurar Stock
      for (const item of order.items) {
        if (item.product) {
            await queryRunner.manager.increment(Product, { id: item.product.id }, 'stock', item.quantity);
        }
      }

      await queryRunner.manager.remove(order);
      await queryRunner.commitTransaction();
      return { message: 'Venta eliminada correctamente' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw new InternalServerErrorException('Error al eliminar la venta');
    } finally {
      await queryRunner.release();
    }
  }
}