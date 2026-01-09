import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, MoreThan } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Expense) private readonly expenseRepository: Repository<Expense>,
  ) {}

  // AHORA ACEPTA EL ARGUMENTO RANGE
  async getDashboardData(user: User, range = '7d') {
    const companyId = user.company.id;

    const [
        generalStats, 
        todaySales, 
        topProducts, 
        categoriesSales, 
        salesHistory, 
        lowStock, 
        expiring,
        revenueTrend // <--- NUEVA VARIABLE
    ] = await Promise.all([
      this.getGeneralStats(companyId),
      this.getTodaySalesCount(companyId),
      this.getTopSellingProducts(companyId),
      this.getSalesByCategory(companyId),
      this.getSalesHistory(companyId, range),
      this.getLowStockProducts(companyId),
      this.getExpiringProducts(companyId),
      this.calculateRevenueGrowth(companyId, range) // <--- LLAMADA NUEVA
    ]);

    const stats = generalStats || { totalRevenue: '0', totalSales: '0', averageTicket: '0' };

    return {
      cards: {
        totalRevenue: parseFloat(stats.totalRevenue || '0'),
        totalSales: parseInt(stats.totalSales || '0'),
        averageTicket: parseFloat(stats.averageTicket || '0'),
        todaySales: todaySales || 0,
        revenueTrend: revenueTrend || 0 // <--- SE ENVÍA AL FRONT
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

  // ... imports

  // Reemplaza el método calculateRevenueGrowth con esta versión mejorada:
  private async calculateRevenueGrowth(companyId: string, range: string): Promise<number> {
    let days = 7;
    switch (range) {
        case '30d': days = 30; break;
        case '3m': days = 90; break;
        case '1y': days = 365; break;
        default: days = 7;
    }

    // FECHAS BASE (Seteadas a las 00:00:00 para comparación estricta de días)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final de hoy

    // Inicio del periodo actual (Hace X días a las 00:00)
    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - days);
    currentStart.setHours(0, 0, 0, 0);

    // Inicio del periodo anterior (Hace 2*X días a las 00:00)
    const previousStart = new Date();
    previousStart.setDate(previousStart.getDate() - (days * 2));
    previousStart.setHours(0, 0, 0, 0);
    
    // Fin del periodo anterior (Justo antes de que empiece el actual)
    const previousEnd = new Date(currentStart); 
    previousEnd.setMilliseconds(-1); 

    // 1. Consulta Ingresos Periodo Actual
    const currentRevenueResult = await this.orderRepository.createQueryBuilder('o')
        .select('SUM(o.total)', 'total')
        .where('o.company.id = :companyId', { companyId })
        .andWhere('o.createdAt BETWEEN :currentStart AND :today', { currentStart, today })
        .getRawOne();
    
    // 2. Consulta Ingresos Periodo Anterior
    const previousRevenueResult = await this.orderRepository.createQueryBuilder('o')
        .select('SUM(o.total)', 'total')
        .where('o.company.id = :companyId', { companyId })
        .andWhere('o.createdAt BETWEEN :previousStart AND :previousEnd', { previousStart, previousEnd })
        .getRawOne();

    const currentRevenue = parseFloat(currentRevenueResult.total || '0');
    const previousRevenue = parseFloat(previousRevenueResult.total || '0');

    // 3. Lógica para sistemas nuevos
    if (previousRevenue === 0) {
        // Si no hubo ventas antes, y ahora sí, es 100%. 
        // Si tampoco hay ventas ahora, es 0%.
        return currentRevenue > 0 ? 100 : 0; 
    }

    // Fórmula de Crecimiento
    const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    
    return parseFloat(growth.toFixed(1));
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

  // --- REPORTE PDF MASTER ---
  async getReportData(companyId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 1. Resumen General (Ingresos, Ventas, Ticket Promedio)
    const stats = await this.orderRepository.createQueryBuilder('o')
      .select('SUM(o.total)', 'totalRevenue')
      .addSelect('COUNT(o.id)', 'totalSales')
      .addSelect('AVG(o.total)', 'averageTicket')
      .where('o.company.id = :companyId', { companyId })
      .andWhere('o.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    // 2. Top Categoría
    const topCategory = await this.orderItemRepository.createQueryBuilder('item')
      .leftJoin('item.product', 'p')
      .leftJoin('p.category', 'c')
      .leftJoin('item.order', 'o')
      .select('c.name', 'name')
      .addSelect('SUM(item.quantity)', 'units')
      .where('o.company.id = :companyId', { companyId })
      .andWhere('o.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(1)
      .getRawOne();

    // 3. Top 5 Productos
    const topProducts = await this.orderItemRepository.createQueryBuilder('item')
      .leftJoin('item.product', 'p')
      .leftJoin('item.order', 'o')
      .select('p.name', 'name')
      .addSelect('SUM(item.quantity)', 'quantity')
      .where('o.company.id = :companyId', { companyId })
      .andWhere('o.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('p.id')
      .addGroupBy('p.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(5)
      .getRawMany();

    // 4. Mejor Vendedor
    const topUser = await this.orderRepository.createQueryBuilder('o')
      .leftJoin('o.user', 'u')
      .select('u.fullName', 'name')
      .addSelect('COUNT(o.id)', 'salesCount')
      .addSelect('SUM(o.total)', 'totalGenerated')
      .where('o.company.id = :companyId', { companyId })
      .andWhere('o.createdAt BETWEEN :start AND :end', { start, end })
      .groupBy('u.id')
      .addGroupBy('u.fullName')
      .orderBy('SUM(o.total)', 'DESC')
      .limit(1)
      .getRawOne();

    // 5. Historial Detallado de Ventas
    const salesLog = await this.orderRepository.find({
      where: { 
        company: { id: companyId },
        createdAt: Between(start, end)
      },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' }
    });

    // 6. Gastos (Simulado: Si tienes la entidad Expense, usa su repositorio aquí)
    // const expenses = await this.expenseRepository.find(...)
    const expenses = await this.expenseRepository.find({
        where: { 
            company: { id: companyId },
            date: Between(start, end) 
        },
        relations: ['user'], // Para mostrar "Registrado por"
        order: { date: 'DESC' }
    }); 

    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    return {
      stats: {
        totalRevenue: parseFloat(stats.totalRevenue || '0'),
        totalSales: parseInt(stats.totalSales || '0'),
        averageTicket: parseFloat(stats.averageTicket || '0'),
      },
      topCategory: topCategory ? { name: topCategory.name, units: parseInt(topCategory.units) } : null,
      topProducts: topProducts.map(p => ({ name: p.name, quantity: parseInt(p.quantity) })),
      topUser: topUser ? { name: topUser.name, total: parseFloat(topUser.totalGenerated) } : null,
      salesLog: salesLog.map(s => ({
        id: s.id,
        date: s.createdAt,
        total: s.total,
        itemsCount: s.items.length
      })),
      expenses: expenses.map(e => ({
          description: e.description,
          date: e.date,
          amount: e.amount,
          user: e.user?.fullName || 'Sistema'
      })),
      totalExpenses
    };
  }
}