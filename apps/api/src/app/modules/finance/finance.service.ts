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

    const [generalStats, todaySales, topProducts, categoriesSales, salesHistory] = await Promise.all([
      this.getGeneralStats(companyId),
      this.getTodaySalesCount(companyId),
      this.getTopSellingProducts(companyId),
      this.getSalesByCategory(companyId),
      this.getSalesHistory(companyId, '7d')
    ]);

    const stats = generalStats || { totalRevenue: '0', totalSales: '0', averageTicket: '0' };

    return {
      cards: {
        totalRevenue: parseFloat(stats.totalRevenue || '0'),
        totalSales: parseInt(stats.totalSales || '0'),
        averageTicket: parseFloat(stats.averageTicket || '0'),
        todaySales: todaySales || 0,
      },
      charts: {
        topProducts: topProducts.map(p => ({
            name: p.name,
            value: parseInt(p.value),
            revenue: parseFloat(p.revenue)
        })),
        categoriesSales: categoriesSales.map(c => ({
            name: c.name || 'Sin Categoría',
            value: parseInt(c.value || '0'),
            revenue: 0 
        })),
        salesHistory: salesHistory
      }
    };
  }

  // --- CONSULTAS SQL CORREGIDAS (Con comillas para Mayúsculas) ---

  private async getGeneralStats(companyId: string) {
    return await this.orderRepository
      .createQueryBuilder('o')
      .select('SUM(o.total)', 'totalRevenue')
      .addSelect('COUNT(o.id)', 'totalSales')
      .addSelect('AVG(o.total)', 'averageTicket')
      .where('o.company.id = :companyId', { companyId })
      .getRawOne(); 
  }

  async getSalesHistory(companyId: string, range: string) {
    let days = 7;
    
    // CORRECCIÓN: Usamos \"o\".\"createdAt\" (con comillas escapadas) 
    // para que Postgres respete la mayúscula de 'At'.
    let groupBy = "TO_CHAR(\"o\".\"createdAt\", 'DD/MM')"; 

    switch (range) {
      case '30d':
        days = 30;
        break;
      case '3m':
        days = 90;
        break;
      case '1y':
        days = 365;
        groupBy = "TO_CHAR(\"o\".\"createdAt\", 'MM/YY')";
        break;
      default:
        days = 7;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.orderRepository
      .createQueryBuilder('o')
      .select(groupBy, 'date')
      .addSelect('SUM(o.total)', 'total')
      .where('o.company.id = :companyId', { companyId })
      .andWhere('o.createdAt >= :startDate', { startDate })
      .groupBy(groupBy)
      .orderBy('MIN("o"."createdAt")', 'ASC') // Aquí también comillas
      .getRawMany();

    return data.map(d => ({ date: d.date, total: parseFloat(d.total) }));
  }

  private async getTodaySalesCount(companyId: string) {
    return await this.orderRepository
      .createQueryBuilder('o')
      .where('o.company.id = :companyId', { companyId })
      // CORRECCIÓN CRÍTICA: Comillas simples por fuera, dobles por dentro para la columna
      .andWhere('"o"."createdAt"::date = CURRENT_DATE') 
      .getCount();
  }

  private async getTopSellingProducts(companyId: string) {
    return await this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.order', 'o')
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'value') 
      .addSelect('SUM(item.quantity * item.price)', 'revenue')
      .where('o.company.id = :companyId', { companyId })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(5)
      .getRawMany();
  }

  private async getSalesByCategory(companyId: string) {
    return await this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.category', 'category')
      .leftJoin('item.order', 'o')
      .select('category.name', 'name')
      .addSelect('SUM(item.quantity)', 'value')
      .where('o.company.id = :companyId', { companyId })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .getRawMany();
  }
}