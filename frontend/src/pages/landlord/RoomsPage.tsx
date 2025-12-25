import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Room {
  id: number;
  roomNumber: string;
  floor?: number;
  area?: number;
  price: number;
  electricPrice: number;
  waterPrice: number;
  status: string;
  description?: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    area: '',
    price: '',
    electricPrice: '3500',
    waterPrice: '25000',
    status: 'available',
    description: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rooms', {
        ...formData,
        floor: formData.floor ? Number(formData.floor) : undefined,
        area: formData.area ? Number(formData.area) : undefined,
        price: Number(formData.price),
        electricPrice: Number(formData.electricPrice),
        waterPrice: Number(formData.waterPrice),
      });
      setShowForm(false);
      setFormData({
        roomNumber: '',
        floor: '',
        area: '',
        price: '',
        electricPrice: '3500',
        waterPrice: '25000',
        status: 'available',
        description: '',
      });
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Lỗi khi tạo phòng');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý phòng</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Hủy' : 'Thêm phòng'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thêm phòng mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số phòng</Label>
                  <Input
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Tầng</Label>
                  <Input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Diện tích (m²)</Label>
                  <Input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Giá phòng (VNĐ/tháng)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Giá điện (VNĐ/kWh)</Label>
                  <Input
                    type="number"
                    value={formData.electricPrice}
                    onChange={(e) => setFormData({ ...formData, electricPrice: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Giá nước (VNĐ/m³)</Label>
                  <Input
                    type="number"
                    value={formData.waterPrice}
                    onChange={(e) => setFormData({ ...formData, waterPrice: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit">Tạo phòng</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle>Phòng {room.roomNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Tầng: {room.floor || 'N/A'}</p>
              <p className="text-sm text-gray-600">Diện tích: {room.area || 'N/A'} m²</p>
              <p className="text-lg font-semibold mt-2">
                {Number(room.price).toLocaleString('vi-VN')} VNĐ/tháng
              </p>
              <p className="text-sm text-gray-600">
                Điện: {Number(room.electricPrice).toLocaleString('vi-VN')} VNĐ/kWh
              </p>
              <p className="text-sm text-gray-600">
                Nước: {Number(room.waterPrice).toLocaleString('vi-VN')} VNĐ/m³
              </p>
              <p className="text-sm mt-2">
                Trạng thái: <span className="font-semibold">{room.status}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


