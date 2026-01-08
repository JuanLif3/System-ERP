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

    const [generalStats, todaySales, topProducts, categoriesSales] = await Promise.all([
      this.getGeneralStats(companyId),
      this.getTodaySalesCount(companyId),
      this.getTopSellingProducts(companyId),
      this.getSalesByCategory(companyId)
    ]);

    return {
      cards: {
        totalRevenue: parseFloat(generalStats.totalRevenue || '0'),
        totalSales: parseInt(generalStats.totalSales || '0'),
        averageTicket: parseFloat(generalStats.averageTicket || '0'),
        todaySales: todaySales,
      },
      charts: {
        topProducts: topProducts.map(p => ({
            name: p.name,
            value: parseInt(p.value),
            revenue: parseFloat(p.revenue)
        })),
        categoriesSales: categoriesSales.map(c => ({
            name: c.name || 'Sin Categoría',
            value: parseInt(c.value || '0')
        })),
      }
    };
  }

  // --- ARREGLO 1: GRÁFICO DE HISTORIAL ---
  async getSalesHistory(companyId: string, range: string) {
    let days = 7;
    
    // CORRECCIÓN: Eliminamos el primer "AT TIME ZONE 'UTC'".
    // Al ser timestamptz, Postgres convierte directo a Chile.
    // Esto hará que las ventas de las 22:00 del día 07 se queden en el 07.
    let groupBy = "TO_CHAR(order.createdAt AT TIME ZONE 'America/Santiago', 'DD/MM')";

    switch (range) {
      case '30d':
        days = 30;
        break;
      case '3m':
        days = 90;
        break;
      case '1y':
        days = 365;
        groupBy = "TO_CHAR(order.createdAt AT TIME ZONE 'America/Santiago', 'MM/YY')";
        break;
      default:
        days = 7;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.orderRepository
      .createQueryBuilder('order')
      .select(groupBy, 'date')
      .addSelect('SUM(order.total)', 'total')
      .where('order.company.id = :companyId', { companyId })
      .andWhere('order.createdAt >= :startDate', { startDate })
      .groupBy(groupBy)
      .orderBy('MIN(order.createdAt)', 'ASC')
      .getRawMany();

    return data.map(d => ({ date: d.date, total: parseFloat(d.total) }));
  }

  // --- CONSULTAS SQL ---

  private async getGeneralStats(companyId: string) {
    return await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'totalRevenue')
      .addSelect('COUNT(order.id)', 'totalSales')
      .addSelect('AVG(order.total)', 'averageTicket')
      .where('order.company.id = :companyId', { companyId })
      .getRawOne(); 
  }

  // --- ARREGLO 2: VENTAS DE HOY ---
  private async getTodaySalesCount(companyId: string) {
    // ESTRATEGIA INFALIBLE:
    // Comparamos el "Día en Chile de la Venta" vs "Día en Chile de AHORA"
    // Usamos ::date para ignorar las horas y comparar solo la fecha (YYYY-MM-DD)
    
    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.company.id = :companyId', { companyId })
      .andWhere(
        "(order.createdAt AT TIME ZONE 'America/Santiago')::date = (now() AT TIME ZONE 'America/Santiago')::date"
      )
      .getCount();
  }

  private async getTopSellingProducts(companyId: string) {
    return await this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.order', 'order')
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'value') 
      .addSelect('SUM(item.quantity * item.price)', 'revenue')
      .where('order.company.id = :companyId', { companyId })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(5)
      .getRawMany();
  }

  private async getSalesByCategory(companyId: string) {
    const results = await this.orderItemRepository
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

    return results.map(r => ({ name: r.name, value: r.value }));
  }
}