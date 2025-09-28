import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CustomerAccount } from '../../entities/customer-account.entity';
import { Shipment } from '../../entities/shipment.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomerManagementService {
  constructor(
    @InjectRepository(CustomerAccount)
    private customerAccountRepository: Repository<CustomerAccount>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
  ) {}

  async getAllCustomers(page: number = 1, limit: number = 20, search?: string, status?: string) {
    const queryBuilder = this.customerAccountRepository.createQueryBuilder('customer');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(customer.trackingNumber LIKE :search OR customer.customerName LIKE :search OR customer.customerEmail LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply status filter
    if (status !== undefined) {
      const isActive = status === 'active';
      if (search) {
        queryBuilder.andWhere('customer.isActive = :isActive', { isActive });
      } else {
        queryBuilder.where('customer.isActive = :isActive', { isActive });
      }
    }

    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by creation date
    queryBuilder.orderBy('customer.createdAt', 'DESC');

    const [customers, total] = await queryBuilder.getManyAndCount();

    // Get shipment counts for each customer
    const customersWithCounts = await Promise.all(
      customers.map(async (customer) => {
        const shipmentCount = await this.shipmentRepository.count({
          where: { customerAccountId: customer.id },
        });

        return {
          ...customer,
          shipmentCount,
          passwordHash: undefined, // Don't expose password hash
        };
      })
    );

    return {
      customers: customersWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(customerId: string) {
    const customer = await this.customerAccountRepository.findOne({
      where: { id: customerId },
      relations: ['shipments'],
    });

    if (!customer) {
      throw new NotFoundException('Customer account not found');
    }

    const shipmentCount = await this.shipmentRepository.count({
      where: { customerAccountId: customerId },
    });

    const activeShipmentCount = await this.shipmentRepository.count({
      where: {
        customerAccountId: customerId,
        status: 'in_transit' as any,
      },
    });

    return {
      ...customer,
      passwordHash: undefined, // Don't expose password hash
      statistics: {
        totalShipments: shipmentCount,
        activeShipments: activeShipmentCount,
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

  async createCustomer(
    createCustomerDto: {
      trackingNumber: string;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      password: string;
    },
    adminId: string,
  ) {
    // Check if customer with tracking number already exists
    const existingCustomer = await this.customerAccountRepository.findOne({
      where: { trackingNumber: createCustomerDto.trackingNumber },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this tracking number already exists');
    }

    // Generate unique customer number
    const customerNumber = await this.generateCustomerNumber();

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createCustomerDto.password, saltRounds);

    // Create customer account
    const customerAccount = this.customerAccountRepository.create({
      trackingNumber: createCustomerDto.trackingNumber.toUpperCase(),
      customerNumber,
      passwordHash,
      customerName: createCustomerDto.customerName,
      customerEmail: createCustomerDto.customerEmail,
      customerPhone: createCustomerDto.customerPhone || '',
      isActive: true,
      directAccessToken: null,
      tokenExpiresAt: null,
      lastLogin: null,
    });

    const savedCustomer = await this.customerAccountRepository.save(customerAccount);

    return {
      id: savedCustomer.id,
      trackingNumber: savedCustomer.trackingNumber,
      customerNumber: savedCustomer.customerNumber,
      customerName: savedCustomer.customerName,
      customerEmail: savedCustomer.customerEmail,
      customerPhone: savedCustomer.customerPhone,
      isActive: savedCustomer.isActive,
      createdAt: savedCustomer.createdAt,
      message: 'Customer account created successfully',
    };
  }

  async updateCustomer(
    customerId: string,
    updateCustomerDto: {
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      isActive?: boolean;
    },
    adminId: string,
  ) {
    const customer = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer account not found');
    }

    // Update customer fields
    if (updateCustomerDto.customerName !== undefined) {
      customer.customerName = updateCustomerDto.customerName;
    }
    if (updateCustomerDto.customerEmail !== undefined) {
      customer.customerEmail = updateCustomerDto.customerEmail;
    }
    if (updateCustomerDto.customerPhone !== undefined) {
      customer.customerPhone = updateCustomerDto.customerPhone;
    }
    if (updateCustomerDto.isActive !== undefined) {
      customer.isActive = updateCustomerDto.isActive;
    }

    const updatedCustomer = await this.customerAccountRepository.save(customer);

    return {
      id: updatedCustomer.id,
      trackingNumber: updatedCustomer.trackingNumber,
      customerName: updatedCustomer.customerName,
      customerEmail: updatedCustomer.customerEmail,
      customerPhone: updatedCustomer.customerPhone,
      isActive: updatedCustomer.isActive,
      updatedAt: updatedCustomer.updatedAt,
      message: 'Customer account updated successfully',
    };
  }

  async resetCustomerPassword(customerId: string, newPassword: string, adminId: string) {
    const customer = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer account not found');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    customer.passwordHash = passwordHash;
    await this.customerAccountRepository.save(customer);

    return {
      message: 'Customer password reset successfully',
      customerId: customer.id,
      trackingNumber: customer.trackingNumber,
    };
  }

  async generateDirectLink(customerId: string, expiresInHours: number, adminId: string) {
    const customer = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer account not found');
    }

    // Generate direct access token
    const directAccessToken = uuidv4();
    const directAccessExpiry = new Date();
    directAccessExpiry.setHours(directAccessExpiry.getHours() + expiresInHours);

    // Update customer with direct access token
    customer.directAccessToken = directAccessToken;
    customer.tokenExpiresAt = directAccessExpiry;
    await this.customerAccountRepository.save(customer);

    // Generate the direct link
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const directLink = `${baseUrl}/customer/login?token=${directAccessToken}`;

    return {
      directLink,
      token: directAccessToken,
      expiresAt: directAccessExpiry,
      customerId: customer.id,
      trackingNumber: customer.trackingNumber,
      customerName: customer.customerName,
      message: 'Direct access link generated successfully',
    };
  }

  async getCustomerShipments(customerId: string, page: number = 1, limit: number = 10) {
    const customer = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer account not found');
    }

    const offset = (page - 1) * limit;

    const [shipments, total] = await this.shipmentRepository.findAndCount({
      where: { customerAccountId: customerId },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      customer: {
        id: customer.id,
        trackingNumber: customer.trackingNumber,
        customerName: customer.customerName,
      },
    };
  }

  async deleteCustomer(customerId: string, adminId: string) {
    const customer = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer account not found');
    }

    // Check if customer has shipments
    const shipmentCount = await this.shipmentRepository.count({
      where: { customerAccountId: customerId },
    });

    if (shipmentCount > 0) {
      throw new BadRequestException(
        'Cannot delete customer account with existing shipments. Please remove or reassign shipments first.'
      );
    }

    await this.customerAccountRepository.remove(customer);

    return {
      message: 'Customer account deleted successfully',
      deletedCustomerId: customerId,
      trackingNumber: customer.trackingNumber,
    };
  }

  async getCustomerActivityLog(customerId: string, page: number = 1, limit: number = 20) {
    const customer = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer account not found');
    }

    // For now, return basic activity information
    // In a real implementation, you would have an activity log table
    const activities = [
      {
        id: '1',
        action: 'Account Created',
        timestamp: customer.createdAt,
        details: 'Customer account was created',
      },
      ...(customer.lastLogin ? [{
        id: '2',
        action: 'Last Login',
        timestamp: customer.lastLogin,
        details: 'Customer logged into portal',
      }] : []),
    ];

    return {
      activities,
      pagination: {
        page: 1,
        limit: activities.length,
        total: activities.length,
        totalPages: 1,
      },
      customer: {
        id: customer.id,
        trackingNumber: customer.trackingNumber,
        customerName: customer.customerName,
      },
    };
  }

  async changeCustomerPassword(customerId: string, newPassword: string, adminId: string) {
    const customer = await this.customerAccountRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.customerAccountRepository.update(customerId, {
      passwordHash,
    });

    return {
      message: 'Password changed successfully',
      customer: {
        id: customer.id,
        trackingNumber: customer.trackingNumber,
        customerName: customer.customerName,
      },
    };
  }
}
