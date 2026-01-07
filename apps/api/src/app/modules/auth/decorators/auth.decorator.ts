import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export function Auth() {
  return applyDecorators(
    UseGuards(AuthGuard('jwt')), // Usa la estrategia JWT que creamos antes
  );
}