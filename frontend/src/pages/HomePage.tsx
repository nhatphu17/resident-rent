import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Square, Phone, ArrowRight, ChevronLeft, ChevronRight, Map, Eye, Zap, Droplets, Home, Bell, DollarSign, CheckCircle2, Mail, MessageCircle } from 'lucide-react';
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
  images?: string; // JSON array of base64 images
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
  const [currentSlide, setCurrentSlide] = useState(0);

  // Banner slides
  const bannerSlides = [
    {
      title: 'Tìm phòng trọ quanh bạn',
      subtitle: 'Chỉ trong vài giây',
      description: 'Tự động hiển thị phòng trọ gần vị trí hiện tại',
      bgColor: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Quản lý trọ tự động',
      subtitle: 'Không cần ghi chép, không cần nhắc nhở',
      description: 'Tự động hóa toàn bộ việc quản lý phòng, điện nước và thu tiền',
      bgColor: 'from-orange-500 to-red-500',
    },
    {
      title: 'Minh bạch tiền điện nước',
      subtitle: 'Theo dõi real-time',
      description: 'Xem rõ ràng tiền điện, nước, phí và trạng thái thanh toán',
      bgColor: 'from-green-500 to-emerald-500',
    },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

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
            <h1 className="text-2xl font-bold text-primary">🏠 Trọ Quanh Tôi</h1>
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

      {/* Banner Slider */}
      <section className="relative h-64 md:h-96 overflow-hidden">
        {bannerSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`h-full bg-gradient-to-r ${slide.bgColor} flex items-center justify-center text-white`}>
              <div className="text-center px-4 max-w-4xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl md:text-2xl mb-2 font-semibold">{slide.subtitle}</p>
                <p className="text-lg md:text-xl opacity-90">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trọ Quanh Tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Trọ Quanh Tôi là nền tảng giúp người thuê tìm phòng gần vị trí hiện tại chỉ trong vài giây, 
              đồng thời giúp chủ trọ tự động hóa toàn bộ việc quản lý phòng, điện nước và thu tiền – 
              không cần ghi chép, không cần nhắc nhở.
            </p>
          </div>

          {/* Features for Tenants */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-blue-600">
              ✨ Dành cho người thuê
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Map className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h4 className="font-semibold mb-2">🔍 Tự động hiển thị phòng trọ xung quanh bạn</h4>
                  <p className="text-sm text-muted-foreground">
                    Tìm phòng gần vị trí hiện tại chỉ trong vài giây
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h4 className="font-semibold mb-2">🗺️ Xem vị trí, giá, hình ảnh, tiện ích rõ ràng</h4>
                  <p className="text-sm text-muted-foreground">
                    Thông tin chi tiết, minh bạch về phòng trọ
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h4 className="font-semibold mb-2">📱 Liên hệ chủ trọ nhanh chóng</h4>
                  <p className="text-sm text-muted-foreground">
                    Liên hệ trực tiếp với chủ trọ qua số điện thoại
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h4 className="font-semibold mb-2">💡 Minh bạch tiền điện – nước – phí</h4>
                  <p className="text-sm text-muted-foreground">
                    Xem rõ ràng các khoản phí cần thanh toán
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features for Landlords */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8 text-orange-600">
              🏠 Dành cho chủ trọ / chung cư mini
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Home className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h4 className="font-semibold mb-2">🏠 Quản lý phòng & người thuê tập trung</h4>
                  <p className="text-sm text-muted-foreground">
                    Quản lý tất cả phòng và người thuê tại một nơi
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h4 className="font-semibold mb-2">⚡ Tự động chốt điện – nước hàng tháng</h4>
                  <p className="text-sm text-muted-foreground">
                    Tự động tính toán và chốt chỉ số điện nước
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h4 className="font-semibold mb-2">🧾 Tự động tạo bill & gửi cho người thuê</h4>
                  <p className="text-sm text-muted-foreground">
                    Tự động tạo hóa đơn và gửi cho người thuê
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h4 className="font-semibold mb-2">🔔 Tự động nhắc thanh toán (Zalo / SMS)</h4>
                  <p className="text-sm text-muted-foreground">
                    Tự động gửi thông báo nhắc nhở thanh toán
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <h4 className="font-semibold mb-2">💰 Theo dõi trạng thái thanh toán real-time</h4>
                  <p className="text-sm text-muted-foreground">
                    Xem trạng thái thanh toán theo thời gian thực
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-500 to-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tìm phòng quanh bạn – Quản lý trọ tự động
          </h2>
          <p className="text-xl mb-2 opacity-90">
            Không cần chốt điện nước
          </p>
          <p className="text-xl mb-2 opacity-90">
            Không cần nhắc thu tiền
          </p>
          <p className="text-xl mb-8 font-semibold">
            Một app lo tất cả
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
              onClick={() => {
                window.scrollTo({ top: document.getElementById('rooms-section')?.offsetTop || 0, behavior: 'smooth' });
              }}
            >
              👉 Tìm phòng ngay
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => navigate('/register')}
            >
              👉 Dành cho chủ trọ
            </Button>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms-section" className="container mx-auto px-4 py-8">
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
            {filteredRooms.map((room) => {
              const roomImages = room.images && room.images !== 'null' ? (() => {
                try {
                  const parsed = JSON.parse(room.images);
                  return Array.isArray(parsed) ? parsed : [];
                } catch {
                  return [];
                }
              })() : [];
              const firstImage = roomImages.length > 0 ? roomImages[0] : null;
              
              return (
              <Card
                key={room.id}
                className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer border-primary/20"
                onClick={() => navigate(`/room/${room.id}`)}
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={`Phòng ${room.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-muted-foreground text-sm">Chưa có ảnh</span>
                    </div>
                  )}
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
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About App */}
            <div>
              <h3 className="text-xl font-bold mb-4">🏠 Trọ Quanh Tôi</h3>
              <p className="text-gray-400 mb-4">
                Nền tảng giúp người thuê tìm phòng gần vị trí hiện tại chỉ trong vài giây, 
                đồng thời giúp chủ trọ tự động hóa toàn bộ việc quản lý phòng, điện nước và thu tiền.
              </p>
              <p className="text-sm text-gray-500">
                © 2024 Trọ Quanh Tôi. Tất cả quyền được bảo lưu.
              </p>
            </div>

            {/* Contact Support */}
            <div>
              <h3 className="text-xl font-bold mb-4">Liên hệ hỗ trợ</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>Hotline: 1900-xxxx</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="w-5 h-5 mr-3" />
                  <span>Email: support@troquanhtoi.vn</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <span>Zalo: 090-xxx-xxxx</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
              <div className="space-y-2">
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white p-0 justify-start"
                  onClick={() => navigate('/')}
                >
                  Trang chủ
                </Button>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white p-0 justify-start"
                  onClick={() => navigate('/register')}
                >
                  Đăng ký
                </Button>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white p-0 justify-start"
                  onClick={() => navigate('/login')}
                >
                  Đăng nhập
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
