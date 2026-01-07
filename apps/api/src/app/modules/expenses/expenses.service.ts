import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, user: User) {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      company: user.company,
      user: user, // Registramos quién subió el gasto
    });

    return await this.expenseRepository.save(expense);
  }

  async findAll(user: User) {
    return this.expenseRepository.find({
      where: { company: { id: user.company.id } },
      order: { date: 'DESC' },
    });
  }

  // Puedes implementar remove() más adelante si quieres borrar gastos
}