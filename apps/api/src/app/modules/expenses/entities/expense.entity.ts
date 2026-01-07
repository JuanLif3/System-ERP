import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

@Entity('expenses')
export class Expense extends AbstractEntity {
  @Column('float')
  amount: number;

  @Column('text')
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date; // Fecha del gasto real

  // Relación Multi-tenant
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // Quién registró el gasto (Auditoría)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}