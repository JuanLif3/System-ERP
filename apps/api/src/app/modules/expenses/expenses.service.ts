import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  // CREAR
  async create(createExpenseDto: CreateExpenseDto, user: User) {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      company: user.company,
      user: user, // Registramos quién creó el gasto
    });
    return await this.expenseRepository.save(expense);
  }

  // LISTAR (Solo de mi empresa)
  async findAll(user: User) {
    return await this.expenseRepository.find({
      where: { company: { id: user.company.id } },
      order: { date: 'DESC' },
      relations: ['user'] // Para mostrar nombre del usuario
    });
  }

  // EDITAR
  async update(id: string, updateExpenseDto: UpdateExpenseDto, user: User) {
    // 1. Buscar asegurando que sea de la empresa
    const expense = await this.expenseRepository.findOne({
      where: { id, company: { id: user.company.id } }
    });

    if (!expense) throw new NotFoundException('Gasto no encontrado');

    // 2. Actualizar
    const updated = this.expenseRepository.merge(expense, updateExpenseDto);
    return await this.expenseRepository.save(updated);
  }

  // ELIMINAR
  async remove(id: string, user: User) {
    const expense = await this.expenseRepository.findOne({
      where: { id, company: { id: user.company.id } }
    });

    if (!expense) throw new NotFoundException('Gasto no encontrado');

    return await this.expenseRepository.remove(expense);
  }
}