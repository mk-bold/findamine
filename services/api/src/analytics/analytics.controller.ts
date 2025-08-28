import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('login-attempts')
  async getLoginAttempts(
    @Query('userId') userId?: string,
    @Query('email') email?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.analyticsService.getLoginAttempts(userId, email, limitNum);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('page-views')
  async getPageViews(
    @Query('userId') userId?: string,
    @Query('pageName') pageName?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.analyticsService.getPageViews(userId, pageName, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-activity')
  async getMyActivity(@Request() req: any) {
    const userId = req.user.id;
    const limit = 50;

    const [loginAttempts, pageViews] = await Promise.all([
      this.analyticsService.getLoginAttempts(userId, undefined, limit),
      this.analyticsService.getPageViews(userId, undefined, limit),
    ]);

    return {
      loginAttempts,
      pageViews,
    };
  }
}
