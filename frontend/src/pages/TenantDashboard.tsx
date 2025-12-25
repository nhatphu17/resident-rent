import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import TenantInvoicesPage from './tenant/TenantInvoicesPage';
import TenantUsagePage from './tenant/TenantUsagePage';
import TenantContractsPage from './tenant/TenantContractsPage';

export default function TenantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary">Resident Rent</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/tenant/contracts"
                  className="border-transparent text-gray-600 hover:text-primary hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Hợp đồng
                </Link>
                <Link
                  to="/tenant/invoices"
                  className="border-transparent text-gray-600 hover:text-primary hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Hóa đơn
                </Link>
                <Link
                  to="/tenant/usage"
                  className="border-transparent text-gray-600 hover:text-primary hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
                >
                  Lịch sử điện nước
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user?.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<TenantContractsPage />} />
          <Route path="/contracts" element={<TenantContractsPage />} />
          <Route path="/invoices" element={<TenantInvoicesPage />} />
          <Route path="/usage" element={<TenantUsagePage />} />
        </Routes>
      </main>
    </div>
  );
}


