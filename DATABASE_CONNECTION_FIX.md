# Khắc phục lỗi kết nối Database

## Lỗi
```
PrismaClientInitializationError: Authentication failed against database server at `localhost`, 
the provided database credentials for `root` are not valid.
```

## Nguyên nhân
Thông tin đăng nhập database không đúng hoặc database chưa được khởi động.

## Cách khắc phục

### Bước 1: Kiểm tra Database đã chạy chưa
Đảm bảo MySQL/MariaDB đã được khởi động:
- **Windows**: Kiểm tra trong Services hoặc chạy MySQL từ XAMPP/WAMP
- **Mac/Linux**: Chạy `sudo service mysql start` hoặc `brew services start mysql`

### Bước 2: Tạo file .env trong thư mục backend
Tạo file `.env` trong thư mục `backend/` với nội dung:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/resident_rent?schema=public"
```

**Thay đổi:**
- `YOUR_PASSWORD`: Mật khẩu MySQL của bạn (nếu không có mật khẩu, để trống: `mysql://root@localhost:3306/...`)
- `3306`: Port MySQL (mặc định là 3306)
- `resident_rent`: Tên database (có thể thay đổi)

### Bước 3: Tạo Database (nếu chưa có)
1. Đăng nhập MySQL:
```bash
mysql -u root -p
```

2. Tạo database:
```sql
CREATE DATABASE IF NOT EXISTS resident_rent;
```

3. Thoát:
```sql
EXIT;
```

### Bước 4: Chạy Migration
```bash
cd backend
npx prisma migrate dev
```

Hoặc nếu database đã có dữ liệu:
```bash
cd backend
npx prisma migrate deploy
```

### Bước 5: Generate Prisma Client
```bash
cd backend
npx prisma generate
```

### Bước 6: Restart Backend Server
Sau khi hoàn tất, restart backend server.

## Ví dụ DATABASE_URL

### MySQL với mật khẩu:
```env
DATABASE_URL="mysql://root:mypassword@localhost:3306/resident_rent?schema=public"
```

### MySQL không có mật khẩu:
```env
DATABASE_URL="mysql://root@localhost:3306/resident_rent?schema=public"
```

### MySQL với user khác:
```env
DATABASE_URL="mysql://username:password@localhost:3306/resident_rent?schema=public"
```

### MariaDB:
```env
DATABASE_URL="mysql://root:password@localhost:3306/resident_rent?schema=public"
```

## Kiểm tra kết nối
Sau khi tạo file `.env`, có thể test kết nối:
```bash
cd backend
npx prisma db pull
```

Nếu thành công, bạn sẽ thấy schema được pull về.

## Lưu ý
- File `.env` không nên được commit vào git (đã có trong .gitignore)
- Đảm bảo database đã được tạo trước khi chạy migration
- Nếu dùng XAMPP/WAMP, đảm bảo MySQL service đã được start

