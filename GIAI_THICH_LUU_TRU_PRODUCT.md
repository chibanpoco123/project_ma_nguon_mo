# 📍 Dữ liệu đã chỉnh sửa Product được lưu ở đâu?

## 1. Nơi lưu trữ: **MongoDB Database**

### Database & Collection:
- **Database**: MongoDB (theo cấu hình `MONGO_URI` trong `.env`)
- **Collection**: `products` (Mongoose tự động chuyển model `Product` thành collection `products`)

### Schema trong MongoDB:
```javascript
{
  _id: ObjectId("..."),
  name: "Tên sản phẩm",
  description: "Mô tả",
  price: 100000,
  discount: 10,
  quantity: 50,
  category_id: ObjectId("..."), // Reference đến collection categories
  images: ["url1", "url2"],
  is_new: true,
  created_at: ISODate("2024-01-01T00:00:00Z"),
  updated_at: ISODate("2024-01-15T10:30:00Z") // ← Cập nhật mỗi lần edit
}
```

---

## 2. Flow chỉnh sửa sản phẩm:

```
┌─────────────────┐
│  Frontend       │
│  ProductForm    │
│  (Admin UI)     │
└────────┬────────┘
         │
         │ 1. User nhập/chỉnh sửa form
         │ 2. Click "Lưu"
         │
         ▼
┌─────────────────┐
│  handleSubmit() │
│  PUT request    │
│  /api/products/:id
└────────┬────────┘
         │
         │ 3. Gửi PUT request với submitData
         │    {
         │      name: "...",
         │      price: 100000,
         │      ...
         │    }
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  Product.js     │
│  router.put()   │
└────────┬────────┘
         │
         │ 4. verifyToken + isAdmin middleware
         │ 5. Product.findByIdAndUpdate()
         │
         ▼
┌─────────────────┐
│  MongoDB        │
│  Collection:    │
│  "products"     │
└─────────────────┘
         │
         │ 6. Cập nhật document trong DB
         │    updated_at: new Date()
         │
         ▼
┌─────────────────┐
│  Response       │
│  Trả về product │
│  đã cập nhật    │
└─────────────────┘
```

---

## 3. Code xử lý update:

### Frontend - Gửi request:

```typescript
// frontend/src/components/admin/ProductForm.tsx (dòng 328-334)
if (product) {
  // Update existing product
  await axios.put(
    `http://localhost:3000/api/products/${product._id}`, // ← ID của product
    submitData, // ← Dữ liệu đã chỉnh sửa
    { headers }
  );
}
```

**Dữ liệu gửi lên (`submitData`):**
```typescript
{
  name: "Tên sản phẩm mới",
  description: "Mô tả mới",
  price: 150000,
  discount: 15,
  quantity: 100,
  images: ["url1", "url2"],
  is_new: true,
  category_id: "category_id_string"
}
```

### Backend - Nhận và lưu vào DB:

```javascript
// backend/src/routes/Product.js (dòng 99-142)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ request body
    const updateData = {
      ...req.body, // ← Dữ liệu từ Frontend
      updated_at: new Date() // ← Tự động cập nhật thời gian
    };
    
    // 2. Xử lý dữ liệu
    if (updateData.category_id === '' || updateData.category_id === null) {
      updateData.category_id = null;
    }
    
    if (updateData.is_new !== undefined) {
      updateData.is_new = Boolean(updateData.is_new);
    }
    
    // 3. Cập nhật vào MongoDB
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,        // ← ID product từ URL
      updateData,           // ← Dữ liệu mới
      { 
        new: true,          // ← Trả về document sau khi update
        runValidators: true  // ← Chạy validation
      }
    );
    
    // 4. Trả về product đã cập nhật
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

### Model Schema:

```javascript
// backend/src/models/product.js
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  discount: Number,
  quantity: Number,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
  images: [String],
  is_new: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now } // ← Tự động cập nhật
});

export default mongoose.model("Product", productSchema);
// ↑ Mongoose tự động tạo collection "products" trong MongoDB
```

---

## 4. Cách kiểm tra dữ liệu đã lưu:

### Option 1: MongoDB Compass (GUI)
1. Mở MongoDB Compass
2. Kết nối đến database
3. Chọn collection `products`
4. Tìm product theo `_id` hoặc `name`
5. Xem field `updated_at` để biết lần cuối chỉnh sửa

### Option 2: MongoDB Shell
```javascript
// Kết nối MongoDB
use your_database_name

// Tìm product
db.products.findOne({ name: "Tên sản phẩm" })

// Hoặc tìm theo ID
db.products.findOne({ _id: ObjectId("...") })

// Xem tất cả products đã cập nhật gần đây
db.products.find().sort({ updated_at: -1 }).limit(10)
```

### Option 3: API Endpoint
```bash
# Lấy danh sách products
GET http://localhost:3000/api/products

# Lấy chi tiết 1 product
GET http://localhost:3000/api/products/:id
```

---

## 5. Tóm tắt:

| Thành phần | Vị trí | Mô tả |
|------------|--------|-------|
| **Database** | MongoDB | Lưu trữ vĩnh viễn |
| **Collection** | `products` | Tên collection trong MongoDB |
| **Model** | `backend/src/models/product.js` | Schema định nghĩa |
| **Route** | `backend/src/routes/Product.js` | API endpoint PUT `/:id` |
| **Controller Logic** | `router.put()` (dòng 99-142) | Xử lý update |
| **Frontend Form** | `frontend/src/components/admin/ProductForm.tsx` | UI chỉnh sửa |
| **Field tự động** | `updated_at` | Tự động cập nhật mỗi lần edit |

---

## 6. Lưu ý quan trọng:

1. **Dữ liệu được lưu ngay lập tức** sau khi click "Lưu" và API thành công
2. **Field `updated_at`** tự động cập nhật mỗi lần edit
3. **Ảnh upload** được lưu vào thư mục `backend/uploads/`, URL được lưu vào field `images[]`
4. **Validation** chạy trước khi lưu (từ schema)
5. **Phân quyền**: Chỉ admin mới được update (middleware `isAdmin`)

---

## 7. Ví dụ thực tế:

**Trước khi chỉnh sửa:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Áo thun",
  "price": 100000,
  "updated_at": "2024-01-10T10:00:00Z"
}
```

**Sau khi chỉnh sửa (đổi giá thành 150000):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Áo thun",
  "price": 150000,  // ← Đã thay đổi
  "updated_at": "2024-01-15T14:30:00Z"  // ← Tự động cập nhật
}
```

---

**Kết luận**: Dữ liệu đã chỉnh sửa được lưu **trực tiếp vào MongoDB collection `products`** thông qua API endpoint `PUT /api/products/:id`.



