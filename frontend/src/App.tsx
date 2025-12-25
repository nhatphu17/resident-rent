import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import RoomDetailPage from './pages/RoomDetailPage';
import LandlordDashboard from './pages/LandlordDashboard';
import TenantDashboard from './pages/TenantDashboard';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: 'LANDLORD' | 'TENANT' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to={user.role === 'LANDLORD' ? '/landlord' : '/tenant'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:id" element={<RoomDetailPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'LANDLORD' ? '/landlord' : '/tenant'} replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.role === 'LANDLORD' ? '/landlord' : '/tenant'} replace />} />
      <Route
        path="/landlord/*"
        element={
          <ProtectedRoute requiredRole="LANDLORD">
            <LandlordDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenant/*"
        element={
          <ProtectedRoute requiredRole="TENANT">
            <TenantDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


