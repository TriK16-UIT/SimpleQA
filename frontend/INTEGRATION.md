# Backend Integration Guide

Frontend đã sẵn sàng để kết nối với backend API.

## API Endpoint Required

Backend cần cung cấp endpoint:

```
GET /api/search?query=<question>&k=<number>
```

### Request Parameters:
- `query` (string, required): Câu hỏi của user
- `k` (number, required): Số lượng results (từ 3 đến 10)

### Backend Response Format (Your Current Format):

```json
{
  "query": "Dế mèn",
  "k": 3,
  "method": "all",
  "results": [
    {
      "method": "keyword",
      "documents": [
        {
          "id": "...",
          "title": "Dế Mèn Phiêu Lưu Ký",
          "author": "Tô Hoài",
          "content": "Câu chuyện kể về...",
          "score": 2.243478260869565
        }
      ],
      "llm_answer": "Dế mèn là một cuốn sách..."
    },
    {
      "method": "embedding",
      "documents": [...],
      "llm_answer": "..."
    }
  ]
}
```

**Frontend tự động transform** response này sang format hiển thị:
- LLM answer được hiển thị đầu tiên
- Sau đó là documents (title - author: content)
- Limit theo `k` parameter

---

## How to Connect Backend

### Option 1: Backend cùng domain (recommended)

Nếu backend và frontend deploy cùng domain, giữ nguyên code hiện tại:

```javascript
// src/utils/api.js
const apiUrl = `/api/search?query=${encodeURIComponent(query)}&k=${k}`;
```

### Option 2: Backend khác domain (CORS)

Nếu backend chạy riêng (ví dụ: `http://localhost:8000`), update file `src/utils/api.js`:

```javascript
// Line 14 - Replace with your backend URL
const apiUrl = `http://localhost:8000/api/search?query=${encodeURIComponent(query)}&k=${k}`;
```

**Lưu ý**: Backend cần enable CORS:
```python
# Example for FastAPI/Flask
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

### Option 3: Environment Variable (best practice)

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

Update `src/utils/api.js`:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || '';
const apiUrl = `${API_BASE}/api/search?query=${encodeURIComponent(query)}&k=${k}`;
```

---

## Testing

### Test with curl:

```bash
curl "http://localhost:8000/api/search?query=What%20is%20AI&k=5"
```

### Test in browser:

1. Start frontend: `npm run dev`
2. Nhập câu hỏi
3. Chọn k value
4. Bấm search (→)
5. Xem kết quả

---

## Features Already Implemented

✅ Request caching - Queries được cache trong memory
✅ Request cancellation - Tự động cancel requests cũ
✅ Loading states - Hiển thị spinner khi đang fetch
✅ Error handling - Hiển thị error messages rõ ràng
✅ Responsive design - Mobile, tablet, desktop
✅ K value persistence - Lưu trong localStorage
✅ Performance optimized - React.memo, useCallback, useMemo

---

## Common Issues

### 1. CORS Error
```
Access to fetch at 'http://localhost:8000/api/search' from origin 'http://localhost:5173'
has been blocked by CORS policy
```
**Solution**: Enable CORS trong backend

### 2. Network Error
```
Failed to fetch
```
**Solution**: Kiểm tra backend có đang chạy không

### 3. JSON Parse Error
```
Unexpected token '<' is not valid JSON
```
**Solution**: Backend đang trả về HTML thay vì JSON

---

## Contact

Nếu có vấn đề, check:
1. Backend có chạy không?
2. API endpoint đúng chưa?
3. Response format đúng chưa?
4. CORS đã enable chưa?
