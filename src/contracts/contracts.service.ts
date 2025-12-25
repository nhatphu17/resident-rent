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

    return this.prisma.contract.create({
      data: {
        ...createContractDto,
        landlordId,
      },
      include: {
        tenant: true,
        room: true,
        landlord: true,
      },
    });
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
    return this.prisma.contract.update({
      where: { id },
      data: updateContractDto,
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


