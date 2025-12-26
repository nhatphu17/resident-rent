import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import RoomsPage from './landlord/RoomsPage';
import TenantsPage from './landlord/TenantsPage';
import ContractsPage from './landlord/ContractsPage';
import InvoicesPage from './landlord/InvoicesPage';
import UsagePage from './landlord/UsagePage';
import SensorDataPage from './landlord/SensorDataPage';

export default function LandlordDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/landlord/rooms', label: 'Phòng' },
    { path: '/landlord/tenants', label: 'Người thuê' },
    { path: '/landlord/contracts', label: 'Hợp đồng' },
    { path: '/landlord/usage', label: 'Nhập chỉ số' },
    { path: '/landlord/sensors', label: 'Dữ liệu IoT' },
    { path: '/landlord/invoices', label: 'Hóa đơn' },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
      <nav className="bg-white border-b border-primary/20 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Resident Rent
                </h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-2 lg:px-3 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-600 hover:text-primary hover:border-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline text-xs sm:text-sm text-gray-700 font-medium truncate max-w-[120px] sm:max-w-none">
                {user?.phone || user?.email}
              </span>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-primary/30 text-primary hover:bg-primary/10 text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Đăng xuất</span>
                <span className="sm:hidden">Thoát</span>
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-primary"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
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


