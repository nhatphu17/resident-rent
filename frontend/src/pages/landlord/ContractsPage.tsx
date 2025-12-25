import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contract {
  id: number;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  status: string;
  tenant: { name: string };
  room: { roomNumber: string };
}

export default function ContractsPage() {
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
      <h2 className="text-2xl font-bold mb-6">Quản lý hợp đồng</h2>
      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader>
              <CardTitle>
                Hợp đồng - Phòng {contract.room.roomNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Người thuê: {contract.tenant.name}</p>
              <p>Giá thuê: {Number(contract.monthlyRent).toLocaleString('vi-VN')} VNĐ/tháng</p>
              <p>Ngày bắt đầu: {new Date(contract.startDate).toLocaleDateString('vi-VN')}</p>
              {contract.endDate && (
                <p>Ngày kết thúc: {new Date(contract.endDate).toLocaleDateString('vi-VN')}</p>
              )}
              <p className="mt-2">
                Trạng thái: <span className="font-semibold">{contract.status}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


