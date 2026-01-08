import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanySaasDto } from './dto/create-company-saas.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRoles } from '../../common/enums/roles.enum';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('saas/create')
  @Auth(UserRoles.SUPER_ADMIN) 
  createSaaS(@Body() dto: CreateCompanySaasDto) {
    return this.companiesService.createCompanySaaS(dto);
  }

  @Get()
  @Auth(UserRoles.SUPER_ADMIN) // Solo Super Admin ve todas las empresas
  findAll() {
    return this.companiesService.findAll();
  }

  @Patch(':id/status')
  @Auth(UserRoles.SUPER_ADMIN) // Solo Super Admin bloquea empresas
  toggleStatus(@Param('id') id: string) {
    return this.companiesService.toggleStatus(id);
  }
}