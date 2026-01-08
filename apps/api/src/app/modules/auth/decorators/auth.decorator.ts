import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoles } from '../../../common/enums/roles.enum';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role.guard';

// Usamos ...roles para aceptar 0, 1 o muchos roles
export function Auth(...roles: UserRoles[]) {
  return applyDecorators(
    RoleProtected(...roles), // 1. Guardamos los roles requeridos en metadatos
    UseGuards(AuthGuard('jwt'), UserRoleGuard), // 2. Ejecutamos JWT y luego validación de Rol
  );
}