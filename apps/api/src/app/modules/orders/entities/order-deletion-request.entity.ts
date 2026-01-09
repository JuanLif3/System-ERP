import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('order_deletion_requests')
export class OrderDeletionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reason: string; // El motivo que escribe el vendedor

  @Column({ default: 'PENDING' }) // PENDING, REJECTED (Si se aprueba, la orden se borra y esto también)
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' }) // Si se borra la orden, se borra la solicitud
  order: Order;

  @ManyToOne(() => User)
  requestedBy: User; // Quién lo pidió

  @ManyToOne(() => Company)
  company: Company;
}