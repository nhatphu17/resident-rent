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

  async findAvailableRooms() {
    return this.prisma.room.findMany({
      where: {
        status: 'available',
      },
      select: {
        id: true,
        roomNumber: true,
        floor: true,
        area: true,
        price: true,
        electricPrice: true,
        waterPrice: true,
        description: true,
        ward: true,
        district: true,
        province: true,
        qrCodeImage: true,
        // images: true, // Uncomment after running migration: npx prisma migrate dev && npx prisma generate
        landlord: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOnePublic(id: number) {
    const room = await this.prisma.room.findFirst({
      where: { id, status: 'available' },
      select: {
        id: true,
        roomNumber: true,
        floor: true,
        area: true,
        price: true,
        electricPrice: true,
        waterPrice: true,
        description: true,
        ward: true,
        district: true,
        province: true,
        qrCodeImage: true,
        // images: true, // Uncomment after running migration: npx prisma migrate dev && npx prisma generate
        landlord: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found or not available`);
    }

    return room;
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


