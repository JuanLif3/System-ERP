import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { Company } from '../../companies/entities/company.entity';
import { Category } from '../../categories/entities/category.entity'; // Aún no la configuramos, pero la dejamos lista

@Entity('products')
export class Product extends AbstractEntity {
  @Column('text')
  name: string;

  @Column('text') // El SKU debería ser único, pero SOLO dentro de la misma empresa. Lo validaremos en lógica.
  sku: string; 

  @Column('float', { default: 0 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { nullable: true })
  imageUrl: string;

  // Lógica de caducidad
  @Column('boolean', { default: false })
  hasExpiryDate: boolean;

  @Column('timestamp', { nullable: true })
  expiryDate: Date;

  @Column('boolean', { default: true })
  isActive: boolean;

  // RELACIÓN MULTI-TENANT: El producto pertenece a una empresa
  @ManyToOne(() => Company, (company) => company.products)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Category, (category) => category.products, { eager: true }) 
  // eager: true hace que cuando busques un producto, traiga automáticamente la categoría
  @JoinColumn({ name: 'category_id' })
  category: Category;
}