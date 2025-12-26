import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Tenant {
  id: number;
  name: string;
  phone: string;
  address?: string;
  user: {
    phone: string;
    email?: string;
  };
  contracts?: Array<{
    id: number;
    status: string;
    room: {
      id: number;
      roomNumber: string;
      floor?: number;
    };
  }>;
}

interface Room {
  id: number;
  roomNumber: string;
  floor?: number;
  price: number;
  status: string;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    roomId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    deposit: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newTenantPassword, setNewTenantPassword] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantRoom, setNewTenantRoom] = useState('');

  useEffect(() => {
    fetchTenants();
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      const availableRooms = response.data.filter((room: Room) => room.status === 'available');
      setRooms(availableRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (error: any) {
      console.error('Error fetching tenants:', error);
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra xem backend đã chạy chưa (port 3000).');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingTenant) {
        await api.patch(`/tenants/${editingTenant.id}`, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        });
        setSuccess('Đã cập nhật thông tin người thuê thành công!');
        setShowForm(false);
        setEditingTenant(null);
        setFormData({
          name: '',
          phone: '',
          address: '',
          roomId: '',
          startDate: '',
          endDate: '',
          monthlyRent: '',
          deposit: '',
          notes: '',
        });
      } else {
        const data = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address || undefined,
          roomId: Number(formData.roomId),
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          monthlyRent: Number(formData.monthlyRent),
          deposit: formData.deposit ? Number(formData.deposit) : undefined,
          notes: formData.notes || undefined,
        };

        const response = await api.post('/tenants', data);
        setNewTenantPassword(response.data.tempPassword);
        setNewTenantPhone(formData.phone);
        const selectedRoom = rooms.find((r) => r.id === Number(formData.roomId));
        setNewTenantRoom(selectedRoom ? `Phòng ${selectedRoom.roomNumber}` : '');
        setShowPasswordModal(true);
        setShowForm(false);
        setFormData({
          name: '',
          phone: '',
          address: '',
          roomId: '',
          startDate: '',
          endDate: '',
          monthlyRent: '',
          deposit: '',
          notes: '',
        });
        fetchTenants();
        fetchRooms(); // Refresh rooms to update status
      }
      fetchTenants();
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra xem backend đã chạy chưa (port 3000).');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Lỗi: ${err.message}`);
      } else {
        setError('Lỗi khi lưu người thuê. Vui lòng thử lại.');
      }
      console.error('Error saving tenant:', err);
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      address: tenant.address || '',
      roomId: '',
      startDate: '',
      endDate: '',
      monthlyRent: '',
      deposit: '',
      notes: '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người thuê này? Hành động này sẽ:\n- Xóa tất cả hợp đồng liên quan\n- Reset trạng thái phòng về trống\n- Xóa tài khoản đăng nhập\nHành động này không thể hoàn tác.')) {
      return;
    }
    try {
      await api.delete(`/tenants/${id}`);
      fetchTenants();
      alert('Người thuê đã được xóa. Tất cả hợp đồng liên quan đã được xóa và trạng thái phòng đã được reset về trống.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa người thuê');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTenant(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
      roomId: '',
      startDate: '',
      endDate: '',
      monthlyRent: '',
      deposit: '',
      notes: '',
    });
  };

  const handleRoomChange = (roomId: string) => {
    setFormData({ ...formData, roomId });
    const selectedRoom = rooms.find((r) => r.id === Number(roomId));
    if (selectedRoom) {
      setFormData({ ...formData, roomId, monthlyRent: selectedRoom.price.toString() });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý người thuê</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Đóng' : '+ Thêm người thuê'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="text-primary">
              {editingTenant ? 'Sửa thông tin người thuê' : 'Thêm người thuê mới'}
            </CardTitle>
            <CardDescription>
              {editingTenant ? 'Cập nhật thông tin người thuê' : 'Nhập thông tin người thuê để tạo tài khoản'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                  {success}
                </div>
              )}
              {!editingTenant && (
                <>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                    <p className="font-semibold mb-1">Thông tin người thuê và hợp đồng</p>
                    <p>Hệ thống sẽ tự động tạo hợp đồng và gán phòng cho người thuê mới. Số điện thoại sẽ được dùng làm tài khoản đăng nhập.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ tên *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại * (Dùng để đăng nhập)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0901234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="123 Đường ABC, Quận XYZ"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-4 text-primary">Thông tin hợp đồng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="roomId">Phòng *</Label>
                        <Select
                          value={formData.roomId}
                          onValueChange={handleRoomChange}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phòng" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms.map((room) => (
                              <SelectItem key={room.id} value={room.id.toString()}>
                                Phòng {room.roomNumber} - {Number(room.price).toLocaleString('vi-VN')} VNĐ/tháng
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">Ngày kết thúc</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyRent">Giá thuê/tháng (VNĐ) *</Label>
                        <Input
                          id="monthlyRent"
                          type="number"
                          value={formData.monthlyRent}
                          onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deposit">Tiền cọc (VNĐ)</Label>
                        <Input
                          id="deposit"
                          type="number"
                          value={formData.deposit}
                          onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <Input
                          id="notes"
                          type="text"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Ghi chú về hợp đồng..."
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {editingTenant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ tên *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0901234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Đường ABC, Quận XYZ"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingTenant ? 'Cập nhật' : 'Tạo người thuê'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md border-primary/30 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-primary">Thông tin đăng nhập</CardTitle>
              <CardDescription>Tài khoản người thuê đã được tạo thành công</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900 mb-2">Vui lòng lưu lại thông tin đăng nhập:</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-semibold text-blue-800">Số điện thoại (Tài khoản đăng nhập):</span>
                    <p className="text-lg font-mono bg-white p-2 rounded border border-blue-300 text-blue-900">
                      {newTenantPhone}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-blue-800">Mật khẩu tạm thời:</span>
                    <p className="text-lg font-mono bg-white p-2 rounded border border-blue-300 text-blue-900">
                      {newTenantPassword}
                    </p>
                  </div>
                  {newTenantRoom && (
                    <div>
                      <span className="text-sm font-semibold text-blue-800">Phòng đã được gán:</span>
                      <p className="text-lg font-semibold bg-white p-2 rounded border border-blue-300 text-blue-900">
                        {newTenantRoom}
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-blue-700 mt-3 italic">
                  * Người thuê đăng nhập bằng số điện thoại và mật khẩu tạm thời. Nên đổi mật khẩu sau lần đăng nhập đầu tiên.
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewTenantPassword('');
                  setNewTenantPhone('');
                  setNewTenantRoom('');
                }}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Đã ghi nhận
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex justify-between items-start">
                <CardTitle className="text-primary">{tenant.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tenant)}
                    className="h-8 px-3 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(tenant.id)}
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
                  <span className="font-medium">SĐT (Tài khoản):</span> {tenant.phone}
                </p>
                {tenant.user.email && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Email:</span> {tenant.user.email}
                  </p>
                )}
                {tenant.address && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Địa chỉ:</span> {tenant.address}
                  </p>
                )}
                <div className="pt-2 border-t border-primary/10">
                  {tenant.contracts && tenant.contracts.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-primary">Thông tin phòng:</p>
                      {tenant.contracts
                        .filter((c) => c.status === 'active')
                        .map((contract) => (
                          <div key={contract.id} className="flex items-center gap-2">
                            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                              Phòng {contract.room.roomNumber}
                              {contract.room.floor && ` - Tầng ${contract.room.floor}`}
                            </span>
                            <span className="text-xs text-green-600 font-medium">(Đang thuê)</span>
                          </div>
                        ))}
                      {tenant.contracts.filter((c) => c.status !== 'active').length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground">
                            Đã có {tenant.contracts.filter((c) => c.status !== 'active').length} hợp đồng trước đó
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                          ⚠️ Chưa có phòng
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        Vào mục "Hợp đồng" để tạo hợp đồng và gán phòng cho người thuê này
                      </p>
                    </div>
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


