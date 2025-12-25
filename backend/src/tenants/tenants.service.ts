import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto, createdByLandlordId?: number) {
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
        createdByLandlordId: createdByLandlordId || null,
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

  async findAllByLandlord(landlordId: number) {
    // Get all tenants that:
    // 1. Have contracts with this landlord's rooms, OR
    // 2. Were created by this landlord (even if no contract yet)
    const contracts = await this.prisma.contract.findMany({
      where: {
        landlordId,
      },
      select: {
        tenantId: true,
      },
      distinct: ['tenantId'],
    });

    const tenantIdsFromContracts = contracts.map((c) => c.tenantId);

    // Get tenants created by this landlord
    const tenantsCreatedByLandlord = await this.prisma.tenant.findMany({
      where: {
        createdByLandlordId: landlordId,
      },
      select: {
        id: true,
      },
    });

    const tenantIdsCreated = tenantsCreatedByLandlord.map((t) => t.id);

    // Combine both lists
    const allTenantIds = [...new Set([...tenantIdsFromContracts, ...tenantIdsCreated])];

    if (allTenantIds.length === 0) {
      return [];
    }

    return this.prisma.tenant.findMany({
      where: {
        id: {
          in: allTenantIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
        contracts: {
          where: {
            landlordId,
          },
          include: {
            room: {
              select: {
                id: true,
                roomNumber: true,
                floor: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
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

  async remove(id: number, landlordId?: number) {
    // If landlordId is provided, verify tenant belongs to this landlord
    if (landlordId) {
      const contracts = await this.prisma.contract.findFirst({
        where: {
          tenantId: id,
          landlordId,
        },
      });

      if (!contracts) {
        throw new NotFoundException('Tenant does not belong to this landlord');
      }
    }

    return this.prisma.tenant.delete({
      where: { id },
    });
  }
}


