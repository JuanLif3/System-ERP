import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "../../../common/entities/abstract.entity";
import { UserRoles } from "../../../common/enums/roles.enum";
import { Company } from "../../companies/entities/company.entity";

@Entity('users')
export class User extends AbstractEntity {
    @Column({ type: 'varchar', length: 150 })
    fullName: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ type: 'varchar' })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRoles,
        default: UserRoles.SELLER,
    })
    roles: UserRoles;

    // RELACIÓN CRÍTICA PARA MULTI-TENANCY
    // Un usuario pertenece a UNA empresa.
    @ManyToOne(() => Company, (company) => company.users)
    @JoinColumn({ name: 'company_id' })
    company: Company;
    isActive: any;
}
