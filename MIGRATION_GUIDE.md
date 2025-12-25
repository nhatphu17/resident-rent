# Hướng dẫn Migration - Thêm QR Code và Địa chỉ

## Các thay đổi trong Database

Đã thêm các trường mới vào bảng `rooms`:
- `ward` (String?) - Xã/Phường
- `district` (String?) - Quận/Huyện  
- `province` (String?) - Tỉnh/Thành phố
- `qrCodeImage` (String? @db.Text) - URL hoặc base64 của QR code thanh toán

## Cách chạy Migration

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Tạo và chạy migration:
```bash
npx prisma migrate dev --name add_qr_code_and_address_fields
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

## Lưu ý

- Các trường mới đều là optional, không ảnh hưởng đến dữ liệu hiện có
- QR code được lưu dưới dạng base64 string hoặc URL
- Địa chỉ được chia thành 3 cấp để dễ tìm kiếm và lọc

## Tính năng mới

1. **Upload QR Code**: Chủ nhà có thể tải lên hình ảnh QR code thanh toán khi thêm/sửa phòng
2. **Địa chỉ chi tiết**: Thêm Xã/Phường, Quận/Huyện, Tỉnh/Thành phố để tìm kiếm chính xác hơn
3. **Tìm kiếm nâng cao**: Khách có thể tìm phòng theo địa chỉ chi tiết

