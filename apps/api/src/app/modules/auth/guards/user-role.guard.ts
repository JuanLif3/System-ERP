import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../../users/entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    // 1. Obtener los roles permitidos desde el decorador @Auth(...)
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());

    // 2. Si no hay roles definidos (ej: @Auth() vacío), dejamos pasar a cualquiera que esté logueado
    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;

    // 3. Obtener el usuario de la request (puesto ahí por AuthGuard('jwt'))
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if ( !user ) 
      throw new BadRequestException('User not found');

    // 4. Verificar si el rol del usuario está en la lista de roles permitidos
    // Nota: Como tu usuario tiene un solo rol (string), comparamos directo.
    // Si tuvieras array de roles, usaríamos user.roles.some(...)
    if ( validRoles.includes( user.roles ) ) {
      return true;
    }

    throw new ForbiddenException(
      `User ${ user.fullName } need a valid role: [${ validRoles }]`
    );
  }
}