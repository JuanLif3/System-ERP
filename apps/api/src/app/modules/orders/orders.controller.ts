import { Controller, Get, Post, Body, Param, Delete, UseGuards, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: User) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.ordersService.findAll(user);
  }

  // --- SOLICITUDES ---
  
  @Post(':id/request-delete')
  requestDeletion(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @GetUser() user: User
  ) {
    return this.ordersService.requestDeletion(id, reason, user);
  }

  @Get('requests/pending')
  getPendingRequests(@GetUser() user: User) {
    return this.ordersService.getPendingRequests(user);
  }

  // --- CORRECCIÓN AQUÍ ---
  // Antes estaba: @Body('action') body... return ... body.action
  // Ahora tomamos el valor directo:
  @Patch('requests/:id/resolve')
  resolveRequest(
    @Param('id') id: string,
    @Body('action') action: 'APPROVE' | 'REJECT' 
  ) {
    // Pasamos 'action' directamente porque @Body('action') ya extrajo el valor (ej: "APPROVE")
    return this.ordersService.resolveRequest(id, action);
  }

  // --- BORRADO DIRECTO ---
  @Delete(':id')
  remove(
    @Param('id') id: string, 
    @GetUser() user: User
  ) {
    return this.ordersService.remove(id, user);
  }
}