import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles(UserRole.LANDLORD)
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  async findAll(@CurrentUser() user: any) {
    let landlordId: number | undefined;
    let tenantId: number | undefined;

    if (user.role === 'LANDLORD') {
      const landlord = await this.prisma.landlord.findUnique({
        where: { userId: user.id },
      });
      landlordId = landlord?.id;
    } else if (user.role === 'TENANT') {
      const tenant = await this.prisma.tenant.findUnique({
        where: { userId: user.id },
      });
      tenantId = tenant?.id;
    }

    return this.invoicesService.findAll(landlordId, tenantId);
  }

  @Get(':id')
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(+id);
  }

  @Patch(':id/status')
  @Roles(UserRole.LANDLORD)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'PAID' | 'OVERDUE',
  ) {
    return this.invoicesService.updateStatus(+id, status);
  }

  @Patch(':id/paid')
  @Roles(UserRole.LANDLORD)
  markAsPaid(@Param('id') id: string) {
    return this.invoicesService.markAsPaid(+id);
  }

  @Post(':id/send-sms')
  @Roles(UserRole.LANDLORD)
  sendSms(@Param('id') id: string) {
    return this.invoicesService.sendSmsNotification(+id);
  }
}


