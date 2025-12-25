import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Tenant {
  id: number;
  name: string;
  phone: string;
  address?: string;
  user: {
    email: string;
  };
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newTenantPassword, setNewTenantPassword] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
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
          email: '',
          name: '',
          phone: '',
          address: '',
        });
      } else {
        const response = await api.post('/tenants', formData);
        setNewTenantPassword(response.data.tempPassword);
        setNewTenantEmail(formData.email);
        setShowPasswordModal(true);
        setShowForm(false);
        setFormData({
          email: '',
          name: '',
          phone: '',
          address: '',
        });
      }
      fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu người thuê');
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      email: tenant.user.email,
      name: tenant.name,
      phone: tenant.phone,
      address: tenant.address || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người thuê này? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      await api.delete(`/tenants/${id}`);
      fetchTenants();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xóa người thuê');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTenant(null);
    setFormData({
      email: '',
      name: '',
      phone: '',
      address: '',
    });
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!editingTenant && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tenant@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                )}
                {editingTenant && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
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
                <div className="space-y-2">
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
                    <span className="text-sm font-semibold text-blue-800">Email:</span>
                    <p className="text-lg font-mono bg-white p-2 rounded border border-blue-300 text-blue-900">
                      {newTenantEmail}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-blue-800">Mật khẩu tạm thời:</span>
                    <p className="text-lg font-mono bg-white p-2 rounded border border-blue-300 text-blue-900">
                      {newTenantPassword}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-3 italic">
                  * Người thuê nên đổi mật khẩu sau lần đăng nhập đầu tiên
                </p>
              </div>
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewTenantPassword('');
                  setNewTenantEmail('');
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
                  <span className="font-medium">Email:</span> {tenant.user.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">SĐT:</span> {tenant.phone}
                </p>
                {tenant.address && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Địa chỉ:</span> {tenant.address}
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


