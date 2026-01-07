import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { OrderItem } from './order-item.entity';

// Estados posibles de la orden
export enum OrderStatus {
  PENDING = 'PENDING',   // Carrito abierto (opcional si lo implementamos)
  COMPLETED = 'COMPLETED', // Venta realizada
  CANCELED = 'CANCELED', // Venta anulada
}

@Entity('orders')
export class Order extends AbstractEntity {
  @Column('float')
  total: number; // La suma de todos los items

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.COMPLETED, // Por ahora asumimos venta directa
  })
  status: OrderStatus;

  // Vendedor que hizo la venta
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Multi-tenancy: La venta pertenece a la empresa
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // Los items de la venta
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}