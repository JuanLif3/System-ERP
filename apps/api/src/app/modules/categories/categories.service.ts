import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: User) {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      company: user.company,
    });
    return await this.categoryRepository.save(category);
  }

  async findAll(user: User) {
    return await this.categoryRepository.find({
      where: { company: { id: user.company.id } },
      order: { createdAt: 'DESC' },
    });
  }

  // ... Implementa findOne, update, remove usando lógica similar

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
