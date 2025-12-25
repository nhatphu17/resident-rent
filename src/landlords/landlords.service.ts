import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLandlordDto } from './dto/create-landlord.dto';
import { UpdateLandlordDto } from './dto/update-landlord.dto';

@Injectable()
export class LandlordsService {
  constructor(private prisma: PrismaService) {}

  async create(createLandlordDto: CreateLandlordDto) {
    return this.prisma.landlord.create({
      data: createLandlordDto,
    });
  }

  async findAll() {
    return this.prisma.landlord.findMany({
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
    const landlord = await this.prisma.landlord.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
        rooms: true,
        contracts: {
          include: {
            tenant: true,
            room: true,
          },
        },
      },
    });

    if (!landlord) {
      throw new NotFoundException(`Landlord with ID ${id} not found`);
    }

    return landlord;
  }

  async findByUserId(userId: number) {
    return this.prisma.landlord.findUnique({
      where: { userId },
    });
  }

  async update(id: number, updateLandlordDto: UpdateLandlordDto) {
    return this.prisma.landlord.update({
      where: { id },
      data: updateLandlordDto,
    });
  }

  async remove(id: number) {
    return this.prisma.landlord.delete({
      where: { id },
    });
  }
}


