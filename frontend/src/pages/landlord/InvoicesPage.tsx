import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Invoice {
  id: number;
  month: number;
  year: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  room: { roomNumber: string };
  tenant: { name: string };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async (invoiceId: number) => {
    try {
      await api.post(`/invoices/${invoiceId}/send-sms`);
      alert('Đã gửi SMS thành công');
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Lỗi khi gửi SMS');
    }
  };

  const handleDownloadPdf = (invoiceId: number) => {
    window.open(`/api/pdf/invoice/${invoiceId}`, '_blank');
  };

  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await api.patch(`/invoices/${invoiceId}/paid`);
      fetchInvoices();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600';
      case 'OVERDUE':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'OVERDUE':
        return 'Quá hạn';
      default:
        return 'Chờ thanh toán';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Quản lý hóa đơn</h2>
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Hóa đơn tháng {invoice.month}/{invoice.year} - Phòng {invoice.room.roomNumber}
                </CardTitle>
                <span className={`font-semibold ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Người thuê: {invoice.tenant.name}</p>
                <p className="text-lg font-semibold">
                  Tổng tiền: {Number(invoice.totalAmount).toLocaleString('vi-VN')} VNĐ
                </p>
                <p>Hạn thanh toán: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadPdf(invoice.id)}
                  >
                    Tải PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSendSms(invoice.id)}
                  >
                    Gửi SMS
                  </Button>
                  {invoice.status !== 'PAID' && (
                    <Button
                      onClick={() => handleMarkAsPaid(invoice.id)}
                    >
                      Đánh dấu đã thanh toán
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


