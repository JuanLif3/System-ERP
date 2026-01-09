import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamp' }) // Fecha del gasto
  date: Date;

  @ManyToOne(() => Company)
  company: Company;

  @ManyToOne(() => User, { nullable: true }) // Quién lo registró
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}