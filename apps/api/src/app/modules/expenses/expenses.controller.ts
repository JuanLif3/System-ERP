import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('expenses')
@UseGuards(AuthGuard('jwt'))
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @GetUser() user: User) {
    return this.expensesService.create(createExpenseDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.expensesService.findAll(user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateExpenseDto: UpdateExpenseDto,
    @GetUser() user: User
  ) {
    return this.expensesService.update(id, updateExpenseDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.expensesService.remove(id, user);
  }
}