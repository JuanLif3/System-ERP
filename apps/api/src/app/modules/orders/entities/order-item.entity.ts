import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity'; // La crearemos en el siguiente paso

@Entity('order_items')
export class OrderItem extends AbstractEntity {
  @Column('int')
  quantity: number;

  @Column('float')
  price: number; // PRECIO SNAPSHOT (El precio al momento de la venta)

  // Relación con el Producto (Para saber qué vendimos)
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Relación con la Orden Padre
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}