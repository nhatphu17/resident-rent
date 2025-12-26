import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsageDto } from './dto/create-usage.dto';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class UsageService {
  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
  ) {}

  async createManual(createUsageDto: CreateUsageDto) {
    const { roomId, month, year, electricStart, electricEnd, waterStart, waterEnd } = createUsageDto;

    // Calculate usage
    const electricUsage = Number(electricEnd) - (Number(electricStart) || 0);
    const waterUsage = Number(waterEnd) - (Number(waterStart) || 0);

    // Get room for pricing
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Create or update usage
    const usage = await this.prisma.usage.upsert({
      where: {
        roomId_month_year: {
          roomId,
          month,
          year,
        },
      },
      update: {
        electricStart: electricStart ? Number(electricStart) : undefined,
        electricEnd: Number(electricEnd),
        waterStart: waterStart ? Number(waterStart) : undefined,
        waterEnd: Number(waterEnd),
        electricUsage: electricUsage,
        waterUsage: waterUsage,
        isAuto: false,
      },
      create: {
        roomId,
        month,
        year,
        electricStart: electricStart ? Number(electricStart) : undefined,
        electricEnd: Number(electricEnd),
        waterStart: waterStart ? Number(waterStart) : undefined,
        waterEnd: Number(waterEnd),
        electricUsage: electricUsage,
        waterUsage: waterUsage,
        isAuto: false,
      },
    });

    // Auto-generate invoice if contract exists
    await this.generateInvoiceForUsage(usage);

    return usage;
  }

  async createAuto(roomId: number, electricity: number, water: number, timestamp?: Date) {
    const date = timestamp || new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Get previous month's end values or current usage
    const previousUsage = await this.prisma.usage.findFirst({
      where: {
        roomId,
        OR: [
          { year: year, month: { lt: month } },
          { year: { lt: year } },
        ],
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });

    const electricStart = previousUsage ? Number(previousUsage.electricEnd) : 0;
    const waterStart = previousUsage ? Number(previousUsage.waterEnd) : 0;

    const electricUsage = electricity - electricStart;
    const waterUsage = water - waterStart;

    // Get room
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Create or update usage
    const usage = await this.prisma.usage.upsert({
      where: {
        roomId_month_year: {
          roomId,
          month,
          year,
        },
      },
      update: {
        electricEnd: electricity,
        waterEnd: water,
        electricUsage: electricUsage > 0 ? electricUsage : 0,
        waterUsage: waterUsage > 0 ? waterUsage : 0,
        isAuto: true,
      },
      create: {
        roomId,
        month,
        year,
        electricStart: electricStart > 0 ? electricStart : undefined,
        electricEnd: electricity,
        waterStart: waterStart > 0 ? waterStart : undefined,
        waterEnd: water,
        electricUsage: electricUsage > 0 ? electricUsage : 0,
        waterUsage: waterUsage > 0 ? waterUsage : 0,
        isAuto: true,
      },
    });

    // Auto-generate invoice
    await this.generateInvoiceForUsage(usage);

    return usage;
  }

  private async generateInvoiceForUsage(usage: any) {
    try {
      // Find active contract for this room
      const contract = await this.prisma.contract.findFirst({
        where: {
          roomId: usage.roomId,
          status: 'active',
        },
      });

      if (contract) {
        // Check if invoice already exists
        const existingInvoice = await this.prisma.invoice.findUnique({
          where: {
            contractId_month_year: {
              contractId: contract.id,
              month: usage.month,
              year: usage.year,
            },
          },
        });

        if (!existingInvoice) {
          const room = await this.prisma.room.findUnique({
            where: { id: usage.roomId },
          });

          if (room) {
            await this.invoicesService.create({
              contractId: contract.id,
              tenantId: contract.tenantId,
              roomId: usage.roomId,
              usageId: usage.id,
              month: usage.month,
              year: usage.year,
              roomPrice: Number(contract.monthlyRent),
              electricUsage: Number(usage.electricUsage || 0),
              electricPrice: Number(room.electricPrice),
              waterUsage: Number(usage.waterUsage || 0),
              waterPrice: Number(room.waterPrice),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error generating invoice for usage:', error);
      // Don't throw, just log the error
    }
  }

  async findAll(roomId?: number) {
    const where = roomId ? { roomId } : {};
    return this.prisma.usage.findMany({
      where,
      include: {
        room: true,
        invoice: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });
  }

  async findAllByRoomIds(roomIds: number[]) {
    return this.prisma.usage.findMany({
      where: {
        roomId: {
          in: roomIds,
        },
      },
      include: {
        room: true,
        invoice: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });
  }

  async findOne(id: number) {
    return this.prisma.usage.findUnique({
      where: { id },
      include: {
        room: true,
        invoice: true,
      },
    });
  }
}

