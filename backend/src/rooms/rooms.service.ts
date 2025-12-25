import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(landlordId: number, createRoomDto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        ...createRoomDto,
        landlordId,
      },
    });
  }

  async findAll(landlordId?: number) {
    const where = landlordId ? { landlordId } : {};
    return this.prisma.room.findMany({
      where,
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
          },
        },
        contracts: {
          where: {
            status: 'active',
          },
          include: {
            tenant: true,
          },
        },
      },
    });
  }

  async findOne(id: number, landlordId?: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        landlord: true,
        contracts: {
          include: {
            tenant: true,
          },
        },
        usages: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' },
          ],
          take: 12,
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    if (landlordId && room.landlordId !== landlordId) {
      throw new ForbiddenException('Access denied');
    }

    return room;
  }

  async update(id: number, landlordId: number, updateRoomDto: UpdateRoomDto) {
    const room = await this.findOne(id, landlordId);
    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
    });
  }

  async remove(id: number, landlordId: number) {
    const room = await this.findOne(id, landlordId);
    return this.prisma.room.delete({
      where: { id },
    });
  }
}


