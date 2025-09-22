import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserRole } from '../../entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all users with pagination and filters (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: UserRole,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const activeFilter = isActive !== undefined ? isActive === 'true' : undefined;
    return this.usersService.findAll(pageNum, limitNum, role, search, activeFilter);
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, updateUserDto, req.user.userId, req.user.role);
  }

  @Patch(':id/toggle-status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Toggle user active status (Admin only)' })
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Patch(':id/change-role')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Change user role (Admin only)' })
  changeRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.changeRole(id, role);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(id, req.user.userId);
  }
}
