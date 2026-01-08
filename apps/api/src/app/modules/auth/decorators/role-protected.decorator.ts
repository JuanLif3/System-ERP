import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../../../common/enums/roles.enum';

export const META_ROLES = 'roles';

// Esto permite recibir una lista de roles (Ej: ADMIN, SELLER)
export const RoleProtected = (...args: UserRoles[]) => {
    return SetMetadata(META_ROLES, args);
};