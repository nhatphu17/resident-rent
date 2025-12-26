import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Square, Phone, ArrowRight, ChevronLeft, ChevronRight, Map, Eye, Zap, Droplets, Home, Bell, DollarSign, CheckCircle2, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistance } from '@/utils/distance';
import { getImageUrl } from '@/lib/utils';
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
  latitude?: number;
  longitude?: number;
  images?: string; // JSON array of base64 images
  landlord: {
    id: number;
    name: string;
    phone: string;
    address?: string;
  };
  distance?: number; // Distance in km (calculated by backend)
}

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxDistance, setMaxDistance] = useState<number | null>(null); // null = tất cả, số = km
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { latitude, longitude, error: geoError, loading: geoLoading, retry: retryGeolocation } = useGeolocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Banner slides - Using image banners
  // Place your banner images in: frontend/public/banners/
  // Recommended size: 1920x600px or similar aspect ratio
  const bannerSlides = [
    {
      imageUrl: '/banners/banner-1.png', // First banner image
      alt: 'Tìm phòng quanh bạn – Quản lý trọ tự động',
    },
    {
      imageUrl: '/banners/banner-2.png', // Second banner image  
      alt: 'Trọ Quanh Tôi – Tìm phòng trọ gần bạn & Quản lý trọ tự động',
    },
  ];

  // Debug geolocation state
  useEffect(() => {
    console.log('Geolocation state changed:', { latitude, longitude, error: geoError, loading: geoLoading });
  }, [latitude, longitude, geoError, geoLoading]);

  useEffect(() => {
    // Only fetch rooms after geolocation has finished loading (success or error)
    if (!geoLoading) {
      fetchRooms();
    }
  }, [latitude, longitude, maxDistance, geoLoading]); // Refetch when location or filter changes, but wait for geolocation to finish

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchRooms = async () => {
    try {
      // Build query params with location if available
      const params = new URLSearchParams();
      if (latitude && longitude) {
        params.append('latitude', latitude.toString());
        params.append('longitude', longitude.toString());
        if (maxDistance !== null) {
          params.append('maxDistance', maxDistance.toString());
        }
      }

      const queryString = params.toString();
      const url = `${API_URL}/api/rooms/public${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching rooms with params:', { latitude, longitude, maxDistance, url });
      
      const response = await axios.get(url);
      const roomsData = response.data;
      
      // Backend now returns rooms with distance already calculated and sorted
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms by search term only (distance filtering and sorting is done by backend)
  const filteredRooms = useMemo(() => {
    if (!searchTerm) {
      // If no search term, return all rooms (already sorted by backend)
      return rooms;
    }

    const searchLower = searchTerm.toLowerCase();
    return rooms.filter((room) => {
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
  }, [rooms, searchTerm]);

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

      {/* Banner Slider - Optimized for mobile */}
      <section className="relative h-48 md:h-64 lg:h-80 overflow-hidden bg-gray-100">
        {bannerSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.alt}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback gradient if image fails to load */}
            <div 
              className="hidden w-full h-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center text-white"
              style={{ display: 'none' }}
            >
              <div className="text-center px-4">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">{slide.alt}</h2>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full transition-all z-10 backdrop-blur-sm"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/30 text-white p-2 rounded-full transition-all z-10 backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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

      {/* Introduction Section - Optimized for mobile */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
              Trọ Quanh Tôi
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto px-2">
              Nền tảng giúp người thuê tìm phòng gần vị trí hiện tại chỉ trong vài giây, 
              đồng thời giúp chủ trọ tự động hóa toàn bộ việc quản lý phòng, điện nước và thu tiền.
            </p>
          </div>

          {/* Features for Tenants - Compact on mobile */}
          <div className="mb-8 md:mb-12">
            <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6 text-blue-600">
              ✨ Dành cho người thuê
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <Map className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-blue-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">🔍 Tự động hiển thị</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Tìm phòng gần vị trí
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <Eye className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-blue-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">🗺️ Xem chi tiết</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Vị trí, giá, hình ảnh
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <Phone className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-blue-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">📱 Liên hệ nhanh</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Liên hệ chủ trọ
                  </p>
                </CardContent>
              </Card>
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <DollarSign className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-blue-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">💡 Minh bạch</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Tiền điện nước
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features for Landlords - Compact on mobile */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6 text-orange-600">
              🏠 Dành cho chủ trọ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <Home className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-orange-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">🏠 Quản lý tập trung</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Phòng & người thuê
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <Zap className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-orange-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">⚡ Tự động chốt</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Điện nước hàng tháng
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-orange-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">🧾 Tự động tạo bill</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Gửi cho người thuê
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <Bell className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-orange-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">🔔 Nhắc thanh toán</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Zalo / SMS
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-3 md:p-4 text-center">
                  <DollarSign className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 text-orange-500" />
                  <h4 className="text-xs md:text-sm font-semibold mb-1">💰 Theo dõi real-time</h4>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    Trạng thái thanh toán
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Compact for mobile */}
      <section className="py-8 md:py-12 bg-gradient-to-r from-blue-500 to-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4">
            Tìm phòng quanh bạn – Quản lý trọ tự động
          </h2>
          <p className="text-sm md:text-base mb-1 opacity-90">
            Không cần chốt điện nước • Không cần nhắc thu tiền
          </p>
          <p className="text-base md:text-lg mb-4 md:mb-6 font-semibold">
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

          {/* Search Bar and Location Button */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo địa chỉ, số phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                />
              </div>
              {latitude && longitude && (
                <select
                  value={maxDistance === null ? 'all' : maxDistance.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMaxDistance(value === 'all' ? null : Number(value));
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
                  title="Lọc theo khoảng cách"
                >
                  <option value="all">📍 Tất cả phòng</option>
                  <option value="5">📍 Trong 5km</option>
                  <option value="10">📍 Trong 10km</option>
                  <option value="20">📍 Trong 20km</option>
                  <option value="50">📍 Trong 50km</option>
                </select>
              )}
            </div>
            {geoError && (
              <div className="text-center">
                <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-lg inline-block">
                  ⚠️ {geoError}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryGeolocation}
                    disabled={geoLoading}
                    className="text-xs"
                  >
                    {geoLoading ? 'Đang thử lại...' : '🔄 Thử lại lấy vị trí'}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    hoặc tìm phòng bằng cách nhập địa chỉ vào ô tìm kiếm
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info message when location is available */}
        {latitude && longitude && (
          <div className="mb-4 text-center">
            <p className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg inline-block">
              📍 Danh sách phòng đang được sắp xếp theo khoảng cách gần bạn nhất
              {maxDistance !== null && ` (trong vòng ${maxDistance}km)`}
            </p>
          </div>
        )}

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchTerm 
                ? 'Không tìm thấy phòng nào phù hợp với từ khóa tìm kiếm' 
                : maxDistance !== null && latitude && longitude
                ? `Không có phòng nào trong vòng ${maxDistance}km từ vị trí của bạn`
                : 'Hiện chưa có phòng trống'}
            </p>
            {maxDistance !== null && latitude && longitude && (
              <Button
                variant="outline"
                onClick={() => setMaxDistance(null)}
                className="mt-4"
              >
                Xem tất cả phòng
              </Button>
            )}
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
                      src={getImageUrl(firstImage)}
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
                      <div className="flex items-center justify-between text-muted-foreground mb-3 text-sm gap-2">
                        <div className="flex items-center flex-1 min-w-0">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{fullAddress || room.landlord.address}</span>
                        </div>
                        {room.distance !== undefined && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0">
                            Cách bạn {formatDistance(room.distance)}
                          </span>
                        )}
                      </div>
                    ) : (
                      room.distance !== undefined && (
                        <div className="mb-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            Cách bạn {formatDistance(room.distance)}
                          </span>
                        </div>
                      )
                    );
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
