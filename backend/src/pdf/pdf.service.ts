import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateInvoicePdf(invoiceId: number): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        room: {
          include: {
            landlord: true,
          },
        },
        contract: true,
        usage: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('HÓA ĐƠN THANH TOÁN', { align: 'center' });
      doc.moveDown();

      // Invoice info
      doc.fontSize(12);
      doc.text(`Mã hóa đơn: #${invoice.id}`, { align: 'left' });
      doc.text(`Tháng/Năm: ${invoice.month}/${invoice.year}`, { align: 'left' });
      doc.text(`Ngày tạo: ${invoice.createdAt.toLocaleDateString('vi-VN')}`, { align: 'left' });
      doc.text(`Hạn thanh toán: ${invoice.dueDate.toLocaleDateString('vi-VN')}`, { align: 'left' });
      doc.moveDown();

      // Tenant info
      doc.fontSize(14).text('THÔNG TIN NGƯỜI THUÊ', { underline: true });
      doc.fontSize(12);
      doc.text(`Tên: ${invoice.tenant.name}`);
      doc.text(`SĐT: ${invoice.tenant.phone}`);
      doc.moveDown();

      // Room info
      doc.fontSize(14).text('THÔNG TIN PHÒNG', { underline: true });
      doc.fontSize(12);
      doc.text(`Số phòng: ${invoice.room.roomNumber}`);
      doc.text(`Giá phòng: ${Number(invoice.roomPrice).toLocaleString('vi-VN')} VNĐ/tháng`);
      doc.moveDown();

      // Usage details
      if (invoice.usage) {
        doc.fontSize(14).text('CHỈ SỐ ĐIỆN NƯỚC', { underline: true });
        doc.fontSize(12);
        doc.text(`Điện: ${Number(invoice.usage.electricStart || 0).toFixed(2)} → ${Number(invoice.usage.electricEnd).toFixed(2)} (${Number(invoice.electricUsage).toFixed(2)} kWh)`);
        doc.text(`Nước: ${Number(invoice.usage.waterStart || 0).toFixed(2)} → ${Number(invoice.usage.waterEnd).toFixed(2)} (${Number(invoice.waterUsage).toFixed(2)} m³)`);
        doc.moveDown();
      }

      // Invoice items
      doc.fontSize(14).text('CHI TIẾT HÓA ĐƠN', { underline: true });
      doc.moveDown();

      const tableTop = doc.y;
      const itemHeight = 30;
      let currentY = tableTop;

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Mô tả', 50, currentY);
      doc.text('Số lượng', 250, currentY);
      doc.text('Đơn giá', 350, currentY);
      doc.text('Thành tiền', 450, currentY, { width: 100, align: 'right' });
      currentY += itemHeight;

      // Table rows
      doc.font('Helvetica');
      doc.text('Tiền phòng', 50, currentY);
      doc.text('1 tháng', 250, currentY);
      doc.text(`${Number(invoice.roomPrice).toLocaleString('vi-VN')}`, 350, currentY);
      doc.text(`${Number(invoice.roomPrice).toLocaleString('vi-VN')}`, 450, currentY, { width: 100, align: 'right' });
      currentY += itemHeight;

      doc.text('Điện', 50, currentY);
      doc.text(`${Number(invoice.electricUsage).toFixed(2)} kWh`, 250, currentY);
      doc.text(`${Number(invoice.electricPrice).toLocaleString('vi-VN')}`, 350, currentY);
      doc.text(`${Number(invoice.electricTotal).toLocaleString('vi-VN')}`, 450, currentY, { width: 100, align: 'right' });
      currentY += itemHeight;

      doc.text('Nước', 50, currentY);
      doc.text(`${Number(invoice.waterUsage).toFixed(2)} m³`, 250, currentY);
      doc.text(`${Number(invoice.waterPrice).toLocaleString('vi-VN')}`, 350, currentY);
      doc.text(`${Number(invoice.waterTotal).toLocaleString('vi-VN')}`, 450, currentY, { width: 100, align: 'right' });
      currentY += itemHeight + 10;

      // Total
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`TỔNG CỘNG: ${Number(invoice.totalAmount).toLocaleString('vi-VN')} VNĐ`, 350, currentY, { align: 'right' });
      currentY += itemHeight;

      // Status
      doc.fontSize(12);
      const statusText = invoice.status === 'PAID' ? 'ĐÃ THANH TOÁN' : invoice.status === 'OVERDUE' ? 'QUÁ HẠN' : 'CHỜ THANH TOÁN';
      doc.text(`Trạng thái: ${statusText}`, 50, currentY);

      if (invoice.status === 'PAID' && invoice.paidDate) {
        doc.text(`Ngày thanh toán: ${invoice.paidDate.toLocaleDateString('vi-VN')}`, 50, currentY + 20);
      }

      doc.end();
    });
  }
}


