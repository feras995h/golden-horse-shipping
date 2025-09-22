import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '../../entities/user.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email }
      ]
    });

    if (existingUser) {
      throw new BadRequestException('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: UserRole,
    search?: string,
    isActive?: boolean,
  ) {
    // Ensure page and limit are numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply filters
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.fullName LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply pagination
    const skip = (pageNum - 1) * limitNum;
    queryBuilder.skip(skip).take(limitNum);

    // Order by creation date
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Execute query
    const [users, total] = await queryBuilder.getManyAndCount();

    // Remove passwords from results
    const sanitizedUsers = users.map(user => {
      const { password, ...result } = user;
      return result;
    });

    return {
      users: sanitizedUsers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findOne(id: string, requesterId: string, requesterRole: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only view their own profile unless they're admin
    if (requesterRole !== UserRole.ADMIN && id !== requesterId) {
      throw new ForbiddenException('Access denied');
    }

    const { password, ...result } = user;
    return result as User;
  }

  async update(
    id: string, 
    updateUserDto: UpdateUserDto, 
    requesterId: string, 
    requesterRole: UserRole
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only update their own profile unless they're admin
    if (requesterRole !== UserRole.ADMIN && id !== requesterId) {
      throw new ForbiddenException('Access denied');
    }

    // Non-admin users cannot change role or isActive status
    if (requesterRole !== UserRole.ADMIN) {
      delete updateUserDto.role;
      delete updateUserDto.isActive;
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async toggleStatus(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, { isActive: !user.isActive });
    
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async changeRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(id, { role });
    
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-deletion
    if (id === requesterId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    await this.userRepository.remove(user);
  }

  async getStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    const adminUsers = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
    const operatorUsers = await this.userRepository.count({ where: { role: UserRole.OPERATOR } });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      operatorUsers,
    };
  }
}
