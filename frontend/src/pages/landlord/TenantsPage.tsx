import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Quản lý người thuê</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle>{tenant.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Email: {tenant.user.email}</p>
              <p className="text-sm text-gray-600">SĐT: {tenant.phone}</p>
              {tenant.address && (
                <p className="text-sm text-gray-600">Địa chỉ: {tenant.address}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


