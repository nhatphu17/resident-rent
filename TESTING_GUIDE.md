# Hướng dẫn Test Chức năng Hợp đồng và Hóa đơn

## Mục lục
1. [Chuẩn bị](#chuẩn-bị)
2. [Test chức năng Hợp đồng](#test-chức-năng-hợp-đồng)
3. [Test chức năng Hóa đơn](#test-chức-năng-hóa-đơn)
4. [Test từ phía Người thuê](#test-từ-phía-người-thuê)
5. [Test API trực tiếp](#test-api-trực-tiếp)

---

## Chuẩn bị

### 1. Khởi động hệ thống

```bash
# Terminal 1: Backend
cd backend
npm install
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

### 2. Tạo dữ liệu test

#### Bước 1: Đăng ký tài khoản Chủ nhà
- Truy cập: `http://localhost:5173/register`
- Chọn vai trò: **Chủ trọ**
- Điền thông tin:
  - Email: `landlord@test.com`
  - Mật khẩu: `password123`
  - Họ tên: `Nguyễn Văn A`
  - SĐT: `0901234567`

#### Bước 2: Tạo phòng
- Đăng nhập với tài khoản chủ nhà
- Vào **Quản lý phòng** → **+ Thêm phòng**
- Tạo ít nhất 2 phòng:
  - Phòng 101: Giá 3,000,000 VNĐ/tháng
  - Phòng 102: Giá 4,000,000 VNĐ/tháng

#### Bước 3: Tạo người thuê
- Vào **Quản lý người thuê** → **+ Thêm người thuê**
- Tạo ít nhất 2 người thuê:
  - Người thuê 1: `tenant1@test.com`
  - Người thuê 2: `tenant2@test.com`
- **Lưu lại mật khẩu tạm thời** được hiển thị

#### Bước 4: Đăng nhập với tài khoản người thuê
- Đăng xuất khỏi tài khoản chủ nhà
- Đăng nhập với email và mật khẩu tạm thời của người thuê

---

## Test chức năng Hợp đồng

### A. Test từ phía Chủ nhà

#### 1. Tạo hợp đồng mới
- **Bước 1**: Đăng nhập với tài khoản chủ nhà
- **Bước 2**: Vào **Quản lý hợp đồng** → **+ Tạo hợp đồng**
- **Bước 3**: Điền thông tin:
  - Người thuê: Chọn người thuê đã tạo
  - Phòng: Chọn phòng (chỉ hiển thị phòng trống)
  - Ngày bắt đầu: Chọn ngày hiện tại hoặc tương lai
  - Ngày kết thúc: (Tùy chọn) Chọn ngày kết thúc
  - Giá thuê/tháng: Tự động điền từ giá phòng (có thể sửa)
  - Tiền cọc: (Tùy chọn) Nhập số tiền cọc
  - Ghi chú: (Tùy chọn) Nhập ghi chú
- **Bước 4**: Nhấn **Tạo hợp đồng**

**Kết quả mong đợi:**
- ✅ Hợp đồng được tạo thành công
- ✅ Phòng chuyển sang trạng thái "Đã thuê"
- ✅ Hợp đồng hiển thị trong danh sách với trạng thái "Đang hoạt động"

#### 2. Xem danh sách hợp đồng
- **Bước**: Vào **Quản lý hợp đồng**

**Kết quả mong đợi:**
- ✅ Hiển thị tất cả hợp đồng của chủ nhà
- ✅ Mỗi hợp đồng hiển thị đầy đủ thông tin:
  - Phòng
  - Người thuê
  - Giá thuê
  - Ngày bắt đầu/kết thúc
  - Trạng thái

#### 3. Test validation
- **Test 1**: Tạo hợp đồng không chọn người thuê → Phải báo lỗi
- **Test 2**: Tạo hợp đồng không chọn phòng → Phải báo lỗi
- **Test 3**: Tạo hợp đồng với phòng đã có hợp đồng active → Phải báo lỗi
- **Test 4**: Tạo hợp đồng với ngày bắt đầu trong quá khứ → Có thể tạo (tùy business logic)

---

### B. Test từ phía Người thuê

#### 1. Xem hợp đồng của mình
- **Bước 1**: Đăng nhập với tài khoản người thuê
- **Bước 2**: Vào **Hợp đồng**

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị hợp đồng của người thuê đó
- ✅ Hiển thị đầy đủ thông tin:
  - Thông tin phòng
  - Thông tin chủ nhà (tên, SĐT)
  - Giá thuê, tiền cọc
  - Ngày bắt đầu/kết thúc
  - Trạng thái

#### 2. Test bảo mật
- **Test**: Người thuê A không thể xem hợp đồng của người thuê B
- **Cách test**: 
  - Tạo hợp đồng cho người thuê A
  - Đăng nhập với người thuê B
  - Kiểm tra chỉ thấy hợp đồng của B (nếu có)

---

## Test chức năng Hóa đơn

### A. Test từ phía Chủ nhà

#### 1. Tạo hóa đơn thủ công (nếu có chức năng)
- **Bước 1**: Vào **Quản lý hóa đơn**
- **Bước 2**: Tìm nút "Tạo hóa đơn" (nếu có)
- **Bước 3**: Chọn hợp đồng, tháng/năm, nhập chỉ số điện/nước
- **Bước 4**: Tạo hóa đơn

**Kết quả mong đợi:**
- ✅ Hóa đơn được tạo với thông tin đúng
- ✅ Tổng tiền = Tiền phòng + Tiền điện + Tiền nước

#### 2. Xem danh sách hóa đơn
- **Bước**: Vào **Quản lý hóa đơn**

**Kết quả mong đợi:**
- ✅ Hiển thị tất cả hóa đơn
- ✅ Mỗi hóa đơn hiển thị:
  - Tháng/năm
  - Phòng
  - Người thuê
  - Tổng tiền
  - Trạng thái (Chờ thanh toán/Đã thanh toán/Quá hạn)
  - Hạn thanh toán

#### 3. Đánh dấu đã thanh toán
- **Bước 1**: Tìm hóa đơn có trạng thái "Chờ thanh toán"
- **Bước 2**: Nhấn **Đánh dấu đã thanh toán**

**Kết quả mong đợi:**
- ✅ Trạng thái chuyển sang "Đã thanh toán"
- ✅ Cập nhật ngày thanh toán

#### 4. Gửi SMS thông báo
- **Bước**: Nhấn **Gửi SMS** trên một hóa đơn

**Kết quả mong đợi:**
- ✅ Hiển thị thông báo "Đã gửi SMS thành công"
- ✅ SMS được gửi đến số điện thoại của người thuê (nếu đã cấu hình Twilio)

#### 5. Tải PDF hóa đơn
- **Bước**: Nhấn **Tải PDF**

**Kết quả mong đợi:**
- ✅ PDF được tải về hoặc mở trong tab mới
- ✅ PDF chứa đầy đủ thông tin hóa đơn

#### 6. Tự động tạo hóa đơn hàng tháng
- **Cách test**: 
  - Tạo hợp đồng với người thuê
  - Nhập chỉ số điện/nước cho tháng hiện tại
  - Chờ đến ngày 1 tháng sau (hoặc chạy cron job thủ công)
  - Kiểm tra hóa đơn tự động được tạo

---

### B. Test từ phía Người thuê

#### 1. Xem hóa đơn của mình
- **Bước 1**: Đăng nhập với tài khoản người thuê
- **Bước 2**: Vào **Hóa đơn**

**Kết quả mong đợi:**
- ✅ Chỉ hiển thị hóa đơn của người thuê đó
- ✅ Hiển thị chi tiết:
  - Tiền phòng
  - Tiền điện (số kWh và tổng tiền)
  - Tiền nước (số m³ và tổng tiền)
  - Tổng cộng
  - Trạng thái
  - Hạn thanh toán

#### 2. Tải PDF hóa đơn
- **Bước**: Nhấn **Tải PDF** trên một hóa đơn

**Kết quả mong đợi:**
- ✅ PDF được tải về với đầy đủ thông tin

#### 3. Test bảo mật
- **Test**: Người thuê A không thể xem hóa đơn của người thuê B
- **Cách test**: Tương tự test hợp đồng

---

## Test API trực tiếp

### Sử dụng Postman hoặc cURL

#### 1. Lấy token đăng nhập

```bash
# Chủ nhà
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@test.com",
    "password": "password123"
  }'

# Người thuê
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant1@test.com",
    "password": "<mật_khẩu_tạm_thời>"
  }'
```

Lưu lại `access_token` từ response.

#### 2. Test API Hợp đồng

```bash
# Lấy danh sách hợp đồng (Chủ nhà)
curl -X GET http://localhost:3000/api/contracts \
  -H "Authorization: Bearer <access_token>"

# Tạo hợp đồng (Chủ nhà)
curl -X POST http://localhost:3000/api/contracts \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "roomId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "monthlyRent": 3000000,
    "deposit": 6000000,
    "notes": "Hợp đồng test"
  }'

# Lấy chi tiết hợp đồng
curl -X GET http://localhost:3000/api/contracts/1 \
  -H "Authorization: Bearer <access_token>"
```

#### 3. Test API Hóa đơn

```bash
# Lấy danh sách hóa đơn (Chủ nhà)
curl -X GET http://localhost:3000/api/invoices \
  -H "Authorization: Bearer <access_token>"

# Lấy danh sách hóa đơn (Người thuê)
curl -X GET http://localhost:3000/api/invoices \
  -H "Authorization: Bearer <access_token_tenant>"

# Đánh dấu đã thanh toán
curl -X PATCH http://localhost:3000/api/invoices/1/paid \
  -H "Authorization: Bearer <access_token>"

# Gửi SMS
curl -X POST http://localhost:3000/api/invoices/1/send-sms \
  -H "Authorization: Bearer <access_token>"

# Tải PDF
curl -X GET http://localhost:3000/api/pdf/invoice/1 \
  -H "Authorization: Bearer <access_token>"
```

---

## Checklist Test

### Hợp đồng
- [ ] Chủ nhà có thể tạo hợp đồng
- [ ] Chủ nhà chỉ thấy hợp đồng của mình
- [ ] Người thuê chỉ thấy hợp đồng của mình
- [ ] Không thể tạo hợp đồng với phòng đã có hợp đồng active
- [ ] Phòng tự động chuyển sang "Đã thuê" sau khi tạo hợp đồng
- [ ] Validation đầy đủ các trường bắt buộc

### Hóa đơn
- [ ] Chủ nhà có thể xem tất cả hóa đơn
- [ ] Người thuê chỉ thấy hóa đơn của mình
- [ ] Có thể đánh dấu đã thanh toán
- [ ] Có thể tải PDF hóa đơn
- [ ] Có thể gửi SMS (nếu đã cấu hình)
- [ ] Tự động tạo hóa đơn hàng tháng (nếu có cron job)
- [ ] Tính toán tổng tiền chính xác

### Bảo mật
- [ ] Người thuê không thể xem hợp đồng/hóa đơn của người thuê khác
- [ ] Chủ nhà không thể xem hợp đồng/hóa đơn của chủ nhà khác
- [ ] API yêu cầu authentication
- [ ] API kiểm tra quyền truy cập (role-based)

---

## Ghi chú

- Đảm bảo database đã được migrate: `cd backend && npm run prisma:migrate`
- Đảm bảo Prisma client đã được generate: `cd backend && npm run prisma:generate`
- Nếu test SMS, cần cấu hình Twilio trong file `.env`
- Nếu test PDF, đảm bảo endpoint PDF đã được cấu hình đúng

---

## Troubleshooting

### Lỗi: "Room does not belong to this landlord"
- **Nguyên nhân**: Đang cố tạo hợp đồng với phòng không thuộc về chủ nhà
- **Giải pháp**: Kiểm tra lại phòng đã được tạo bởi chủ nhà đang đăng nhập

### Lỗi: "Access denied"
- **Nguyên nhân**: Đang cố truy cập hợp đồng/hóa đơn không thuộc về mình
- **Giải pháp**: Đảm bảo đang đăng nhập với đúng tài khoản

### Không thấy hóa đơn tự động
- **Nguyên nhân**: Cron job chưa chạy hoặc chưa có dữ liệu usage
- **Giải pháp**: 
  - Kiểm tra cron job đã được cấu hình
  - Đảm bảo đã nhập chỉ số điện/nước cho tháng đó

