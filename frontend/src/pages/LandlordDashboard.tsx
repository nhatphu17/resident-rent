import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import RoomsPage from './landlord/RoomsPage';
import TenantsPage from './landlord/TenantsPage';
import ContractsPage from './landlord/ContractsPage';
import InvoicesPage from './landlord/InvoicesPage';
import UsagePage from './landlord/UsagePage';
import SensorDataPage from './landlord/SensorDataPage';

export default function LandlordDashboard() {
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
                  to="/landlord/rooms"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Phòng
                </Link>
                <Link
                  to="/landlord/tenants"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Người thuê
                </Link>
                <Link
                  to="/landlord/contracts"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Hợp đồng
                </Link>
                <Link
                  to="/landlord/invoices"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Hóa đơn
                </Link>
                <Link
                  to="/landlord/usage"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Nhập chỉ số
                </Link>
                <Link
                  to="/landlord/sensors"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dữ liệu IoT
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
          <Route path="/" element={<RoomsPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/usage" element={<UsagePage />} />
          <Route path="/sensors" element={<SensorDataPage />} />
        </Routes>
      </main>
    </div>
  );
}


