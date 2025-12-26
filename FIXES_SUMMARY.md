# Tóm tắt các sửa đổi

## 1. Sửa lỗi 403 trong GeocodingService

### Vấn đề:
- Geocoding API trả về 403 Forbidden
- Latitude và longitude = 0 khi tạo phòng

### Giải pháp:
- Thêm delay 1 giây giữa các request (theo yêu cầu của Nominatim API)
- Cải thiện User-Agent header
- Thêm Accept và Accept-Language headers
- Xử lý lỗi tốt hơn với logging chi tiết

**File đã sửa:**
- `backend/src/geocoding/geocoding.service.ts`

## 2. Cập nhật logic update room để luôn geocode lại

### Vấn đề:
- Khi update room, latitude và longitude không được cập nhật lại

### Giải pháp:
- Luôn geocode lại khi có địa chỉ và tọa độ = 0 hoặc undefined
- Xử lý cả trường hợp update địa chỉ và không update địa chỉ
- Giữ nguyên tọa độ cũ nếu geocoding thất bại

**File đã sửa:**
- `backend/src/rooms/rooms.service.ts` (method `update`)

## 3. Chuyển từ lưu base64 sang lưu file

### Vấn đề:
- Ảnh QR code và ảnh phòng đang lưu dạng base64 trong database
- Làm database lớn và chậm

### Giải pháp:
- Tạo `UploadService` để lưu file vào `public/uploads/` folder
- Tự động chuyển đổi base64 thành file khi tạo/sửa phòng
- Chỉ lưu URL của file vào database
- Xóa file cũ khi update ảnh mới
- Serve static files từ `public` folder

**Files đã tạo:**
- `backend/src/upload/upload.service.ts`
- `backend/src/upload/upload.module.ts`

**Files đã sửa:**
- `backend/src/rooms/rooms.module.ts` (import UploadModule)
- `backend/src/rooms/rooms.service.ts` (sử dụng UploadService)
- `backend/src/main.ts` (serve static files)
- `frontend/src/lib/utils.ts` (thêm `getImageUrl` function)
- `frontend/src/pages/HomePage.tsx` (sử dụng `getImageUrl`)
- `frontend/src/pages/RoomDetailPage.tsx` (sử dụng `getImageUrl`)
- `frontend/src/pages/tenant/TenantInvoicesPage.tsx` (sử dụng `getImageUrl`)

## Cấu trúc thư mục

Sau khi chạy ứng dụng, các file ảnh sẽ được lưu tại:
```
backend/
  public/
    uploads/
      qr-codes/
        [uuid].jpg (hoặc .png, .webp)
      rooms/
        [uuid].jpg (hoặc .png, .webp)
```

## URL của ảnh

Ảnh sẽ được truy cập qua URL:
- QR Code: `http://localhost:3000/uploads/qr-codes/[filename]`
- Room Images: `http://localhost:3000/uploads/rooms/[filename]`

## Lưu ý

1. **Migration**: Cần chạy migration để thêm cột `latitude` và `longitude` vào bảng `rooms` (xem `MIGRATION_ADD_LAT_LNG_FIX.md`)

2. **Thư mục public**: Thư mục `backend/public` sẽ được tạo tự động khi chạy ứng dụng lần đầu

3. **Frontend**: Frontend vẫn có thể gửi base64, backend sẽ tự động chuyển đổi thành file và lưu URL

4. **Backward compatibility**: Code vẫn hỗ trợ cả base64 và URL, đảm bảo tương thích với dữ liệu cũ

## Testing

1. Tạo phòng mới với địa chỉ → Kiểm tra latitude/longitude được lấy tự động
2. Update phòng với địa chỉ mới → Kiểm tra latitude/longitude được cập nhật
3. Upload ảnh QR code và ảnh phòng → Kiểm tra file được lưu trong `public/uploads/`
4. Kiểm tra URL ảnh hoạt động trên frontend

