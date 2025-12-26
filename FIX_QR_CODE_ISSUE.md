# Khắc phục vấn đề QR Code không hiển thị trong hóa đơn

## Vấn đề
QR code thanh toán không hiển thị trong trang "Hóa đơn của tôi" của khách thuê.

## Nguyên nhân có thể
1. Phòng chưa có QR code được upload
2. QR code chưa được lưu vào database
3. Backend chưa trả về `qrCodeImage` trong response

## Đã sửa
1. ✅ Backend đã được cập nhật để trả về `qrCodeImage` trong response (`invoices.service.ts`)
2. ✅ Frontend đã có logic hiển thị QR code (`TenantInvoicesPage.tsx`)
3. ✅ Thêm error handling và fallback message khi không có QR code

## Cách kiểm tra

### Bước 1: Kiểm tra phòng có QR code chưa
1. Đăng nhập với tài khoản chủ nhà
2. Vào mục "Phòng" → Chọn phòng cần kiểm tra
3. Kiểm tra xem đã upload QR code thanh toán chưa
4. Nếu chưa, upload QR code (hình ảnh) vào trường "QR Code thanh toán"

### Bước 2: Kiểm tra hóa đơn
1. Đăng nhập với tài khoản khách thuê
2. Vào mục "Hóa đơn"
3. Kiểm tra xem QR code có hiển thị không

### Bước 3: Debug (nếu vẫn không hiển thị)
1. Mở DevTools (F12) → Console
2. Kiểm tra log "Invoices response:" để xem dữ liệu từ API
3. Kiểm tra xem `invoice.room.qrCodeImage` có giá trị không

## Lưu ý
- QR code phải được upload dưới dạng base64 hoặc URL
- Nếu QR code là base64, nó sẽ bắt đầu bằng `data:image/...`
- Nếu QR code là URL, đảm bảo URL có thể truy cập được

