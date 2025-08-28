import { Controller, Get, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService, UpdateUserDto } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard, Roles, Role } from '../common/guards/role.guard';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('users')
  @Roles(Role.ADMIN)
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      search,
    );
  }

  @Get('users/:id')
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @Roles(Role.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateData);
  }

  @Put('users/:id/promote')
  @Roles(Role.ADMIN)
  async promoteUser(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.adminService.promoteUser(id, role);
  }

  @Put('users/:id/activate')
  @Roles(Role.ADMIN)
  async activateUser(@Param('id') id: string) {
    return this.adminService.activateUser(id);
  }

  @Put('users/:id/deactivate')
  @Roles(Role.ADMIN)
  async deactivateUser(@Param('id') id: string) {
    return this.adminService.deactivateUser(id);
  }

  @Delete('users/:id')
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
} 