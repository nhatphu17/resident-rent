import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Bed, Bath, Square, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Room {
  id: number;
  roomNumber: string;
  area: number;
  price: number;
  electricPrice: number;
  waterPrice: number;
  description: string;
  ward?: string;
  district?: string;
  province?: string;
  landlord: {
    id: number;
    name: string;
    phone: string;
    address?: string;
  };
}

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms/public`);
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const searchLower = searchTerm.toLowerCase();
    const fullAddress = [room.ward, room.province, room.landlord.address]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    
    return (
      fullAddress.includes(searchLower) ||
      room.roomNumber.toLowerCase().includes(searchLower) ||
      (room.description?.toLowerCase().includes(searchLower) || false)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">🏠 Tìm Phòng Trọ</h1>
            <div className="flex gap-2">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (user.role === 'LANDLORD') {
                        navigate('/landlord');
                      } else {
                        navigate('/tenant');
                      }
                    }}
                    className="hidden sm:flex"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="hidden sm:flex"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tìm phòng trọ phù hợp với bạn
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Khám phá hàng ngàn phòng trọ chất lượng với giá cả hợp lý
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo địa chỉ, số phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchTerm ? 'Không tìm thấy phòng nào' : 'Hiện chưa có phòng trống'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card
                key={room.id}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border-primary/20"
                onClick={() => navigate(`/room/${room.id}`)}
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10">
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {Number(room.price).toLocaleString('vi-VN')} đ/tháng
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    Phòng {room.roomNumber}
                  </h3>
                  {(() => {
                    const fullAddress = [room.ward, room.province]
                      .filter(Boolean)
                      .join(', ');
                    return fullAddress || room.landlord.address ? (
                      <div className="flex items-center text-muted-foreground mb-3 text-sm">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{fullAddress || room.landlord.address}</span>
                      </div>
                    ) : null;
                  })()}

                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Square className="w-4 h-4 mr-1" />
                      {room.area} m²
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <span>⚡ {Number(room.electricPrice).toLocaleString('vi-VN')} đ/kWh</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <span>💧 {Number(room.waterPrice).toLocaleString('vi-VN')} đ/m³</span>
                    </div>
                  </div>

                  {room.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-1 text-primary" />
                      <span className="font-medium">{room.landlord.phone}</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/room/${room.id}`);
                      }}
                    >
                      Xem chi tiết
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Tìm Phòng Trọ. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

