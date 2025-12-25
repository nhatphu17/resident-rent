import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  ward?: string;
  district?: string;
  province?: string;
  qrCodeImage?: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: '',
    area: '',
    price: '',
    electricPrice: '3500',
    waterPrice: '25000',
    status: 'available',
    description: '',
    ward: '',
    district: '',
    province: '',
    qrCodeImage: '',
  });
  const [qrPreview, setQrPreview] = useState<string>('');
  const [error, setError] = useState('');

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

  const handleQrImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, qrCodeImage: base64String });
        setQrPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = {
        ...formData,
        floor: formData.floor ? Number(formData.floor) : undefined,
        area: formData.area ? Number(formData.area) : undefined,
        price: Number(formData.price),
        electricPrice: Number(formData.electricPrice),
        waterPrice: Number(formData.waterPrice),
        ward: formData.ward || undefined,
        district: formData.district || undefined,
        province: formData.province || undefined,
        qrCodeImage: formData.qrCodeImage || undefined,
      };

      if (editingRoom) {
        await api.patch(`/rooms/${editingRoom.id}`, data);
      } else {
        await api.post('/rooms', data);
      }

      setShowForm(false);
      setEditingRoom(null);
      setQrPreview('');
      setFormData({
        roomNumber: '',
        floor: '',
        area: '',
        price: '',
        electricPrice: '3500',
        waterPrice: '25000',
        status: 'available',
        description: '',
        ward: '',
        district: '',
        province: '',
        qrCodeImage: '',
      });
      fetchRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu phòng');
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      floor: room.floor?.toString() || '',
      area: room.area?.toString() || '',
      price: room.price.toString(),
      electricPrice: room.electricPrice.toString(),
      waterPrice: room.waterPrice.toString(),
      status: room.status,
      description: room.description || '',
      ward: room.ward || '',
      district: room.district || '',
      province: room.province || '',
      qrCodeImage: room.qrCodeImage || '',
    });
    setQrPreview(room.qrCodeImage || '');
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      return;
    }
    try {
      await api.delete(`/rooms/${id}`);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa phòng');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRoom(null);
    setQrPreview('');
    setFormData({
      roomNumber: '',
      floor: '',
      area: '',
      price: '',
      electricPrice: '3500',
      waterPrice: '25000',
      status: 'available',
      description: '',
      ward: '',
      district: '',
      province: '',
      qrCodeImage: '',
    });
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
        <Card className="mb-6 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="text-primary">
              {editingRoom ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}
            </CardTitle>
            <CardDescription>
              {editingRoom ? 'Cập nhật thông tin phòng' : 'Nhập thông tin phòng để thêm vào hệ thống'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roomNumber">Số phòng *</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="VD: 101, 201, A1, B2..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Số phòng để phân biệt các phòng (VD: 101, 201, A1, B2...). Mỗi chủ trọ có thể quản lý nhiều phòng với số phòng khác nhau.
                  </p>
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
                <div>
                  <Label>Trạng thái</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Trống</SelectItem>
                      <SelectItem value="occupied">Đã thuê</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Xã/Phường</Label>
                  <Input
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    placeholder="VD: Phường 1, Xã An Phú..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quận/Huyện</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="VD: Quận 1, Huyện Bình Chánh..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Tỉnh/Thành phố</Label>
                  <Input
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="VD: TP. Hồ Chí Minh, Hà Nội..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Mô tả</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả về phòng..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>QR Code thanh toán (Hình ảnh)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleQrImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tải lên hình ảnh QR code thanh toán cọc (PNG, JPG, max 5MB)
                  </p>
                  {qrPreview && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">Xem trước:</p>
                      <img
                        src={qrPreview}
                        alt="QR Code preview"
                        className="max-w-xs border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingRoom ? 'Cập nhật' : 'Tạo phòng'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex justify-between items-start">
                <CardTitle className="text-primary">Phòng {room.roomNumber}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(room)}
                    className="h-8 px-3 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(room.id)}
                    className="h-8 px-3"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Tầng:</span> {room.floor || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Diện tích:</span> {room.area || 'N/A'} m²
                </p>
                <p className="text-lg font-semibold mt-3 text-primary">
                  {Number(room.price).toLocaleString('vi-VN')} VNĐ/tháng
                </p>
                <div className="pt-2 border-t border-primary/10">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Điện:</span> {Number(room.electricPrice).toLocaleString('vi-VN')} VNĐ/kWh
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Nước:</span> {Number(room.waterPrice).toLocaleString('vi-VN')} VNĐ/m³
                  </p>
                </div>
                <p className="text-sm mt-2">
                  <span className="font-medium">Trạng thái:</span>{' '}
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    room.status === 'available' ? 'bg-green-100 text-green-700' :
                    room.status === 'occupied' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {room.status === 'available' ? 'Trống' :
                     room.status === 'occupied' ? 'Đã thuê' : 'Bảo trì'}
                  </span>
                </p>
                {room.description && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    {room.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


