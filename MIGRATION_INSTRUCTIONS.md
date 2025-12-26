# Hướng dẫn chạy Migration để thêm trường images

## Vấn đề
Sau khi thêm trường `images` vào schema Prisma, cần chạy migration để cập nhật database và Prisma Client.

## Cách khắc phục

### Bước 1: Chạy Migration
```bash
cd backend
npx prisma migrate dev --name add_room_images
```

Hoặc nếu dùng npm:
```bash
cd backend
npm run prisma:migrate dev --name add_room_images
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

### Bước 3: Uncomment images trong code
Sau khi migration thành công, mở file `backend/src/rooms/rooms.service.ts` và uncomment dòng:
```typescript
images: true, // Uncomment after running migration
```

Thành:
```typescript
images: true,
```

### Bước 4: Restart Backend Server
Sau khi hoàn tất, restart backend server để áp dụng thay đổi.

## Lưu ý
- Migration sẽ tạo migration file mới trong `backend/prisma/migrations/`
- Nếu có dữ liệu trong database, migration sẽ thêm cột mới với giá trị `NULL`
- Đảm bảo đã backup database trước khi chạy migration (nếu cần)
