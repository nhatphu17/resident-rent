import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Square, ArrowLeft, QrCode, Copy, Check } from 'lucide-react';
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
  qrCodeImage?: string;
  images?: string; // JSON array of base64 images
  landlord: {
    id: number;
    name: string;
    phone: string;
    address?: string;
  };
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchRoom();
    }
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms/public/${id}`);
      setRoom(response.data);
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  const depositAmount = room ? Number(room.price) * 0.3 : 0; // 30% deposit
  
  // Parse room images
  const roomImages = room?.images ? (() => {
    try {
      return JSON.parse(room.images);
    } catch {
      return [];
    }
  })() : [];
  
  // Build full address
  const fullAddress = room
    ? [room.ward, room.province].filter(Boolean).join(', ')
    : room?.landlord.address || '';

  const copyPhone = () => {
    if (room) {
      navigator.clipboard.writeText(room.landlord.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Không tìm thấy phòng</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Về trang chủ
          </Button>
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
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Room Images Slide */}
          <div className="relative h-64 md:h-96 rounded-lg mb-6 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10">
            {roomImages.length > 0 ? (
              <>
                <img
                  src={roomImages[currentImageIndex]}
                  alt={`Phòng ${room.roomNumber} - Ảnh ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {roomImages.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? roomImages.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    >
                      ‹
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentImageIndex((prev) => (prev === roomImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    >
                      ›
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {roomImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Chưa có ảnh phòng</p>
                </div>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full text-lg font-semibold">
              {Number(room.price).toLocaleString('vi-VN')} đ/tháng
            </div>
            <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded-lg">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Phòng {room.roomNumber}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fullAddress && (
                    <div className="flex items-start text-muted-foreground">
                      <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{fullAddress}</span>
                    </div>
                  )}
                  {room.landlord.address && !fullAddress && (
                    <div className="flex items-start text-muted-foreground">
                      <MapPin className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{room.landlord.address}</span>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <Square className="w-5 h-5 mr-2" />
                    <span>Diện tích: {room.area} m²</span>
                  </div>
                  {room.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Mô tả:</h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {room.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Giá cả</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Giá phòng/tháng:</span>
                    <span className="font-semibold text-lg">
                      {Number(room.price).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Giá điện:</span>
                    <span className="font-semibold">
                      {Number(room.electricPrice).toLocaleString('vi-VN')} đ/kWh
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Giá nước:</span>
                    <span className="font-semibold">
                      {Number(room.waterPrice).toLocaleString('vi-VN')} đ/m³
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Chủ trọ:</p>
                    <p className="font-semibold">{room.landlord.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Số điện thoại:</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{room.landlord.phone}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyPhone}
                        className="ml-auto"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <a
                      href={`tel:${room.landlord.phone}`}
                      className="text-primary hover:underline text-sm mt-2 block"
                    >
                      Gọi ngay
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Deposit & QR Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Đặt cọc</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Số tiền cọc (30%):</p>
                    <p className="text-2xl font-bold text-primary">
                      {depositAmount.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  {room.qrCodeImage ? (
                    <>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => setShowQR(!showQR)}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        {showQR ? 'Ẩn' : 'Hiển thị'} QR thanh toán
                      </Button>
                      {showQR && (
                        <div className="flex flex-col items-center pt-4 border-t">
                          <div className="bg-white p-4 rounded-lg border-2 border-primary/20">
                            <img
                              src={room.qrCodeImage}
                              alt="QR Code thanh toán"
                              className="max-w-[200px] w-full h-auto"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-4 text-center">
                            Quét mã QR để thanh toán cọc qua ví điện tử
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Chưa có QR code thanh toán
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

