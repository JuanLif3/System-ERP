import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';

@Auth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @GetUser() user: User) {
    // Pasamos el ID de la compañia del administrador que está creando al usuario
    return this.usersService.create(createUserDto, user.company.id);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.usersService.findAll(user.company.id);
  }
}