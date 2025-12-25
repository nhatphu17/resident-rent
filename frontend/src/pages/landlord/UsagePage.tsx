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
  const [previousUsage, setPreviousUsage] = useState<any>(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
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

  useEffect(() => {
    if (selectedRoom && formData.month && formData.year) {
      fetchPreviousUsage();
    }
  }, [selectedRoom, formData.month, formData.year]);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchPreviousUsage = async () => {
    if (!selectedRoom) return;
    
    try {
      // Calculate previous month
      let prevMonth = formData.month - 1;
      let prevYear = formData.year;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear -= 1;
      }

      // Try to get usage for previous month
      const response = await api.get(`/usage?roomId=${selectedRoom}`);
      const usages = response.data || [];
      const prevUsage = usages.find(
        (u: any) => u.month === prevMonth && u.year === prevYear
      );

      if (prevUsage && prevUsage.electricEnd && prevUsage.waterEnd) {
        setPreviousUsage(prevUsage);
        setIsFirstTime(false);
        // Auto-fill start values from previous month's end values
        setFormData((prev) => ({
          ...prev,
          electricStart: Number(prevUsage.electricEnd).toString(),
          waterStart: Number(prevUsage.waterEnd).toString(),
        }));
      } else {
        setPreviousUsage(null);
        setIsFirstTime(true);
        // Clear start values if no previous usage
        setFormData((prev) => ({
          ...prev,
          electricStart: '',
          waterStart: '',
        }));
      }
    } catch (error) {
      console.error('Error fetching previous usage:', error);
      setIsFirstTime(true);
      setPreviousUsage(null);
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
            {isFirstTime && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                <p className="font-semibold mb-1">Lần đầu nhập chỉ số</p>
                <p>Vui lòng nhập cả chỉ số đầu kỳ và cuối kỳ cho tháng này.</p>
              </div>
            )}
            {!isFirstTime && previousUsage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                <p className="font-semibold mb-1">Đã tự động lấy chỉ số từ tháng trước</p>
                <p>
                  Chỉ số đầu kỳ = Chỉ số cuối kỳ tháng {previousUsage.month}/{previousUsage.year}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chỉ số điện đầu kỳ (kWh) {isFirstTime && '*'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.electricStart}
                  onChange={(e) => setFormData({ ...formData, electricStart: e.target.value })}
                  required={isFirstTime}
                  disabled={!isFirstTime}
                  className={!isFirstTime ? 'bg-muted' : ''}
                />
                {!isFirstTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tự động lấy từ tháng trước: {previousUsage?.electricEnd || 0} kWh
                  </p>
                )}
              </div>
              <div>
                <Label>Chỉ số điện cuối kỳ (kWh) *</Label>
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
                <Label>Chỉ số nước đầu kỳ (m³) {isFirstTime && '*'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.waterStart}
                  onChange={(e) => setFormData({ ...formData, waterStart: e.target.value })}
                  required={isFirstTime}
                  disabled={!isFirstTime}
                  className={!isFirstTime ? 'bg-muted' : ''}
                />
                {!isFirstTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tự động lấy từ tháng trước: {previousUsage?.waterEnd || 0} m³
                  </p>
                )}
              </div>
              <div>
                <Label>Chỉ số nước cuối kỳ (m³) *</Label>
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


