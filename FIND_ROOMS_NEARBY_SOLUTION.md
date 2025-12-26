# Giải pháp Tìm Phòng Quanh Tôi

## Phân tích yêu cầu

### Yêu cầu:
1. Lấy vị trí hiện tại của người dùng (GPS)
2. Tính khoảng cách từ vị trí người dùng đến địa chỉ phòng (xã/phường - tỉnh)
3. Hiển thị khoảng cách trong card phòng (ví dụ: "Cách bạn 2.5 km")
4. Filter và sắp xếp phòng theo khoảng cách gần nhất

## Giải pháp

### 1. Lấy vị trí người dùng
**Công nghệ:** Browser Geolocation API
- Sử dụng `navigator.geolocation.getCurrentPosition()`
- Yêu cầu quyền truy cập vị trí từ người dùng
- Lấy được `latitude` và `longitude`

### 2. Chuyển đổi địa chỉ phòng thành tọa độ
**Vấn đề:** Địa chỉ phòng chỉ có "xã/phường - tỉnh" (text), không có tọa độ

**Giải pháp:**
- **Option 1 (Khuyến nghị):** Sử dụng Geocoding API (Google Maps, OpenStreetMap)
  - Chuyển đổi "xã/phường - tỉnh" → lat/lng
  - Cache kết quả để tránh gọi API nhiều lần
  - Chi phí: Google Maps có free tier (200$/tháng), OpenStreetMap miễn phí

- **Option 2:** Thêm trường `latitude` và `longitude` vào database
  - Chủ nhà nhập tọa độ khi đăng phòng
  - Hoặc tự động geocode khi tạo phòng
  - Không cần gọi API mỗi lần tìm kiếm

**Khuyến nghị:** Dùng Option 2 (thêm lat/lng vào DB) vì:
- Nhanh hơn (không cần geocode mỗi lần)
- Rẻ hơn (không tốn API calls)
- Chính xác hơn (chủ nhà có thể chỉnh sửa)

### 3. Tính khoảng cách
**Công thức:** Haversine Formula
- Tính khoảng cách giữa 2 điểm trên Trái Đất (lat/lng)
- Kết quả: km
- Code JavaScript có sẵn, không cần API

### 4. Hiển thị và Filter
- Tính khoảng cách cho tất cả phòng
- Sắp xếp theo khoảng cách (gần → xa)
- Hiển thị khoảng cách trong card
- Có thể thêm filter "Trong bán kính X km"

## Implementation Plan

### Backend:
1. Thêm trường `latitude` và `longitude` vào model `Room` (Prisma schema)
2. Migration database
3. Update DTOs để nhận lat/lng khi tạo/sửa phòng
4. (Optional) Thêm endpoint geocode địa chỉ → lat/lng

### Frontend:
1. Tạo hook `useGeolocation()` để lấy vị trí người dùng
2. Tạo utility function `calculateDistance()` (Haversine)
3. Update `HomePage.tsx`:
   - Lấy vị trí người dùng khi component mount
   - Tính khoảng cách cho mỗi phòng
   - Sắp xếp theo khoảng cách
   - Hiển thị khoảng cách trong card
4. Thêm nút "Tìm phòng quanh tôi" với icon location
5. Handle error khi không có quyền truy cập vị trí

## Code Structure

```
frontend/src/
  hooks/
    useGeolocation.ts      # Hook lấy vị trí người dùng
  utils/
    distance.ts            # Function tính khoảng cách
  pages/
    HomePage.tsx           # Update để hiển thị khoảng cách
```

## Lưu ý

1. **Privacy:** Yêu cầu quyền truy cập vị trí, cần thông báo rõ ràng
2. **Performance:** Cache geocoding results, tính toán khoảng cách ở client-side
3. **Fallback:** Nếu không có vị trí, hiển thị tất cả phòng (như hiện tại)
4. **Accuracy:** Địa chỉ "xã/phường - tỉnh" có thể không chính xác 100%, nhưng đủ cho mục đích tìm phòng

## Next Steps

1. ✅ Phân tích giải pháp (đã xong)
2. ⏳ Thêm lat/lng vào database schema
3. ⏳ Implement geolocation hook
4. ⏳ Implement distance calculation
5. ⏳ Update UI để hiển thị khoảng cách
6. ⏳ Tối ưu UI cho mobile

