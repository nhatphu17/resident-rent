# Migration để sửa lỗi "Column: images - value too long"

## Vấn đề
Trường `images` trong database đang dùng `@db.Text` (giới hạn 64KB), không đủ để lưu nhiều ảnh base64.

## Giải pháp
Đã thay đổi schema từ `@db.Text` sang `@db.LongText` (hỗ trợ lên đến 4GB).

## Cách chạy Migration

### Bước 1: Chạy Migration
```bash
cd backend
npx prisma migrate dev --name change_images_to_longtext
```

Hoặc nếu dùng npm:
```bash
cd backend
npm run prisma:migrate dev --name change_images_to_longtext
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
Sau khi migration thành công, restart backend server để áp dụng thay đổi.

## Lưu ý
- Migration sẽ thay đổi kiểu dữ liệu của cột `images` từ `TEXT` sang `LONGTEXT`
- Dữ liệu hiện có sẽ được giữ nguyên
- Nếu có nhiều dữ liệu, migration có thể mất vài giây

## Cải thiện thêm
Frontend đã được cập nhật để tự động nén ảnh trước khi upload:
- Ảnh lớn hơn 500KB sẽ được resize về tối đa 1920x1080
- Chất lượng JPEG được giảm xuống 80% để giảm kích thước file
- Điều này giúp giảm đáng kể kích thước dữ liệu base64

