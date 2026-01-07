import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; // <--- Importar bcrypt

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUserCompanyId: string) { // Recibimos el companyId del admin
    const { password, ...userData } = createUserDto;

    // Verificar si el email ya existe
    const existing = await this.userRepository.findOneBy({ email: userData.email });
    if (existing) throw new BadRequestException('El correo ya está registrado');

    // Hashear password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      company: { id: currentUserCompanyId }, // Asignar a la misma empresa del admin
    });

    return await this.userRepository.save(user);
  }

  async findAll(companyId: string) {
    return this.userRepository.find({
      where: { company: { id: companyId } },
      order: { fullName: 'ASC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
