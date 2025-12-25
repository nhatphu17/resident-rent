import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSensorDataDto } from './dto/create-sensor-data.dto';
import { UsageService } from '../usage/usage.service';

@Injectable()
export class SensorDataService {
  constructor(
    private prisma: PrismaService,
    private usageService: UsageService,
  ) {}

  async create(createSensorDataDto: CreateSensorDataDto) {
    const { roomId, electricity, water, timestamp } = createSensorDataDto;

    // Save sensor data
    const sensorData = await this.prisma.sensorData.create({
      data: {
        roomId,
        electricity: Number(electricity),
        water: Number(water),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Auto-create usage entry
    await this.usageService.createAuto(
      roomId,
      Number(electricity),
      Number(water),
      timestamp ? new Date(timestamp) : undefined,
    );

    return sensorData;
  }

  async findAll(roomId?: number, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (roomId) where.roomId = roomId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    return this.prisma.sensorData.findMany({
      where,
      include: {
        room: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.sensorData.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });
  }
}


