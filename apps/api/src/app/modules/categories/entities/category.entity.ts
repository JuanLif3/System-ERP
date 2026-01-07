import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { Company } from '../../companies/entities/company.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category extends AbstractEntity {
  @Column('varchar', { length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  // RELACIÓN MULTI-TENANT
  @ManyToOne(() => Company, (company) => company.categories)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // Una categoría tiene muchos productos
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}