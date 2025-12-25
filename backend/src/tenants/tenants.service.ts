import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const { email, name, phone, address } = createTenantDto;

    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate a temporary password (tenant can change it later)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user first
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.TENANT,
        phone,
      },
    });

    // Create tenant profile
    const tenant = await this.prisma.tenant.create({
      data: {
        userId: user.id,
        name,
        phone,
        address,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return {
      ...tenant,
      tempPassword, // Return temp password so landlord can share it with tenant
    };
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
        contracts: {
          include: {
            room: true,
            landlord: true,
          },
        },
        invoices: {
          include: {
            room: true,
            contract: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async findByUserId(userId: number) {
    return this.prisma.tenant.findUnique({
      where: { userId },
    });
  }

  async update(id: number, updateTenantDto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  async remove(id: number) {
    return this.prisma.tenant.delete({
      where: { id },
    });
  }
}


