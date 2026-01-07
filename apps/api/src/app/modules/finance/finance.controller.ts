import { Controller, Get } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Auth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('dashboard')
  getDashboard(@GetUser() user: User) {
    return this.financeService.getDashboardData(user);
  }
}