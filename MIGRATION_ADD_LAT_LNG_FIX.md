# Hướng dẫn chạy Migration để thêm latitude và longitude

## Vấn đề
Lỗi: `The column resident_rent.rooms.latitude does not exist in the current database.`

Nguyên nhân: Schema Prisma đã có các trường `latitude` và `longitude`, nhưng database chưa có các cột này.

## Giải pháp

### Bước 1: Mở Terminal và chuyển đến thư mục backend
```bash
cd backend
```

### Bước 2: Chạy Migration
```bash
npx prisma migrate dev --name add_latitude_longitude_to_room
```

Hoặc nếu dùng npm:
```bash
npm run prisma:migrate dev --name add_latitude_longitude_to_room
```

**Lưu ý:** Nếu bạn đang dùng PowerShell trên Windows, có thể cần chạy:
```powershell
cd backend
npx prisma migrate dev --name add_latitude_longitude_to_room
```

### Bước 3: Generate Prisma Client (nếu cần)
Sau khi migration thành công, Prisma sẽ tự động generate client. Nhưng nếu cần, bạn có thể chạy:
```bash
npx prisma generate
```

### Bước 4: Restart Backend Server
Sau khi migration thành công, restart backend server để áp dụng thay đổi.

## Kiểm tra Migration

Sau khi chạy migration, bạn có thể kiểm tra bằng cách:
1. Mở MySQL và kiểm tra bảng `rooms`:
   ```sql
   DESCRIBE rooms;
   ```
   Bạn sẽ thấy 2 cột mới: `latitude` và `longitude` với kiểu `FLOAT`.

2. Hoặc kiểm tra migration files trong `backend/prisma/migrations/`

## Lưu ý
- Migration sẽ thêm 2 cột mới vào bảng `rooms`
- Các phòng hiện có sẽ có `latitude` và `longitude` = NULL
- Chủ nhà có thể cập nhật tọa độ khi tạo/sửa phòng từ form trong `RoomsPage.tsx`

## Nếu gặp lỗi

### Lỗi: "npx is not recognized"
- Đảm bảo Node.js và npm đã được cài đặt
- Thử dùng `npm run` thay vì `npx`

### Lỗi: "Database connection failed"
- Kiểm tra file `.env` trong thư mục `backend`
- Đảm bảo MySQL server đang chạy
- Xem thêm `DATABASE_CONNECTION_FIX.md`

### Lỗi: "Migration already exists"
- Nếu migration đã được tạo nhưng chưa apply, chạy:
  ```bash
  npx prisma migrate deploy
  ```

