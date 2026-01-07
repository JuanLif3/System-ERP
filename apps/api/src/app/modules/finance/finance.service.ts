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
        // salesHistory: ... YA NO LO ENVIAMOS AQUÍ
      }
    };
  }

  // --- NUEVO MÉTODO DINÁMICO ---
  async getSalesHistory(companyId: string, range: string) {
    let days = 7;
    let groupBy = "TO_CHAR(order.createdAt, 'DD/MM')"; // Por defecto: Día/Mes

    // Lógica de Rangos
    switch (range) {
      case '30d':
        days = 30;
        break;
      case '3m':
        days = 90;
        break;
      case '1y':
        days = 365;
        groupBy = "TO_CHAR(order.createdAt, 'MM/YY')"; // Mes/Año para anual
        break;
      default:
        days = 7;
    }

    // Calculamos la fecha de inicio
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await this.orderRepository
      .createQueryBuilder('order')
      .select(groupBy, 'date')
      .addSelect('SUM(order.total)', 'total')
      .where('order.company.id = :companyId', { companyId })
      .andWhere('order.createdAt >= :startDate', { startDate }) // Filtro de fecha
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

  private async getTodaySalesCount(companyId: string) {
    // Ajuste Zona Horaria CHILE (UTC-3 o UTC-4)
    // Para simplificar, usamos el objeto Date nativo que tomará la hora del servidor
    // Si quieres forzar Chile, definimos el inicio del día manualmente.
    
    const now = new Date();
    // Creamos una fecha que representa las 00:00 de hoy
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    return await this.orderRepository
      .createQueryBuilder('order')
      .where('order.company.id = :companyId', { companyId })
      .andWhere('order.createdAt BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .getCount();
  }

  private async getTopSellingProducts(companyId: string) {
    return await this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .leftJoin('item.order', 'order')
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'value') 
      .addSelect('SUM(item.quantity * item.price)', 'revenue') // <--- Calculamos ganancia (cantidad * precio)
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

    // Fix manual para asegurar que value sea accesible aunque la DB lo devuelva raro
    return results.map(r => ({ name: r.name, value: r.value }));
  }

  // --- NUEVA CONSULTA: Gráfico de Línea (Últimos 7 días) ---
  private async getLast7DaysSales(companyId: string) {
    // Esta consulta agrupa las ventas por fecha (Día-Mes)
    // Nota: SQL puro a veces es mejor para fechas, pero TypeORM lo hace así:
    
    const data = await this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'DD/MM')", 'date') // Formato día/mes (Postgres)
      .addSelect('SUM(order.total)', 'total')
      .where('order.company.id = :companyId', { companyId })
      .groupBy("TO_CHAR(order.createdAt, 'DD/MM')")
      .orderBy('MIN(order.createdAt)', 'ASC') // Ordenar cronológicamente
      .limit(7)
      .getRawMany();

    return data.map(d => ({ date: d.date, total: parseFloat(d.total) }));
  }
}