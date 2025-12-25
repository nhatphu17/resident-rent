import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Room {
  id: number;
  roomNumber: string;
}

export default function UsagePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricStart: '',
    electricEnd: '',
    waterStart: '',
    waterEnd: '',
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) {
      alert('Vui lòng chọn phòng');
      return;
    }

    try {
      await api.post('/usage/manual', {
        roomId: Number(selectedRoom),
        ...formData,
        electricStart: formData.electricStart ? Number(formData.electricStart) : undefined,
        electricEnd: Number(formData.electricEnd),
        waterStart: formData.waterStart ? Number(formData.waterStart) : undefined,
        waterEnd: Number(formData.waterEnd),
      });
      alert('Nhập chỉ số thành công');
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        electricStart: '',
        electricEnd: '',
        waterStart: '',
        waterEnd: '',
      });
    } catch (error) {
      console.error('Error creating usage:', error);
      alert('Lỗi khi nhập chỉ số');
    }
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Nhập chỉ số điện nước thủ công</h2>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nhập chỉ số</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Phòng</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      Phòng {room.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tháng</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Năm</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chỉ số điện đầu kỳ (kWh)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.electricStart}
                  onChange={(e) => setFormData({ ...formData, electricStart: e.target.value })}
                />
              </div>
              <div>
                <Label>Chỉ số điện cuối kỳ (kWh)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.electricEnd}
                  onChange={(e) => setFormData({ ...formData, electricEnd: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chỉ số nước đầu kỳ (m³)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.waterStart}
                  onChange={(e) => setFormData({ ...formData, waterStart: e.target.value })}
                />
              </div>
              <div>
                <Label>Chỉ số nước cuối kỳ (m³)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.waterEnd}
                  onChange={(e) => setFormData({ ...formData, waterEnd: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit">Lưu chỉ số</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


