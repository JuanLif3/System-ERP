import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Importar
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense } from './entities/expense.entity'; // <--- Importar Entidad
import { AuthModule } from '../auth/auth.module'; // <--- Importar Auth

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    AuthModule
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}