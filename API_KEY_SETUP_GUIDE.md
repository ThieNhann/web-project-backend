# 📚 Hướng Dẫn Cấu Hình API Key cho Server

## 1️⃣ Thiết Lập Biến Môi Trường (.env)

### Bước 1: Tạo file `.env` từ template
```bash
cp .env.example .env
```

### Bước 2: Điền thông tin vào `.env`
```
PORT=3000
NODE_ENV=development

# JWT Secret (dùng cho xác thực token)
JWT_SECRET=your_super_secret_key_change_in_production_12345

# API Key (dùng cho API protection)
API_KEY=your_unique_api_key_here_keep_it_safe

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=game_db
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Supabase (cho file upload)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# Email (cho gửi mail)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 2️⃣ Các Loại API Key

### A. JWT Token (để xác thực người dùng)
```javascript
// Mục đích: Xác thực người dùng khi đăng nhập
// Nơi sử dụng: authMiddleware.js

// Client gửi token:
// Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }
```

### B. API Key (để bảo vệ API)
```javascript
// Mục đích: Bảo vệ các endpoint công khai
// Nơi sử dụng: apiKeyMiddleware.js

// Client gửi API Key:
// Headers: { X-API-Key: "your_api_key_here" }
```

### C. Supabase Key (cho file storage)
```javascript
// Mục đích: Upload/download file từ Supabase
// Tìm tại: Supabase Dashboard > Project Settings > API
```

## 3️⃣ Sử Dụng API Key trong Server

### Cách 1: Bảo vệ một endpoint bằng API Key
```javascript
// routes/exampleRoutes.js
import express from "express";
import { verifyApiKey } from "../middleware/apiKeyMiddleware.js";

const router = express.Router();

// Chỉ endpoint này được bảo vệ bằng API Key
router.get("/protected", verifyApiKey, (req, res) => {
  res.json({ message: "Dữ liệu bí mật" });
});

export default router;
```

### Cách 2: Bảo vệ nhiều endpoint
```javascript
// server.js
import { verifyApiKey } from "./middleware/apiKeyMiddleware.js";
import publicRoutes from "./routes/publicRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";

// Routes công khai
app.use("/api/public", publicRoutes);

// Routes cần API Key
app.use("/api/admin", verifyApiKey, protectedRoutes);
```

### Cách 3: Kiểm tra API Key từ query parameter
```javascript
// Cách gửi: GET /api/data?api_key=your_key
import { verifyApiKeyQuery } from "../middleware/apiKeyMiddleware.js";

router.get("/data", verifyApiKeyQuery, (req, res) => {
  res.json({ data: "..." });
});
```

## 4️⃣ Tạo API Key an toàn

### Tạo một API Key ngẫu nhiên:
```bash
# Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Hoặc sử dụng online tool:
- https://generate.plus/en/base64
- Chọn 32 bytes, output Base64

## 5️⃣ Ví Dụ Thực Tế

### Client gửi request với API Key:

**JavaScript/Fetch:**
```javascript
fetch('http://localhost:3000/api/admin/dashboard', {
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

**cURL:**
```bash
curl -H "X-API-Key: your_api_key_here" \
     http://localhost:3000/api/admin/dashboard
```

**Postman:**
1. Mở Postman
2. Tạo request mới
3. Headers tab → thêm: `X-API-Key` = `your_api_key_here`
4. Send

## 6️⃣ Bảo Mật Best Practices

✅ **LÀM**:
- ✓ Lưu API Key trong `.env` không commit
- ✓ Sử dụng API Key khác cho mỗi environment (dev, staging, prod)
- ✓ Rotate API Key định kỳ (thay đổi nó mỗi tháng)
- ✓ Dùng HTTPS trong production
- ✓ Giới hạn scope của API Key (chỉ cho phép các hành động cần thiết)

❌ **KHÔNG LÀM**:
- ✗ Hardcode API Key trong code
- ✗ Commit `.env` lên GitHub
- ✗ Chia sẻ API Key qua chat/email
- ✗ Dùng cùng API Key cho development và production

## 7️⃣ Cấu Hình .gitignore

Thêm vào `.gitignore`:
```
.env
.env.local
.env.*.local
node_modules/
```

## 8️⃣ Khắc Phục Lỗi Thường Gặp

### Lỗi: "API Key is required"
```
Nguyên nhân: Quên thêm X-API-Key header
Giải pháp: Thêm header vào request
```

### Lỗi: "Invalid API Key"
```
Nguyên nhân: API Key sai hoặc .env chưa load
Giải pháp: 
1. Kiểm tra API Key trong .env
2. Restart server (npm run dev)
3. Kiểm tra giá trị X-API-Key trong request
```

### Lỗi: "Server configuration error: API_KEY not set"
```
Nguyên nhân: Biến API_KEY không được định nghĩa trong .env
Giải pháp: Thêm API_KEY=... vào .env file
```

## 9️⃣ Tài Liệu Tham Khảo

- JWT Documentation: https://jwt.io/
- Environment Variables: https://github.com/motdotla/dotenv
- API Security: https://owasp.org/www-project-api-security/

---
**Cập nhật cuối:** January 2026
