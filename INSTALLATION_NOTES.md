# Ghi chú cài đặt

## Cài đặt thư viện QR Code

Để sử dụng tính năng QR thanh toán trên trang chi tiết phòng, cần cài đặt thư viện:

```bash
cd frontend
npm install qrcode.react
```

## Các thay đổi chính

### 1. Đăng ký/Đăng nhập
- ✅ Đã bỏ trường email, chỉ sử dụng số điện thoại
- ✅ Số điện thoại là unique và được dùng làm tài khoản đăng nhập

### 2. Giao diện Mobile
- ✅ Đã tối ưu responsive cho tất cả các trang
- ✅ Thêm mobile menu cho dashboard
- ✅ Cải thiện layout cho màn hình nhỏ

### 3. Trang chủ mới
- ✅ Hiển thị danh sách phòng trống (status = 'available')
- ✅ Tìm kiếm theo địa chỉ, số phòng, mô tả
- ✅ Không cần đăng nhập để xem

### 4. Trang chi tiết phòng
- ✅ Hiển thị thông tin đầy đủ về phòng
- ✅ Thông tin liên hệ chủ trọ
- ✅ QR code thanh toán cọc (30% giá phòng)
- ✅ Format QR theo chuẩn VietQR

### 5. API Public
- ✅ `GET /api/rooms/public` - Lấy danh sách phòng trống (không cần auth)
- ✅ `GET /api/rooms/public/:id` - Lấy chi tiết phòng trống (không cần auth)

## Lưu ý

1. Cần chạy migration nếu chưa có field `createdByLandlordId` trong bảng `tenants`
2. Đảm bảo backend đang chạy tại `http://localhost:3000` hoặc cập nhật `VITE_API_URL` trong `.env`
3. QR code sử dụng format VietQR để thanh toán qua ví điện tử

