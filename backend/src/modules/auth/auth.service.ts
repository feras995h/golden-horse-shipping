import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: [{ username }, { email: username }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return result as User;
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(userId, updateData);
    return this.findById(userId);
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedNewPassword });
  }
}
