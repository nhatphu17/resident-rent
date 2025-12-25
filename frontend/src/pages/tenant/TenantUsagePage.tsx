import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Usage {
  id: number;
  month: number;
  year: number;
  electricStart?: number;
  electricEnd: number;
  waterStart?: number;
  waterEnd: number;
  electricUsage: number;
  waterUsage: number;
  room: {
    roomNumber: string;
  };
}

export default function TenantUsagePage() {
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsages();
  }, []);

  const fetchUsages = async () => {
    try {
      const response = await api.get('/usage');
      setUsages(response.data);
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Lịch sử điện nước</h2>
      <div className="space-y-4">
        {usages.map((usage) => (
          <Card key={usage.id}>
            <CardHeader>
              <CardTitle>
                Tháng {usage.month}/{usage.year} - Phòng {usage.room.roomNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Điện:</p>
                  <p className="font-semibold">
                    {usage.electricStart ? `${Number(usage.electricStart).toFixed(2)} → ` : ''}
                    {Number(usage.electricEnd).toFixed(2)} kWh
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tiêu thụ: {Number(usage.electricUsage).toFixed(2)} kWh
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nước:</p>
                  <p className="font-semibold">
                    {usage.waterStart ? `${Number(usage.waterStart).toFixed(2)} → ` : ''}
                    {Number(usage.waterEnd).toFixed(2)} m³
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tiêu thụ: {Number(usage.waterUsage).toFixed(2)} m³
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {usages.length === 0 && (
          <Card>
            <CardContent className="py-6 text-center text-gray-500">
              Chưa có dữ liệu điện nước
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


