# Hướng dẫn Setup Banner Images

## Vị trí đặt hình ảnh banner

Đặt các hình ảnh banner vào thư mục:
```
frontend/public/banners/
```

## Tên file
- `banner-1.png` - Banner đầu tiên
- `banner-2.png` - Banner thứ hai

## Kích thước khuyến nghị
- **Width**: 1920px (hoặc lớn hơn)
- **Height**: 600px - 800px
- **Aspect Ratio**: 16:5 hoặc 3:1
- **Format**: PNG, JPG, hoặc WebP

## Cách thêm hình ảnh

1. Tạo thư mục `banners` trong `frontend/public/`:
   ```bash
   mkdir -p frontend/public/banners
   ```

2. Đặt 2 hình ảnh banner vào thư mục:
   - `frontend/public/banners/banner-1.png`
   - `frontend/public/banners/banner-2.png`

3. Hình ảnh sẽ tự động được load từ URL `/banners/banner-1.png` và `/banners/banner-2.png`

## Fallback

Nếu hình ảnh không tìm thấy, hệ thống sẽ hiển thị gradient fallback với text.

## Lưu ý

- Đảm bảo file có tên chính xác: `banner-1.png` và `banner-2.png`
- Hình ảnh nên được tối ưu hóa để tải nhanh (compress nếu cần)
- Format PNG hỗ trợ transparency tốt hơn
- Format JPG/WebP nhẹ hơn nhưng không hỗ trợ transparency

