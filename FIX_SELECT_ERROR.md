# Khắc phục lỗi Select Component

## Lỗi: ReferenceError: Can't find variable: Select

### Nguyên nhân
Lỗi này thường xảy ra do:
1. Browser cache chưa được clear
2. Hot Module Replacement (HMR) chưa reload đúng
3. Dev server cần restart

### Cách khắc phục

#### Bước 1: Hard Refresh Browser
- **Windows/Linux**: `Ctrl + Shift + R` hoặc `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

#### Bước 2: Clear Browser Cache
1. Mở DevTools (F12)
2. Right-click vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"

#### Bước 3: Restart Dev Server
1. Dừng dev server (Ctrl + C trong terminal)
2. Chạy lại:
```bash
cd frontend
npm run dev
```

#### Bước 4: Xóa node_modules và reinstall (nếu vẫn lỗi)
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Kiểm tra
Sau khi làm các bước trên, kiểm tra:
1. Mở DevTools Console
2. Kiểm tra xem còn lỗi Select không
3. Thử thêm người thuê lại

### Lưu ý
- Import đã được thêm đúng vào file `TenantsPage.tsx`
- Component Select đã được export đúng từ `@/components/ui/select`
- Nếu vẫn lỗi, có thể do vấn đề với Radix UI dependencies


