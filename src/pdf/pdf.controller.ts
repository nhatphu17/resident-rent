import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/pdf')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('invoice/:id')
  @Roles(UserRole.LANDLORD, UserRole.TENANT)
  async getInvoicePdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.pdfService.generateInvoicePdf(+id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    res.send(pdfBuffer);
  }
}


