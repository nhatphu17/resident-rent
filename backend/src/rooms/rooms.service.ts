import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { GeocodingService } from '../geocoding/geocoding.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private geocodingService: GeocodingService,
    private uploadService: UploadService,
  ) {}

  async create(landlordId: number, createRoomDto: CreateRoomDto) {
    // Auto-geocode if address is provided but coordinates are not
    let latitude = createRoomDto.latitude;
    let longitude = createRoomDto.longitude;

    if ((!latitude || !longitude || latitude === 0 || longitude === 0) && (createRoomDto.ward || createRoomDto.province)) {
      const coordinates = await this.geocodingService.geocodeRoomAddress(
        createRoomDto.ward,
        createRoomDto.province,
      );

      if (coordinates) {
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
      }
    }

    // Process QR code image: save base64 to file if needed
    let qrCodeImageUrl = createRoomDto.qrCodeImage;
    if (qrCodeImageUrl && this.uploadService.isBase64Image(qrCodeImageUrl)) {
      qrCodeImageUrl = await this.uploadService.saveBase64Image(qrCodeImageUrl, 'qr-codes');
    }

    // Process room images: save base64 to files if needed
    let imagesJson = createRoomDto.images;
    if (imagesJson) {
      const images = this.uploadService.parseImagesJson(imagesJson);
      const processedImages: string[] = [];
      
      for (const image of images) {
        if (this.uploadService.isBase64Image(image)) {
          const url = await this.uploadService.saveBase64Image(image, 'rooms');
          processedImages.push(url);
        } else {
          // Already a URL, keep it
          processedImages.push(image);
        }
      }
      
      imagesJson = JSON.stringify(processedImages);
    }

    return this.prisma.room.create({
      data: {
        ...createRoomDto,
        latitude,
        longitude,
        qrCodeImage: qrCodeImageUrl,
        images: imagesJson,
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
    
    // Auto-geocode: always geocode if address is provided and coordinates are not explicitly set
    let latitude = updateRoomDto.latitude;
    let longitude = updateRoomDto.longitude;

    // Get final address values (use updated values if provided, otherwise use existing)
    const finalWard = updateRoomDto.ward !== undefined ? updateRoomDto.ward : room.ward;
    const finalProvince = updateRoomDto.province !== undefined ? updateRoomDto.province : room.province;

    // If coordinates are not explicitly provided, try to geocode from address
    if ((latitude === undefined || longitude === undefined || latitude === 0 || longitude === 0) && (finalWard || finalProvince)) {
      const coordinates = await this.geocodingService.geocodeRoomAddress(
        finalWard ?? undefined,
        finalProvince ?? undefined,
      );

      if (coordinates) {
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
      } else {
        // If geocoding fails, keep existing coordinates if available
        latitude = latitude !== undefined && latitude !== 0 ? latitude : (room.latitude ?? undefined);
        longitude = longitude !== undefined && longitude !== 0 ? longitude : (room.longitude ?? undefined);
      }
    }

    // Process QR code image: save base64 to file if needed, delete old file if replaced
    let qrCodeImageUrl = updateRoomDto.qrCodeImage;
    if (qrCodeImageUrl !== undefined) {
      if (this.uploadService.isBase64Image(qrCodeImageUrl)) {
        // Delete old QR code image if exists
        if (room.qrCodeImage && !this.uploadService.isBase64Image(room.qrCodeImage)) {
          await this.uploadService.deleteFile(room.qrCodeImage);
        }
        qrCodeImageUrl = await this.uploadService.saveBase64Image(qrCodeImageUrl, 'qr-codes');
      }
      // If qrCodeImageUrl is already a URL or empty string, keep it as is
    } else {
      qrCodeImageUrl = room.qrCodeImage ?? undefined;
    }

    // Process room images: save base64 to files if needed, delete old files if replaced
    let imagesJson = updateRoomDto.images;
    if (imagesJson !== undefined) {
      const images = this.uploadService.parseImagesJson(imagesJson);
      const processedImages: string[] = [];
      
      // Get old images to delete if they're being replaced
      const oldImages = this.uploadService.parseImagesJson(room.images ?? undefined);
      
      for (const image of images) {
        if (this.uploadService.isBase64Image(image)) {
          const url = await this.uploadService.saveBase64Image(image, 'rooms');
          processedImages.push(url);
        } else {
          // Already a URL, keep it
          processedImages.push(image);
        }
      }
      
      // Delete old images that are no longer in the new list
      for (const oldImage of oldImages) {
        if (!this.uploadService.isBase64Image(oldImage) && !processedImages.includes(oldImage)) {
          await this.uploadService.deleteFile(oldImage);
        }
      }
      
      imagesJson = JSON.stringify(processedImages);
    } else {
      imagesJson = room.images ?? undefined;
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        ...updateRoomDto,
        latitude: latitude !== undefined ? latitude : room.latitude,
        longitude: longitude !== undefined ? longitude : room.longitude,
        qrCodeImage: qrCodeImageUrl,
        images: imagesJson,
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


