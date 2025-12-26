import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GeocodingService } from '../geocoding/geocoding.service';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private geocodingService: GeocodingService,
  ) {}

  async create(landlordId: number, createRoomDto: CreateRoomDto) {
    // Auto-geocode if address is provided but coordinates are not
    let latitude = createRoomDto.latitude;
    let longitude = createRoomDto.longitude;

    if ((!latitude || !longitude) && (createRoomDto.ward || createRoomDto.province)) {
      const coordinates = await this.geocodingService.geocodeRoomAddress(
        createRoomDto.ward,
        createRoomDto.province,
      );

      if (coordinates) {
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
      }
    }

    return this.prisma.room.create({
      data: {
        ...createRoomDto,
        latitude,
        longitude,
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
        latitude: true,
        longitude: true,
        qrCodeImage: true,
        images: true,
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
        latitude: true,
        longitude: true,
        qrCodeImage: true,
        images: true,
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
    
    // Auto-geocode if address is updated but coordinates are not provided
    let latitude = updateRoomDto.latitude;
    let longitude = updateRoomDto.longitude;

    // Check if address fields are being updated
    const wardChanged = updateRoomDto.ward !== undefined && updateRoomDto.ward !== room.ward;
    const provinceChanged = updateRoomDto.province !== undefined && updateRoomDto.province !== room.province;
    const addressChanged = wardChanged || provinceChanged;

    // If coordinates are not provided but address fields are updated, geocode
    if ((!latitude || !longitude) && addressChanged) {
      const finalWard = updateRoomDto.ward ?? room.ward ?? undefined;
      const finalProvince = updateRoomDto.province ?? room.province ?? undefined;
      
      if (finalWard || finalProvince) {
        const coordinates = await this.geocodingService.geocodeRoomAddress(
          finalWard,
          finalProvince,
        );

        if (coordinates) {
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;
        }
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        ...updateRoomDto,
        latitude: latitude !== undefined ? latitude : room.latitude,
        longitude: longitude !== undefined ? longitude : room.longitude,
      },
    });
  }

  async remove(id: number, landlordId: number) {
    const room = await this.findOne(id, landlordId);
    return this.prisma.room.delete({
      where: { id },
    });
  }
}


