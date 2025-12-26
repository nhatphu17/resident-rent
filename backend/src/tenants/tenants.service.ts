import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto, createdByLandlordId: number) {
    const { name, phone, address, roomId, startDate, endDate, monthlyRent, deposit, notes } = createTenantDto;

    // Check if user with this phone already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    // Verify room belongs to landlord
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || room.landlordId !== createdByLandlordId) {
      throw new ConflictException('Phòng không thuộc về chủ trọ này');
    }

    // Check if room is available
    if (room.status !== 'available') {
      throw new ConflictException('Phòng không còn trống');
    }

    // Generate a temporary password (tenant can change it later)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Convert date strings to DateTime objects
    const contractStartDate = new Date(startDate);
    const contractEndDate = endDate ? new Date(endDate) : null;

    // Create user, tenant, and contract in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user first (using phone as identifier, no email)
      const user = await tx.user.create({
        data: {
          phone,
          password: hashedPassword,
          role: UserRole.TENANT,
          email: null, // No email for tenants
        },
      });

      // Create tenant profile
      const tenant = await tx.tenant.create({
        data: {
          userId: user.id,
          name,
          phone,
          address,
          createdByLandlordId,
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

      // Create contract automatically
      const contract = await tx.contract.create({
        data: {
          tenantId: tenant.id,
          roomId,
          startDate: contractStartDate,
          endDate: contractEndDate,
          monthlyRent,
          deposit: deposit || null,
          status: 'active',
          notes: notes || null,
          landlordId: createdByLandlordId,
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
      });

      // Update room status to occupied
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'occupied' },
      });

      return {
        ...tenant,
        contract,
        tempPassword, // Return temp password so landlord can share it with tenant
      };
    });

    return result;
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

  async findByPhone(phone: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        phone,
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

    return tenant;
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

    // Get all contracts for this tenant
    const tenantContracts = await this.prisma.contract.findMany({
      where: {
        tenantId: id,
        ...(landlordId ? { landlordId } : {}),
      },
      include: {
        room: true,
      },
    });

    // Delete tenant and related data, reset room statuses
    return this.prisma.$transaction(async (tx) => {
      // Get room IDs that need to be reset
      const roomIds = tenantContracts.map((c) => c.roomId);

      // Delete all contracts for this tenant
      await tx.contract.deleteMany({
        where: {
          tenantId: id,
          ...(landlordId ? { landlordId } : {}),
        },
      });

      // For each room, check if it has any other active contracts
      // If not, reset status to available
      for (const roomId of roomIds) {
        const otherActiveContracts = await tx.contract.findFirst({
          where: {
            roomId,
            status: 'active',
          },
        });

        if (!otherActiveContracts) {
          await tx.room.update({
            where: { id: roomId },
            data: { status: 'available' },
          });
        }
      }

      // Get user ID before deleting tenant
      const tenant = await tx.tenant.findUnique({
        where: { id },
        select: { userId: true },
      });

      // Delete tenant
      await tx.tenant.delete({
        where: { id },
      });

      // Delete user account
      if (tenant) {
        await tx.user.delete({
          where: { id: tenant.userId },
        });
      }

      return { success: true, message: 'Tenant and related data deleted, room statuses updated' };
    });
  }
}


