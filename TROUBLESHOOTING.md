# Hướng dẫn khắc phục lỗi

## Lỗi: ECONNREFUSED khi thêm khách thuê

### Nguyên nhân
Lỗi `ECONNREFUSED` xảy ra khi frontend không thể kết nối đến backend server. Điều này thường do:
1. Backend server chưa được khởi động
2. Backend đang chạy ở port khác với port được cấu hình (3000)
3. Có vấn đề với cấu hình proxy trong Vite

### Cách khắc phục

#### Bước 1: Kiểm tra Backend có đang chạy không

Mở terminal mới và chạy:
```bash
cd backend
npm run start:dev
```

Backend cần chạy tại `http://localhost:3000`

#### Bước 2: Kiểm tra Frontend có đang chạy không

Mở terminal khác và chạy:
```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

#### Bước 3: Kiểm tra cấu hình Proxy

File `frontend/vite.config.ts` cần có cấu hình:
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
},
```

#### Bước 4: Kiểm tra Database

Đảm bảo database đã được cấu hình và chạy:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### Kiểm tra nhanh

1. Mở trình duyệt và truy cập: `http://localhost:3000/api` - Nếu thấy lỗi 404 hoặc response từ NestJS thì backend đang chạy
2. Kiểm tra console của backend xem có lỗi gì không
3. Kiểm tra Network tab trong DevTools của trình duyệt để xem request có được gửi đi không

### Lưu ý

- Backend và Frontend phải chạy đồng thời
- Backend phải chạy trước khi frontend gọi API
- Nếu đổi port backend, cần cập nhật `vite.config.ts`


