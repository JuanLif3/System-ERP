import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async getDashboardData(user: User) {
    const companyId = user.company.id;

    // Ejecutamos 4 consultas en paralelo para máxima velocidad
    const [
      generalStats, 
      todaySales, 
      topProducts, 
      categoriesSales
    ] = await Promise.all([
      this.getGeneralStats(companyId),
      this.getTodaySalesCount(companyId),
      this.getTopSellingProducts(companyId),
      this.getSalesByCategory(companyId)
    ]);

    return {
      cards: {
        totalRevenue: parseFloat(generalStats.totalRevenue || '0'), // Ingresos Totales
        totalSales: parseInt(generalStats.totalSales || '0'),       // Ventas Totales (Histórico)
        averageTicket: parseFloat(generalStats.averageTicket || '0'), // Promedio de venta
        todaySales: todaySales,                                     // Ventas de hoy (Reinicia diario)
      },
      charts: {
        topProducts,
        categoriesSales
      }
    };
  }

  // --- CONSULTAS SQL BUILDER ---

  private async getGeneralStats(companyId: string) {
    // Calcula suma total, conteo total y promedio en una sola consulta
    return await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'totalRevenue')
      .addSelect('COUNT(order.id)', 'totalSales')
      .addSelect('AVG(order.total)', 'averageTicket')
      .where('order.company.id = :companyId', { companyId })
      .getRawOne(); 
  }

  private async getTodaySalesCount(companyId: string) {
    // Calculamos el rango de fechas de HOY
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.company.id = :companyId', { companyId })
      .andWhere('order.createdAt BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .getCount();
  }

  private async getTopSellingProducts(companyId: string) {
    // Top 5 Productos más vendidos (Sumando cantidades de OrderItems)
    return await this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.order', 'order') // Necesario para filtrar por compañía
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'value') // 'value' es estándar para librerías de gráficos
      .where('order.company.id = :companyId', { companyId })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(5)
      .getRawMany();
  }

  private async getSalesByCategory(companyId: string) {
    // Ventas agrupadas por Categoría
    return await this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.category', 'category')
      .leftJoin('item.order', 'order')
      .select('category.name', 'name')
      .addSelect('SUM(item.quantity)', 'value')
      .where('order.company.id = :companyId', { companyId })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .getRawMany();
  }
}