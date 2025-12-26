# Giải thích Logic Auto-fill Chỉ số Điện Nước trong UsagePage

## Tổng quan
Khi chọn phòng từ dropdown trong trang "Nhập chỉ số", hệ thống sẽ tự động điền "Chỉ số điện đầu kỳ" và "Chỉ số nước đầu kỳ" dựa trên chỉ số cuối kỳ của tháng trước.

## Cách hoạt động

### 1. Khi nào logic được kích hoạt?
Logic auto-fill được kích hoạt khi:
- Người dùng chọn phòng từ dropdown (`selectedRoom` thay đổi)
- Người dùng thay đổi tháng (`formData.month` thay đổi)
- Người dùng thay đổi năm (`formData.year` thay đổi)

### 2. Flow xử lý

#### Bước 1: Lắng nghe thay đổi
```typescript
useEffect(() => {
  if (selectedRoom && formData.month && formData.year) {
    fetchPreviousUsage();
  }
}, [selectedRoom, formData.month, formData.year]);
```

Khi một trong 3 giá trị trên thay đổi, hàm `fetchPreviousUsage()` sẽ được gọi.

#### Bước 2: Tính toán tháng trước
```typescript
let prevMonth = formData.month - 1;
let prevYear = formData.year;
if (prevMonth < 1) {
  prevMonth = 12;
  prevYear -= 1;
}
```

Ví dụ:
- Nếu đang nhập tháng 1/2024 → Tìm tháng 12/2023
- Nếu đang nhập tháng 3/2024 → Tìm tháng 2/2024

#### Bước 3: Lấy dữ liệu usage từ API
```typescript
const response = await api.get(`/usage?roomId=${selectedRoom}`);
const usages = response.data || [];
const prevUsage = usages.find(
  (u: any) => u.month === prevMonth && u.year === prevYear
);
```

Hệ thống:
1. Gọi API để lấy tất cả usage của phòng đã chọn
2. Tìm usage của tháng trước trong danh sách

#### Bước 4: Auto-fill hoặc Clear

**Trường hợp 1: Tìm thấy usage của tháng trước**
```typescript
if (prevUsage && prevUsage.electricEnd && prevUsage.waterEnd) {
  setPreviousUsage(prevUsage);
  setIsFirstTime(false);
  // Auto-fill start values from previous month's end values
  setFormData((prev) => ({
    ...prev,
    electricStart: Number(prevUsage.electricEnd).toString(),
    waterStart: Number(prevUsage.waterEnd).toString(),
  }));
}
```

- Đặt `isFirstTime = false` → Các trường "đầu kỳ" sẽ bị disable và hiển thị màu xám
- Tự động điền `electricStart` = `prevUsage.electricEnd`
- Tự động điền `waterStart` = `prevUsage.waterEnd`

**Trường hợp 2: Không tìm thấy usage của tháng trước**
```typescript
else {
  setPreviousUsage(null);
  setIsFirstTime(true);
  // Clear start values if no previous usage
  setFormData((prev) => ({
    ...prev,
    electricStart: '',
    waterStart: '',
  }));
}
```

- Đặt `isFirstTime = true` → Các trường "đầu kỳ" sẽ được enable và bắt buộc nhập
- Xóa giá trị đã điền (nếu có)

### 3. UI Behavior

#### Khi `isFirstTime = false` (Đã có dữ liệu tháng trước):
- Hiển thị thông báo màu xanh: "Đã tự động lấy chỉ số từ tháng trước"
- Các trường "đầu kỳ" bị disable (màu xám)
- Hiển thị tooltip: "Tự động lấy từ tháng trước: XXX kWh/m³"
- Chỉ cần nhập "cuối kỳ"

#### Khi `isFirstTime = true` (Lần đầu nhập):
- Hiển thị thông báo màu xanh nhạt: "Lần đầu nhập chỉ số"
- Các trường "đầu kỳ" được enable và bắt buộc nhập
- Phải nhập cả "đầu kỳ" và "cuối kỳ"

## Ví dụ thực tế

### Scenario 1: Phòng đã có dữ liệu tháng trước
1. Chọn phòng "Phòng 101"
2. Chọn tháng "3", năm "2024"
3. Hệ thống tự động:
   - Tìm usage tháng 2/2024 của phòng 101
   - Tìm thấy: `electricEnd = 500`, `waterEnd = 100`
   - Tự động điền: `electricStart = 500`, `waterStart = 100`
   - Disable các trường "đầu kỳ"
4. Người dùng chỉ cần nhập: `electricEnd = 600`, `waterEnd = 120`

### Scenario 2: Phòng chưa có dữ liệu tháng trước
1. Chọn phòng "Phòng 201" (phòng mới)
2. Chọn tháng "1", năm "2024"
3. Hệ thống tự động:
   - Tìm usage tháng 12/2023 của phòng 201
   - Không tìm thấy
   - Enable các trường "đầu kỳ" và yêu cầu nhập
4. Người dùng phải nhập: `electricStart = 0`, `electricEnd = 100`, `waterStart = 0`, `waterEnd = 50`

## Lợi ích

1. **Tiết kiệm thời gian**: Không cần tra cứu và nhập lại chỉ số đầu kỳ
2. **Giảm sai sót**: Tự động lấy từ dữ liệu đã lưu, tránh nhập sai
3. **Trải nghiệm tốt**: Phân biệt rõ ràng giữa lần đầu nhập và các lần sau
4. **Logic thông minh**: Tự động xử lý việc chuyển năm (tháng 1 → tháng 12 năm trước)

## Code Location
- File: `frontend/src/pages/landlord/UsagePage.tsx`
- Hàm chính: `fetchPreviousUsage()` (dòng 47-90)
- Hook: `useEffect` (dòng 32-36)

