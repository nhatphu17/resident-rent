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
  room: { 
    roomNumber: string;
    qrCodeImage?: string;
  };
  roomPrice: number;
  electricUsage: number;
  electricTotal: number;
  waterUsage: number;
  waterTotal: number;
}

export default function TenantInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      console.log('Invoices response:', response.data); // Debug log
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = (invoiceId: number) => {
    window.open(`/api/pdf/invoice/${invoiceId}`, '_blank');
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
      <h2 className="text-2xl font-bold mb-6">Hóa đơn của tôi</h2>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tiền phòng:</p>
                    <p className="font-semibold">{Number(invoice.roomPrice).toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Điện ({Number(invoice.electricUsage).toFixed(2)} kWh):</p>
                    <p className="font-semibold">{Number(invoice.electricTotal).toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nước ({Number(invoice.waterUsage).toFixed(2)} m³):</p>
                    <p className="font-semibold">{Number(invoice.waterTotal).toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tổng cộng:</p>
                    <p className="text-lg font-bold">{Number(invoice.totalAmount).toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Hạn thanh toán: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                </p>
                {invoice.room?.qrCodeImage ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3 text-center">QR Code thanh toán:</p>
                    <div className="flex justify-center">
                      <img 
                        src={invoice.room.qrCodeImage} 
                        alt="QR Code thanh toán" 
                        className="max-w-xs w-full h-auto border-2 border-gray-300 rounded-lg shadow-sm"
                        onError={(e) => {
                          console.error('Error loading QR code image:', invoice.room?.qrCodeImage);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center italic">
                      Quét mã QR để thanh toán hóa đơn qua ví điện tử
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 text-center">
                      ⚠️ Chưa có QR code thanh toán. Vui lòng liên hệ chủ trọ để được hỗ trợ.
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPdf(invoice.id)}
                  className="mt-4"
                >
                  Tải hóa đơn PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {invoices.length === 0 && (
          <Card>
            <CardContent className="py-6 text-center text-gray-500">
              Chưa có hóa đơn nào
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


