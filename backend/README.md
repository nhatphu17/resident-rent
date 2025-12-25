# Resident Rent - Hệ thống quản lý nhà trọ

Hệ thống web quản lý nhà trọ đa tenant với đầy đủ tính năng quản lý phòng, khách thuê, hợp đồng, hóa đơn và tích hợp IoT.

## 🚀 Tính năng

### Multi-tenant
- Nhiều chủ trọ (landlord) có thể đăng ký và sử dụng ứng dụng
- Mỗi chủ trọ quản lý độc lập dữ liệu của mình

### Quản lý
- **Phòng**: CRUD phòng, cấu hình giá phòng, giá điện/nước
- **Người thuê**: Quản lý thông tin người thuê
- **Hợp đồng**: Tạo và quản lý hợp đồng thuê
- **Hóa đơn**: Tự động tạo hóa đơn hàng tháng, theo dõi trạng thái thanh toán

### Điện nước
- Nhập chỉ số thủ công hoặc tự động từ module IoT
- Tính toán tiền điện/nước tự động
- Lịch sử sử dụng điện nước

### Thông báo & Xuất file
- Gửi SMS thông báo hóa đơn (hỗ trợ Twilio/eSMS/Zalo OA)
- Xuất hóa đơn PDF
- Nhắc thanh toán tự động hàng tháng

### Dashboard
- **Landlord Dashboard**: Quản lý toàn bộ hoạt động
- **Tenant Dashboard**: Xem hóa đơn, lịch sử, tải PDF

## 🛠️ Công nghệ

### Backend
- **NestJS** - Framework Node.js
- **Prisma** - ORM
- **MySQL** - Database
- **JWT** - Authentication
- **Cron Jobs** - Tự động tạo hóa đơn

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn UI** - Component library
- **React Router** - Routing
- **Axios** - HTTP client
- **Recharts** - Charts

## 📦 Cài đặt

### Yêu cầu
- Node.js >= 18
- MySQL >= 8.0
- npm hoặc yarn

### Backend Setup

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cấu hình database trong `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/resident_rent?schema=public"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3000
```

4. Chạy migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Chạy server:
```bash
npm run start:dev
```

Backend sẽ chạy tại `http://localhost:3000`

### Frontend Setup

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Rooms
- `GET /api/rooms` - Lấy danh sách phòng
- `POST /api/rooms` - Tạo phòng mới
- `GET /api/rooms/:id` - Lấy thông tin phòng
- `PATCH /api/rooms/:id` - Cập nhật phòng
- `DELETE /api/rooms/:id` - Xóa phòng

### Tenants
- `GET /api/tenants` - Lấy danh sách người thuê
- `POST /api/tenants` - Tạo người thuê mới
- `GET /api/tenants/:id` - Lấy thông tin người thuê

### Contracts
- `GET /api/contracts` - Lấy danh sách hợp đồng
- `POST /api/contracts` - Tạo hợp đồng mới
- `GET /api/contracts/:id` - Lấy thông tin hợp đồng

### Usage
- `POST /api/usage/manual` - Nhập chỉ số thủ công
- `POST /api/usage/auto` - Nhập chỉ số tự động (IoT)
- `GET /api/usage` - Lấy lịch sử sử dụng

### Invoices
- `GET /api/invoices` - Lấy danh sách hóa đơn
- `POST /api/invoices` - Tạo hóa đơn
- `GET /api/invoices/:id` - Lấy thông tin hóa đơn
- `PATCH /api/invoices/:id/status` - Cập nhật trạng thái
- `POST /api/invoices/:id/send-sms` - Gửi SMS thông báo

### PDF
- `GET /api/pdf/invoice/:id` - Tải hóa đơn PDF

### Sensor Data
- `POST /api/sensor-data` - Gửi dữ liệu từ IoT (không cần auth)
- `GET /api/sensor-data` - Lấy dữ liệu cảm biến

## 🔐 Authentication

Hệ thống sử dụng JWT authentication. Sau khi đăng nhập, token được lưu trong localStorage và tự động gửi kèm mỗi request.

## 📱 SMS Integration

Hệ thống hỗ trợ nhiều SMS provider:
- **Twilio** (mặc định)
- **eSMS**
- **Zalo OA**

Cấu hình trong `.env`:
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number
```

Nếu không cấu hình, hệ thống sẽ mock SMS (in ra console).

## 🔄 Cron Jobs

Hệ thống tự động tạo hóa đơn vào ngày đầu mỗi tháng lúc 00:00.

## 📄 License

MIT


