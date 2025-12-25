import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contract {
  id: number;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  deposit?: number;
  status: string;
  notes?: string;
  room: { roomNumber: string; floor?: number; area?: number };
  landlord: { name: string; phone: string };
}

export default function TenantContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-primary">Hợp đồng của tôi</h2>
      <div className="space-y-4">
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Bạn chưa có hợp đồng nào</p>
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow border-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-primary">
                  Hợp đồng - Phòng {contract.room.roomNumber}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Chủ nhà:</span> {contract.landlord.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">SĐT chủ nhà:</span> {contract.landlord.phone}
                  </p>
                  {contract.room.floor && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Tầng:</span> {contract.room.floor}
                    </p>
                  )}
                  {contract.room.area && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Diện tích:</span> {contract.room.area} m²
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Giá thuê:</span>{' '}
                    <span className="text-lg font-semibold text-primary">
                      {Number(contract.monthlyRent).toLocaleString('vi-VN')} VNĐ/tháng
                    </span>
                  </p>
                  {contract.deposit && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Tiền cọc:</span>{' '}
                      {Number(contract.deposit).toLocaleString('vi-VN')} VNĐ
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Ngày bắt đầu:</span>{' '}
                    {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                  </p>
                  {contract.endDate && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Ngày kết thúc:</span>{' '}
                      {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                  <p className="text-sm mt-2">
                    <span className="font-medium">Trạng thái:</span>{' '}
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      contract.status === 'active' ? 'bg-green-100 text-green-700' :
                      contract.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {contract.status === 'active' ? 'Đang hoạt động' :
                       contract.status === 'expired' ? 'Hết hạn' : 'Đã chấm dứt'}
                    </span>
                  </p>
                  {contract.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      <span className="font-medium">Ghi chú:</span> {contract.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

