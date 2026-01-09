import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, MoreThan } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // AHORA ACEPTA EL ARGUMENTO RANGE
  async getDashboardData(user: User, range = '7d') {
    const companyId = user.company.id;

    const [generalStats, todaySales, topProducts, categoriesSales, salesHistory, lowStock, expiring] = await Promise.all([
      this.getGeneralStats(companyId),
      this.getTodaySalesCount(companyId),
      this.getTopSellingProducts(companyId),
      this.getSalesByCategory(companyId),
      this.getSalesHistory(companyId, range), // <--- USAMOS LA VARIABLE AQUÍ
      this.getLowStockProducts(companyId),
      this.getExpiringProducts(companyId)
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
            revenue: parseFloat(c.revenue || '0')
        })),
        salesHistory: salesHistory
      },
      alerts: {
        lowStock: lowStock.map(p => ({ id: p.id, name: p.name, stock: p.stock, sku: p.sku })),
        expiring: expiring.map(p => ({ id: p.id, name: p.name, expiryDate: p.expiryDate, sku: p.sku }))
      }
    };
  }

  // --- CONSULTAS ---

  private async getGeneralStats(companyId: string) {
    return await this.orderRepository.createQueryBuilder('o')
      .select('SUM(o.total)', 'totalRevenue')
      .addSelect('COUNT(o.id)', 'totalSales')
      .addSelect('AVG(o.total)', 'averageTicket')
      .where('o.company.id = :companyId', { companyId })
      .getRawOne(); 
  }

  async getSalesHistory(companyId: string, range: string) {
    let days = 7;
    // LÓGICA DE ZONA HORARIA INTACTA
    let groupBy = "TO_CHAR(\"o\".\"createdAt\" AT TIME ZONE 'America/Santiago', 'DD/MM')"; 

    switch (range) {
      case '30d': days = 30; break;
      case '3m': days = 90; break;
      case '1y': days = 365; groupBy = "TO_CHAR(\"o\".\"createdAt\" AT TIME ZONE 'America/Santiago', 'MM/YY')"; break;
      default: days = 7; // Default por seguridad
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.orderRepository.createQueryBuilder('o')
      .select(groupBy, 'date')
      .addSelect('SUM(o.total)', 'total')
      .where('o.company.id = :companyId', { companyId })
      .andWhere('o.createdAt >= :startDate', { startDate })
      .groupBy(groupBy)
      .orderBy('MIN("o"."createdAt" AT TIME ZONE \'America/Santiago\')', 'ASC')
      .getRawMany();

    return data.map(d => ({ date: d.date, total: parseFloat(d.total) }));
  }

  private async getTodaySalesCount(companyId: string) {
    return await this.orderRepository.createQueryBuilder('o')
      .where('o.company.id = :companyId', { companyId })
      .andWhere("(\"o\".\"createdAt\" AT TIME ZONE 'America/Santiago')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Santiago')::date") 
      .getCount();
  }

  private async getTopSellingProducts(companyId: string) {
    return await this.orderItemRepository.createQueryBuilder('item')
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
    return await this.orderItemRepository.createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('product.category', 'category')
      .leftJoin('item.order', 'o')
      .select('category.name', 'name')
      .addSelect('SUM(item.quantity)', 'value')
      .addSelect('SUM(item.quantity * item.price)', 'revenue')
      .where('o.company.id = :companyId', { companyId })
      .groupBy('category.id')
      .addGroupBy('category.name')
      .getRawMany();
  }

  private async getLowStockProducts(companyId: string) {
    return await this.productRepository.find({
      where: {
        company: { id: companyId },
        isActive: true,
        stock: LessThan(10) 
      },
      order: { stock: 'ASC' },
      take: 5
    });
  }

  private async getExpiringProducts(companyId: string) {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    return await this.productRepository.find({
      where: {
        company: { id: companyId },
        isActive: true,
        stock: MoreThan(0),
        expiryDate: Between(today, nextMonth) as any 
      },
      order: { expiryDate: 'ASC' },
      take: 5
    });
  }
}