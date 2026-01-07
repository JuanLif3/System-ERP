import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    // Extraer la request de la petición HTTP
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found in request (AuthGuard called?)');
    }

    // Si pasamos un parámetro (ej: @GetUser('email')), devolvemos solo ese campo
    return data ? user[data] : user;
  },
);