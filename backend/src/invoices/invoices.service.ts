import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const {
      contractId,
      tenantId,
      roomId,
      usageId,
      month,
      year,
      roomPrice,
      electricUsage,
      electricPrice,
      waterUsage,
      waterPrice,
    } = createInvoiceDto;

    const electricTotal = Number(electricUsage) * Number(electricPrice);
    const waterTotal = Number(waterUsage) * Number(waterPrice);
    const totalAmount = Number(roomPrice) + electricTotal + waterTotal;

    // Calculate due date (end of month + 7 days)
    const dueDate = new Date(year, month, 7);

    const invoice = await this.prisma.invoice.create({
      data: {
        contractId,
        tenantId,
        roomId,
        usageId,
        month,
        year,
        roomPrice: Number(roomPrice),
        electricUsage: Number(electricUsage),
        electricPrice: Number(electricPrice),
        electricTotal,
        waterUsage: Number(waterUsage),
        waterPrice: Number(waterPrice),
        waterTotal,
        totalAmount,
        dueDate,
      },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        room: true,
        contract: true,
        usage: true,
      },
    });

    return invoice;
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async generateMonthlyInvoices() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get all active contracts
    const contracts = await this.prisma.contract.findMany({
      where: {
        status: 'active',
      },
      include: {
        room: true,
      },
    });

    for (const contract of contracts) {
      // Check if invoice already exists
      const existingInvoice = await this.prisma.invoice.findUnique({
        where: {
          contractId_month_year: {
            contractId: contract.id,
            month,
            year,
          },
        },
      });

      if (existingInvoice) {
        continue;
      }

      // Get usage for this month
      const usage = await this.prisma.usage.findUnique({
        where: {
          roomId_month_year: {
            roomId: contract.roomId,
            month,
            year,
          },
        },
      });

      if (usage) {
        await this.create({
          contractId: contract.id,
          tenantId: contract.tenantId,
          roomId: contract.roomId,
          usageId: usage.id,
          month,
          year,
          roomPrice: Number(contract.monthlyRent),
          electricUsage: Number(usage.electricUsage),
          electricPrice: Number(contract.room.electricPrice),
          waterUsage: Number(usage.waterUsage),
          waterPrice: Number(contract.room.waterPrice),
        });
      } else {
        // Create invoice with zero usage if no usage data
        await this.create({
          contractId: contract.id,
          tenantId: contract.tenantId,
          roomId: contract.roomId,
          month,
          year,
          roomPrice: Number(contract.monthlyRent),
          electricUsage: 0,
          electricPrice: Number(contract.room.electricPrice),
          waterUsage: 0,
          waterPrice: Number(contract.room.waterPrice),
        });
      }
    }
  }

  async findAll(landlordId?: number, tenantId?: number) {
    const where: any = {};
    if (tenantId) {
      where.tenantId = tenantId;
    } else if (landlordId) {
      where.contract = {
        landlordId,
      };
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        tenant: true,
        room: true,
        contract: true,
        usage: true,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    });
  }

  async findOne(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        room: true,
        contract: {
          include: {
            landlord: true,
          },
        },
        usage: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async updateStatus(id: number, status: 'PENDING' | 'PAID' | 'OVERDUE', paidDate?: Date) {
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidDate: status === 'PAID' ? (paidDate || new Date()) : null,
      },
    });
  }

  async sendSmsNotification(invoiceId: number) {
    const invoice = await this.findOne(invoiceId);
    const phone = invoice.tenant.user?.phone || invoice.tenant.phone;

    if (!phone) {
      throw new NotFoundException('Tenant phone number not found');
    }

    const dueDate = new Date(invoice.dueDate);
    const formattedDate = dueDate.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const totalAmount = Number(invoice.totalAmount);
    const formattedAmount = totalAmount.toLocaleString('vi-VN');

    const message = `Hóa đơn tháng ${invoice.month}/${invoice.year} - Phòng ${invoice.room.roomNumber}: ${formattedAmount} VNĐ. Hạn thanh toán: ${formattedDate}`;

    await this.smsService.sendSms(phone, message);
    return { success: true, message: 'SMS sent successfully' };
  }

  async markAsPaid(id: number) {
    return this.updateStatus(id, 'PAID', new Date());
  }
}


