# Migration để thêm latitude và longitude vào Room

## Thay đổi
Thêm 2 trường mới vào model `Room`:
- `latitude` (Float, optional) - Vĩ độ
- `longitude` (Float, optional) - Kinh độ

## Cách chạy Migration

### Bước 1: Chạy Migration
```bash
cd backend
npx prisma migrate dev --name add_latitude_longitude_to_room
```

Hoặc nếu dùng npm:
```bash
cd backend
npm run prisma:migrate dev --name add_latitude_longitude_to_room
```

### Bước 2: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

Hoặc:
```bash
cd backend
npm run prisma:generate
```

### Bước 3: Restart Backend Server
Sau khi migration thành công, restart backend server.

## Lưu ý
- Migration sẽ thêm 2 cột mới vào bảng `rooms`
- Các phòng hiện có sẽ có `latitude` và `longitude` = NULL
- Chủ nhà có thể cập nhật tọa độ khi tạo/sửa phòng
- Tọa độ có thể được lấy từ Google Maps hoặc các dịch vụ geocoding khác

## Cách lấy tọa độ cho phòng

### Option 1: Sử dụng Google Maps
1. Mở Google Maps
2. Tìm địa chỉ phòng (xã/phường - tỉnh)
3. Click vào vị trí trên bản đồ
4. Copy tọa độ từ URL hoặc click chuột phải → "Tọa độ"

### Option 2: Sử dụng Geocoding API (tự động)
Có thể tích hợp API để tự động chuyển đổi địa chỉ → tọa độ khi tạo phòng.

