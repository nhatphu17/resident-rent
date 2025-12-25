import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Contract {
  id: number;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  deposit?: number;
  status: string;
  notes?: string;
  tenant: { id: number; name: string };
  room: { id: number; roomNumber: string; price: number };
}

interface Tenant {
  id: number;
  name: string;
  user: { email: string };
}

interface Room {
  id: number;
  roomNumber: string;
  price: number;
  status: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    tenantId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    deposit: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContracts();
    fetchTenants();
    fetchRooms();
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

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      const availableRooms = response.data.filter((room: Room) => room.status === 'available');
      setRooms(availableRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        tenantId: Number(formData.tenantId),
        roomId: Number(formData.roomId),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        monthlyRent: Number(formData.monthlyRent),
        deposit: formData.deposit ? Number(formData.deposit) : undefined,
        notes: formData.notes || undefined,
        status: editingContract ? editingContract.status : 'active',
      };

      if (editingContract) {
        await api.patch(`/contracts/${editingContract.id}`, data);
      } else {
        await api.post('/contracts', data);
      }

      setShowForm(false);
      setEditingContract(null);
      setFormData({
        tenantId: '',
        roomId: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        deposit: '',
        notes: '',
      });
      fetchContracts();
      fetchRooms(); // Refresh to update room status
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu hợp đồng');
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      tenantId: contract.tenant.id.toString(),
      roomId: contract.room.id.toString(),
      startDate: contract.startDate.split('T')[0],
      endDate: contract.endDate ? contract.endDate.split('T')[0] : '',
      monthlyRent: contract.monthlyRent.toString(),
      deposit: contract.deposit ? contract.deposit.toString() : '',
      notes: contract.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      await api.delete(`/contracts/${id}`);
      fetchContracts();
      fetchRooms(); // Refresh to update room status
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa hợp đồng');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContract(null);
    setFormData({
      tenantId: '',
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
        <h2 className="text-2xl font-bold">Quản lý hợp đồng</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90">
          {showForm ? 'Đóng' : '+ Tạo hợp đồng'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="text-primary">
              {editingContract ? 'Sửa hợp đồng' : 'Tạo hợp đồng mới'}
            </CardTitle>
            <CardDescription>
              {editingContract ? 'Cập nhật thông tin hợp đồng' : 'Nhập thông tin hợp đồng thuê phòng'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Người thuê *</Label>
                  <Select
                    value={formData.tenantId}
                    onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn người thuê" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id.toString()}>
                          {tenant.name} ({tenant.user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingContract ? 'Cập nhật' : 'Tạo hợp đồng'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex justify-between items-start">
                <CardTitle className="text-primary">
                  Hợp đồng - Phòng {contract.room.roomNumber}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contract)}
                    className="h-8 px-3 text-primary border-primary/30 hover:bg-primary/10"
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(contract.id)}
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
                  <span className="font-medium">Người thuê:</span> {contract.tenant.name}
                </p>
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
        ))}
      </div>
    </div>
  );
}


