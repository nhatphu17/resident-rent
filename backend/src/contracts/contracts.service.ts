import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(landlordId: number, createContractDto: CreateContractDto) {
    // Verify room belongs to landlord
    const room = await this.prisma.room.findUnique({
      where: { id: createContractDto.roomId },
    });

    if (!room || room.landlordId !== landlordId) {
      throw new ForbiddenException('Room does not belong to this landlord');
    }

    // Check if room is available
    if (room.status !== 'available') {
      throw new ForbiddenException('Room is not available');
    }

    // Convert date strings to DateTime objects
    const startDate = new Date(createContractDto.startDate);
    const endDate = createContractDto.endDate ? new Date(createContractDto.endDate) : null;

    // Create contract and update room status in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          tenantId: createContractDto.tenantId,
          roomId: createContractDto.roomId,
          startDate: startDate,
          endDate: endDate,
          monthlyRent: createContractDto.monthlyRent,
          deposit: createContractDto.deposit,
          status: createContractDto.status || 'active',
          notes: createContractDto.notes,
          landlordId,
        },
        include: {
          tenant: true,
          room: true,
          landlord: true,
        },
      });

      // Update room status to occupied
      await tx.room.update({
        where: { id: createContractDto.roomId },
        data: { status: 'occupied' },
      });

      return contract;
    });

    return result;
  }

  async findAll(landlordId?: number, tenantId?: number) {
    const where: any = {};
    if (landlordId) where.landlordId = landlordId;
    if (tenantId) where.tenantId = tenantId;

    return this.prisma.contract.findMany({
      where,
      include: {
        tenant: true,
        room: true,
        landlord: true,
        invoices: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' },
          ],
        },
      },
    });
  }

  async findOne(id: number, landlordId?: number, tenantId?: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        tenant: true,
        room: true,
        landlord: true,
        invoices: true,
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    if (landlordId && contract.landlordId !== landlordId) {
      throw new ForbiddenException('Access denied');
    }

    if (tenantId && contract.tenantId !== tenantId) {
      throw new ForbiddenException('Access denied');
    }

    return contract;
  }

  async update(id: number, landlordId: number, updateContractDto: UpdateContractDto) {
    const contract = await this.findOne(id, landlordId);
    
    // Convert date strings to DateTime objects if provided
    const updateData: any = { ...updateContractDto };
    if (updateContractDto.startDate) {
      updateData.startDate = new Date(updateContractDto.startDate);
    }
    if (updateContractDto.endDate) {
      updateData.endDate = new Date(updateContractDto.endDate);
    }
    
    return this.prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        tenant: true,
        room: true,
        landlord: true,
      },
    });
  }

  async remove(id: number, landlordId: number) {
    const contract = await this.findOne(id, landlordId);
    return this.prisma.contract.delete({
      where: { id },
    });
  }
}


