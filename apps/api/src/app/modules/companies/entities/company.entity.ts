import { Entity, Column } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";

@Entity({ name: 'companies' })
export class Company extends AbstractEntity {
    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 20, unique: true }) // RUT único en todo el sistema
    rut: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    phone: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}