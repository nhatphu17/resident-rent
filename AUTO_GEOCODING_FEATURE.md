# Tính năng Tự động Lấy Tọa độ (Auto Geocoding)

## Tổng quan
Hệ thống tự động lấy tọa độ (latitude/longitude) từ địa chỉ phòng khi chủ nhà tạo hoặc sửa phòng. Chủ nhà không cần nhập tọa độ thủ công.

## Cách hoạt động

### Khi tạo phòng mới:
1. Chủ nhà nhập **Xã/Phường** và **Tỉnh/Thành phố**
2. Hệ thống tự động gọi Geocoding API (OpenStreetMap Nominatim) để lấy tọa độ
3. Tọa độ được lưu vào database cùng với thông tin phòng

### Khi sửa phòng:
- Nếu cập nhật địa chỉ (Xã/Phường hoặc Tỉnh/Thành phố) nhưng không có tọa độ, hệ thống sẽ tự động lấy tọa độ mới
- Nếu đã có tọa độ, hệ thống sẽ giữ nguyên (trừ khi bạn cập nhật địa chỉ)

## Lợi ích

1. **Dễ sử dụng**: Chủ nhà chỉ cần nhập địa chỉ, không cần biết tọa độ
2. **Chính xác**: Sử dụng OpenStreetMap Nominatim API - cơ sở dữ liệu địa lý lớn
3. **Tự động**: Không cần thao tác thủ công, tiết kiệm thời gian
4. **Hỗ trợ tìm phòng gần**: Tọa độ được dùng để tính khoảng cách khi khách tìm phòng

## API được sử dụng

**OpenStreetMap Nominatim API**
- Miễn phí, không cần API key
- Hỗ trợ địa chỉ tiếng Việt
- Rate limit: 1 request/giây (đủ cho mục đích sử dụng)

## Lưu ý

1. **Độ chính xác**: Tọa độ được lấy ở cấp độ Xã/Phường, có thể không chính xác 100% cho địa chỉ cụ thể
2. **Cần địa chỉ đầy đủ**: Để có kết quả tốt nhất, nên nhập cả Xã/Phường và Tỉnh/Thành phố
3. **Nếu không tìm thấy**: Nếu API không tìm thấy địa chỉ, tọa độ sẽ là `null`. Bạn có thể:
   - Kiểm tra lại địa chỉ (chính tả, tên đầy đủ)
   - Thử nhập tên đầy đủ hơn (VD: "Phường 1, Quận 1, TP. Hồ Chí Minh")
   - Hoặc nhập tọa độ thủ công (nếu cần)

## Cách kiểm tra

Sau khi tạo/sửa phòng:
1. Kiểm tra trong database hoặc API response xem có `latitude` và `longitude` không
2. Trên trang chủ, nếu phòng có tọa độ, sẽ hiển thị khoảng cách khi khách tìm phòng gần

## Troubleshooting

### Tọa độ không được lấy tự động
- **Nguyên nhân**: Địa chỉ không tìm thấy trong OpenStreetMap
- **Giải pháp**: 
  - Kiểm tra lại địa chỉ (chính tả, tên đầy đủ)
  - Thử nhập tên đầy đủ hơn
  - Kiểm tra logs của backend để xem lỗi cụ thể

### Tọa độ không chính xác
- **Nguyên nhân**: Geocoding ở cấp độ Xã/Phường, không phải địa chỉ cụ thể
- **Giải pháp**: Đây là hạn chế của geocoding miễn phí. Nếu cần chính xác hơn, có thể:
  - Sử dụng Google Maps Geocoding API (cần API key, có phí)
  - Nhập tọa độ thủ công từ Google Maps

## Cấu hình nâng cao

Nếu muốn sử dụng Google Maps Geocoding API (chính xác hơn, nhưng cần API key):

1. Tạo API key từ Google Cloud Console
2. Cập nhật `GeocodingService` để sử dụng Google API
3. Thêm API key vào `.env` file

Hiện tại hệ thống sử dụng OpenStreetMap Nominatim vì:
- Miễn phí
- Không cần API key
- Đủ cho mục đích tính khoảng cách tương đối

