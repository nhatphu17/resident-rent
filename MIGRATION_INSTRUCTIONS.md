# Hướng dẫn Migration Database

## Vấn đề
Đã thêm field `createdByLandlordId` vào model `Tenant` để track landlord nào đã tạo tenant nào. Điều này giúp hiển thị người thuê ngay sau khi tạo, kể cả khi chưa có hợp đồng.

## Cách chạy Migration

### Bước 1: Tạo migration
```bash
cd backend
npx prisma migrate dev --name add_created_by_landlord_to_tenant
```

### Bước 2: Generate Prisma Client
```bash
npx prisma generate
```

### Bước 3: (Tùy chọn) Nếu có dữ liệu cũ
Nếu bạn đã có dữ liệu trong database, field `createdByLandlordId` sẽ là `null` cho các tenant cũ. Điều này không ảnh hưởng đến chức năng, nhưng các tenant cũ sẽ chỉ xuất hiện sau khi có hợp đồng.

## Lưu ý
- Field `createdByLandlordId` là optional (nullable), nên migration sẽ không ảnh hưởng đến dữ liệu hiện có
- Sau khi migration, các tenant mới được tạo sẽ tự động có `createdByLandlordId` được set
- Các tenant cũ vẫn hoạt động bình thường, chỉ là sẽ không xuất hiện trong danh sách cho đến khi có hợp đồng

