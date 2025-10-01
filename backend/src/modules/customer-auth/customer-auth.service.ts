import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CustomerAccount } from '../../entities/customer-account.entity';
import { Shipment } from '../../entities/shipment.entity';
import {
  CustomerLoginDto,
  CustomerNumberLoginDto,
  CustomerDirectAccessDto,
  CreateCustomerAccountDto,
  UpdateCustomerPasswordDto,
  CustomerChangePasswordDto,
  GenerateDirectLinkDto,
} from './dto/customer-login.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(CustomerAccount)
    private customerAccountRepository: Repository<CustomerAccount>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    private jwtService: JwtService,
  ) {}

  async validateCustomer(trackingNumber: string, password: string): Promise<any> {
    // First find customer without boolean conditions
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { trackingNumber },
      relations: ['shipments'],
    });

    // Check if customer exists and has the right permissions
    if (customerAccount && 
        customerAccount.isActive && 
        customerAccount.hasPortalAccess && 
        (await bcrypt.compare(password, customerAccount.passwordHash))) {
      const { passwordHash, ...result } = customerAccount;
      return result;
    }
    return null;
  }

  async validateCustomerByNumber(customerNumber: string, password: string): Promise<any> {
    // First find customer without boolean conditions
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { customerNumber },
      relations: ['shipments'],
    });

    // Check if customer exists and has the right permissions
    if (customerAccount && 
        customerAccount.isActive && 
        customerAccount.hasPortalAccess && 
        (await bcrypt.compare(password, customerAccount.passwordHash))) {
      const { passwordHash, ...result } = customerAccount;
      return result;
    }
    return null;
  }

  async login(loginDto: CustomerLoginDto) {
    const customer = await this.validateCustomer(loginDto.trackingNumber, loginDto.password);
    if (!customer) {
      throw new UnauthorizedException('Invalid tracking number or password');
    }

    // Update last login
    await this.customerAccountRepository.update(customer.id, {
      lastLogin: new Date(),
    });

    const payload = {
      trackingNumber: customer.trackingNumber,
      customerNumber: customer.customerNumber,
      sub: customer.id,
      type: 'customer',
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      customer: {
        id: customer.id,
        trackingNumber: customer.trackingNumber,
        customerNumber: customer.customerNumber,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        customerPhone: customer.customerPhone,
      },
    };
  }

  async loginWithCustomerNumber(loginDto: CustomerNumberLoginDto) {
    const customer = await this.validateCustomerByNumber(loginDto.customerNumber, loginDto.password);
    if (!customer) {
      throw new UnauthorizedException('Invalid customer number or password');
    }

    // Update last login
    await this.customerAccountRepository.update(customer.id, {
      lastLogin: new Date(),
    });

    const payload = {
      trackingNumber: customer.trackingNumber,
      customerNumber: customer.customerNumber,
      sub: customer.id,
      type: 'customer',
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      customer: {
        id: customer.id,
        trackingNumber: customer.trackingNumber,
        customerNumber: customer.customerNumber,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail,
        customerPhone: customer.customerPhone,
      },
    };
  }

  async loginWithDirectToken(directAccessDto: CustomerDirectAccessDto) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { 
        directAccessToken: directAccessDto.token,
        isActive: true,
      },
      relations: ['shipments'],
    });

    if (!customerAccount) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    // Check if token is expired
    if (customerAccount.tokenExpiresAt && customerAccount.tokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Access token has expired');
    }

    // Update last login
    await this.customerAccountRepository.update(customerAccount.id, {
      lastLogin: new Date(),
    });

    const payload = {
      trackingNumber: customerAccount.trackingNumber,
      sub: customerAccount.id,
      type: 'customer',
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      customer: {
        id: customerAccount.id,
        trackingNumber: customerAccount.trackingNumber,
        customerName: customerAccount.customerName,
        customerEmail: customerAccount.customerEmail,
        customerPhone: customerAccount.customerPhone,
      },
    };
  }

  /**
   * Generate unique customer number in format GH-XXXXXX
   */
  private async generateCustomerNumber(): Promise<string> {
    let customerNumber: string;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate 6-digit random number
      const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
      customerNumber = `GH-${randomNum}`;
      
      // Check if this customer number already exists
      const existing = await this.customerAccountRepository.findOne({
        where: { customerNumber },
      });
      
      if (!existing) {
        isUnique = true;
      }
    }
    
    return customerNumber;
  }

  async createCustomerAccount(createDto: CreateCustomerAccountDto) {
    // Check if tracking number already exists
    const existingAccount = await this.customerAccountRepository.findOne({
      where: { trackingNumber: createDto.trackingNumber },
    });

    if (existingAccount) {
      throw new ConflictException('Customer account with this tracking number already exists');
    }

    // Generate unique customer number
    const customerNumber = await this.generateCustomerNumber();

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createDto.password, saltRounds);

    const customerAccount = this.customerAccountRepository.create({
      trackingNumber: createDto.trackingNumber,
      customerNumber,
      passwordHash,
      customerName: createDto.customerName,
      customerEmail: createDto.customerEmail,
      customerPhone: createDto.customerPhone,
      notes: createDto.notes,
      hasPortalAccess: true, // Enable portal access by default for new customers
    });

    const savedAccount = await this.customerAccountRepository.save(customerAccount);
    const { passwordHash: _, ...result } = savedAccount;
    return result;
  }

  async updatePassword(trackingNumber: string, updateDto: UpdateCustomerPasswordDto) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { trackingNumber },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(updateDto.newPassword, saltRounds);

    await this.customerAccountRepository.update(customerAccount.id, {
      passwordHash,
    });

    return { message: 'Password updated successfully' };
  }

  async changePassword(customerId: string, changeDto: CustomerChangePasswordDto) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(changeDto.currentPassword, customerAccount.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(changeDto.newPassword, saltRounds);

    await this.customerAccountRepository.update(customerAccount.id, {
      passwordHash,
    });

    return { message: 'Password changed successfully' };
  }

  async generateDirectLink(trackingNumber: string, generateDto: GenerateDirectLinkDto) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { trackingNumber },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Generate secure token
    const directAccessToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + (generateDto.validHours || 24));

    await this.customerAccountRepository.update(customerAccount.id, {
      directAccessToken,
      tokenExpiresAt,
    });

    return {
      directLink: `/customer/direct-access?token=${directAccessToken}`,
      expiresAt: tokenExpiresAt,
    };
  }

  async getCustomerByTrackingNumber(trackingNumber: string) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { trackingNumber },
      relations: ['shipments'],
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    const { passwordHash, directAccessToken, ...result } = customerAccount;
    return result;
  }

  async getAllCustomerAccounts() {
    const accounts = await this.customerAccountRepository.find({
      relations: ['shipments'],
      order: { createdAt: 'DESC' },
    });

    return accounts.map(account => {
      const { passwordHash, directAccessToken, ...result } = account;
      return result;
    });
  }

  async deleteCustomerAccount(trackingNumber: string) {
    const customerAccount = await this.customerAccountRepository.findOne({
      where: { trackingNumber },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    await this.customerAccountRepository.remove(customerAccount);
    return { message: 'Customer account deleted successfully' };
  }
}
