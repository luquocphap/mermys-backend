# API DOCUMENTATION

**Base URL:** `http://localhost:3069/api`

**Note:** 
- Endpoints có dấu 🔒 yêu cầu xác thực (accessToken cookie)
- Response mặc định là JSON
- Token hết hạn trong 1 ngày

---

## 1. AUTH - Authentication & Authorization

### 1.1 POST `/auth/login`
**Mô tả:** Đăng nhập tài khoản
- **Method:** POST
- **Auth:** ❌ Không cần
- **Input (Body):**
  ```json
  {
    "username": "string (bắt buộc)",
    "password": "string (bắt buộc)"
  }
  ```
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "accessToken": "jwt_token",
      "refreshToken": "jwt_token"
    },
    "message": "Login auth successfully"
  }
  ```
- **Cookies được ghi:** 
  - `accessToken` - Token xác thực (hết hạn: 1 ngày)
  - `refreshToken` - Token làm mới (hết hạn: 1 ngày)
- **Lỗi có thể:**
  - "User do not exist" - Người dùng không tồn tại
  - "Mật khẩu không chính xác" - Password sai

---

### 1.2 POST `/auth/register`
**Mô tả:** Đăng ký tài khoản mới
- **Method:** POST
- **Auth:** ❌ Không cần
- **Input (Body):**
  ```json
  {
    "username": "string (bắt buộc)",
    "password": "string (bắt buộc)",
    "fullName": "string (bắt buộc)"
  }
  ```
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": true,
    "message": "Register all auths successfully"
  }
  ```
- **Lỗi có thể:**
  - "Người dùng đã tạo tài khoản" - Username đã tồn tại

---

### 1.3 GET `/auth/get-info` 🔒
**Mô tả:** Lấy thông tin user hiện tại
- **Method:** GET
- **Auth:** ✅ Cần accessToken
- **Input:** Không cần
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "id": 1,
      "username": "admin",
      "fullName": "Administrator",
      "isDeleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Get info successfully"
  }
  ```

---

### 1.4 POST `/auth/refresh-token`
**Mô tả:** Làm mới access token
- **Method:** POST
- **Auth:** ❌ Không cần (sử dụng cookie)
- **Input:** Không cần body (lấy từ cookies)
- **Cookies:** 
  - `accessToken` - Token cũ
  - `refreshToken` - Refresh token
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "accessToken": "new_jwt_token",
      "refreshToken": "new_jwt_token"
    },
    "message": "refreshToken auth successfully"
  }
  ```
- **Lỗi có thể:**
  - "No Access Token" - Thiếu access token
  - "No Refresh Token" - Thiếu refresh token
  - "Invalid Token" - Token không hợp lệ

---

## 2. PRODUCT - Quản lý sản phẩm

### 2.1 GET `/product`
**Mô tả:** Lấy danh sách sản phẩm (có phân trang)
- **Method:** GET
- **Auth:** ❌ Không cần
- **Query Parameters:**
  ```
  page=1          (tùy chọn, mặc định: 1)
  pageSize=10     (tùy chọn, mặc định: 10)
  where={...}     (tùy chọn, filter điều kiện)
  ```
- **Example:** `/product?page=1&pageSize=10`
- **Output (Success):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "totalItem": 50,
      "totalPage": 5,
      "page": 1,
      "items": [
        {
          "id": 1,
          "category_id": 1,
          "name": "Sản phẩm 1",
          "short_description": "Mô tả ngắn",
          "detailed_description": "Mô tả chi tiết",
          "image_link": "image_url",
          "isDeleted": false,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    },
    "message": "Lấy danh sách product thành công"
  }
  ```

---

### 2.2 GET `/product/:productId`
**Mô tả:** Lấy chi tiết sản phẩm
- **Method:** GET
- **Auth:** ❌ Không cần
- **Input (Params):**
  ```
  productId: number (bắt buộc)
  ```
- **Example:** `/product/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "id": 1,
      "category_id": 1,
      "name": "Sản phẩm 1",
      "short_description": "Mô tả ngắn",
      "detailed_description": "Mô tả chi tiết",
      "image_link": "image_url",
      "isDeleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "Lấy danh sách product thành công"
  }
  ```

---

### 2.3 POST `/product` 🔒
**Mô tả:** Tạo sản phẩm mới với nhiều quantities
- **Method:** POST
- **Auth:** ✅ Cần accessToken
- **Input (Body):**
  ```json
  {
    "category_id": "number (bắt buộc)",
    "name": "string (bắt buộc)",
    "short_description": "string (tùy chọn)",
    "detailed_description": "string (tùy chọn)",
    "quantities": [
      {
        "quantity_id": "number (bắt buộc)",
        "price": "number (bắt buộc)"
      },
      {
        "quantity_id": "number (bắt buộc)",
        "price": "number (bắt buộc)"
      }
    ]
  }
  ```
- **Example:**
  ```json
  {
    "category_id": 1,
    "name": "Tinh dầu Lavender",
    "short_description": "Tinh dầu thiên nhiên",
    "detailed_description": "Tinh dầu Lavender 100% tự nhiên",
    "quantities": [
      { "quantity_id": 1, "price": 50000 },
      { "quantity_id": 2, "price": 100000 }
    ]
  }
  ```
- **Output (Success):**
  ```json
  {
    "statusCode": 201,
    "data": true,
    "message": "Tạo product thành công"
  }
  ```
- **Lỗi có thể:**
  - "quantities phải là mảng và không được rỗng. Mỗi item cần có quantity_id và price"
  - "Mỗi quantity item phải có quantity_id và price"

---

### 2.4 PUT `/product/:productId`
**Mô tả:** Cập nhật sản phẩm
- **Method:** PUT
- **Auth:** ❌ Không cần
- **Input (Params & Body):**
  ```
  productId: number (params, bắt buộc)
  
  Body (JSON):
  {
    "name": "string (tùy chọn)",
    "short_description": "string (tùy chọn)",
    "detailed_description": "string (tùy chọn)",
    "category_id": "number (tùy chọn)",
    "price": "number (tùy chọn)",
    "quantity_id": "number (tùy chọn nếu cập nhật price)",
    "isDeleted": "number 0|1 (tùy chọn)"
  }
  ```
- **Example:** `/product/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "newProduct": { /* updated product data */ },
      "newPrice": { /* updated price data */ }
    },
    "message": "Update product thành công"
  }
  ```

---

### 2.5 DELETE `/product/:productId`
**Mô tả:** Xóa sản phẩm
- **Method:** DELETE
- **Auth:** ❌ Không cần
- **Input (Params):**
  ```
  productId: number (bắt buộc)
  ```
- **Example:** `/product/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": { /* deleted product data */ },
    "message": "Delete product thành công"
  }
  ```

---

### 2.6 POST `/product/:productId/image` 🔒
**Mô tả:** Upload ảnh sản phẩm
- **Method:** POST
- **Auth:** ✅ Cần accessToken
- **Input:**
  - **Params:** `productId: number (bắt buộc)`
  - **Form Data:** 
    ```
    image: file (bắt buộc, single file)
    ```
- **Processing:** 
  - Xóa ảnh cũ nếu tồn tại
  - Upload lên Cloudinary
  - Cập nhật image_link trong database
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": "https://res.cloudinary.com/...",
    "message": "Delete product thành công"
  }
  ```
- **Lỗi có thể:**
  - "Không có file" - Chưa upload file

---

### 2.7 POST `/product/:productId/quantities` 🔒
**Mô tả:** Thêm quantity mới cho sản phẩm đã tồn tại
- **Method:** POST
- **Auth:** ✅ Cần accessToken
- **Input:**
  - **Params:** `productId: number (bắt buộc)`
  - **Body (JSON):**
    ```json
    {
      "quantity_id": "number (bắt buộc)",
      "price": "number (bắt buộc)"
    }
    ```
- **Example:** `POST /product/1/quantities`
  ```json
  {
    "quantity_id": 3,
    "price": 150000
  }
  ```
- **Output (Success):**
  ```json
  {
    "statusCode": 201,
    "data": {
      "id": 10,
      "product_id": 1,
      "quantity_id": 3,
      "price": "150000.00",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "quantities": {
        "name": "Hộp"
      }
    },
    "message": "Thêm quantity cho sản phẩm thành công"
  }
  ```
- **Lỗi có thể:**
  - "quantity_id và price là bắt buộc" - Thiếu parameters
  - "Sản phẩm không tồn tại" - Product ID không tìm thấy
  - "Quantity này đã tồn tại cho sản phẩm này. Hãy dùng update để sửa giá" - Đã có quantity này cho product

## 3. CATEGORY - Quản lý danh mục

### 3.1 POST `/category`
**Mô tả:** Tạo danh mục mới
- **Method:** POST
- **Auth:** ❌ Không cần
- **Input (Body):**
  ```json
  {
    "name": "string (bắt buộc)"
  }
  ```
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": true,
    "message": "Create category successfully"
  }
  ```

---

### 3.2 GET `/category`
**Mô tả:** Lấy danh sách danh mục (có phân trang)
- **Method:** GET
- **Auth:** ❌ Không cần
- **Query Parameters:**
  ```
  page=1          (tùy chọn, mặc định: 1)
  pageSize=10     (tùy chọn, mặc định: 10)
  where={...}     (tùy chọn, filter điều kiện)
  ```
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "totalItem": 15,
      "totalPage": 2,
      "page": 1,
      "items": [
        {
          "id": 1,
          "name": "Danh mục 1",
          "isDeleted": false,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    },
    "message": "Get all categorys successfully"
  }
  ```

---

### 3.3 GET `/category/:id` 🔒
**Mô tả:** Lấy chi tiết danh mục
- **Method:** GET
- **Auth:** ✅ Cần accessToken
- **Input (Params & Body):**
  ```
  id: number (params)
  
  Body (JSON):
  {
    "id": number (bắt buộc)
  }
  ```
- **Example:** `/category/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "category": {
        "id": 1,
        "name": "Danh mục 1",
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "message": "Get category #1 successfully"
  }
  ```

---

### 3.4 PATCH `/category/:id` 🔒
**Mô tả:** Cập nhật danh mục
- **Method:** PATCH
- **Auth:** ✅ Cần accessToken
- **Input (Params & Body):**
  ```
  id: number (params, bắt buộc)
  
  Body (JSON):
  {
    "name": "string (bắt buộc)"
  }
  ```
- **Example:** `/category/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": true,
    "message": "Update category #1 successfully"
  }
  ```

---

### 3.5 DELETE `/category/:id` 🔒
**Mô tả:** Xóa/Ẩn danh mục
- **Method:** DELETE
- **Auth:** ✅ Cần accessToken
- **Input (Params):**
  ```
  id: number (bắt buộc)
  ```
- **Example:** `/category/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": "This action removes a id: 1 category",
    "message": "Remove category #1 successfully"
  }
  ```
- **Note:** Sử dụng soft delete (đánh dấu isDeleted = true)

---

## 4. ORDER - Quản lý đơn hàng

### 4.1 POST `/order`
**Mô tả:** Tạo đơn hàng mới
- **Method:** POST
- **Auth:** ❌ Không cần
- **Input (Body):**
  ```json
  {
    "firstName": "string (bắt buộc)",
    "lastName": "string (bắt buộc)",
    "email": "string (bắt buộc, email hợp lệ)",
    "phone": "string (bắt buộc, 10 số VN)",
    "city": "string (bắt buộc)",
    "ward": "string (bắt buộc)",
    "address": "string (bắt buộc, địa chỉ đủ dài)",
    "note": "string (tùy chọn)",
    "product_quantity_id": "number (bắt buộc)",
    "amount": "number (bắt buộc)"
  }
  ```
- **Validation:**
  - Email phải hợp lệ
  - Phone phải là 10 số Việt Nam
  - Address phải dài tối thiểu
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": true,
    "message": "Create order successfully"
  }
  ```
- **Lỗi có thể:**
  - "Email không hợp lệ"
  - "Số điện thoại không hợp lệ"
  - "Địa chỉ không hợp lệ"

---

### 4.2 GET `/order` 🔒
**Mô tả:** Lấy danh sách đơn hàng (có phân trang)
- **Method:** GET
- **Auth:** ✅ Cần accessToken
- **Query Parameters:**
  ```
  page=1          (tùy chọn, mặc định: 1)
  pageSize=10     (tùy chọn, mặc định: 10)
  where={...}     (tùy chọn, filter điều kiện)
  ```
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "totalItem": 25,
      "totalPage": 3,
      "page": 1,
      "items": [
        {
          "id": 1,
          "firstName": "Nguyễn",
          "lastName": "Văn A",
          "email": "user@example.com",
          "phone": "0912345678",
          "city": "TP HCM",
          "ward": "Q1",
          "address": "123 Nguyễn Huệ",
          "note": "Ghi chú",
          "product_quantity_id": 1,
          "amount": 2,
          "isDeleted": false,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    },
    "message": "Get all orders successfully"
  }
  ```

---

### 4.3 GET `/order/:id` 🔒
**Mô tả:** Lấy chi tiết đơn hàng
- **Method:** GET
- **Auth:** ✅ Cần accessToken
- **Input (Params):**
  ```
  id: number (bắt buộc)
  ```
- **Example:** `/order/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "order": {
        "id": 1,
        "firstName": "Nguyễn",
        "lastName": "Văn A",
        "email": "user@example.com",
        "phone": "0912345678",
        "city": "TP HCM",
        "ward": "Q1",
        "address": "123 Nguyễn Huệ",
        "note": "Ghi chú",
        "product_quantity_id": 1,
        "amount": 2,
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "message": "Get order #1 successfully"
  }
  ```

---

### 4.4 DELETE `/order/:id` 🔒
**Mô tả:** Xóa/Ẩn đơn hàng
- **Method:** DELETE
- **Auth:** ✅ Cần accessToken
- **Input (Params):**
  ```
  id: number (bắt buộc)
  ```
- **Example:** `/order/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "deletedOrder": { /* order data */ }
    },
    "message": "Remove order #1 successfully"
  }
  ```
- **Note:** Sử dụng soft delete (đánh dấu isDeleted = true)

---

## 5. EMAIL/MESSAGE - Quản lý tin nhắn

### 5.1 POST `/email`
**Mô tả:** Tạo tin nhắn/liên hệ mới
- **Method:** POST
- **Auth:** ❌ Không cần
- **Input (Body):**
  ```json
  {
    "email": "string (bắt buộc, email hợp lệ)",
    "fullName": "string (tùy chọn)",
    "phone": "string (tùy chọn, 10 số VN nếu có)",
    "subject": "string (tùy chọn)",
    "message": "string (tùy chọn)"
  }
  ```
- **Validation:**
  - Email phải hợp lệ
  - Phone phải là 10 số Việt Nam (nếu cung cấp)
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "newMessage": {
        "id": 1,
        "email": "user@example.com",
        "fullName": "Nguyễn Văn A",
        "phone": "0912345678",
        "subject": "Tiêu đề",
        "message": "Nội dung tin nhắn",
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "message": "Create email successfully"
  }
  ```
- **Lỗi có thể:**
  - "Email Không Hợp Lệ"
  - "Số điện thoại không hợp lệ"

---

### 5.2 GET `/email` 🔒
**Mô tả:** Lấy danh sách tin nhắn (có phân trang)
- **Method:** GET
- **Auth:** ✅ Cần accessToken
- **Query Parameters:**
  ```
  page=1          (tùy chọn, mặc định: 1)
  pageSize=10     (tùy chọn, mặc định: 10)
  where={...}     (tùy chọn, filter điều kiện)
  ```
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "totalItem": 50,
      "totalPage": 5,
      "page": 1,
      "items": [
        {
          "id": 1,
          "email": "user@example.com",
          "fullName": "Nguyễn Văn A",
          "phone": "0912345678",
          "subject": "Tiêu đề",
          "message": "Nội dung tin nhắn",
          "isDeleted": false,
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    },
    "message": "Get all emails successfully"
  }
  ```

---

### 5.3 GET `/email/:id` 🔒
**Mô tả:** Lấy chi tiết tin nhắn
- **Method:** GET
- **Auth:** ✅ Cần accessToken
- **Input (Params):**
  ```
  id: number (bắt buộc)
  ```
- **Example:** `/email/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": {
      "email": {
        "id": 1,
        "email": "user@example.com",
        "fullName": "Nguyễn Văn A",
        "phone": "0912345678",
        "subject": "Tiêu đề",
        "message": "Nội dung tin nhắn",
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "message": "Get email #1 successfully"
  }
  ```

---

### 5.4 DELETE `/email/:id` 🔒
**Mô tả:** Xóa/Ẩn tin nhắn
- **Method:** DELETE
- **Auth:** ✅ Cần accessToken
- **Input (Params):**
  ```
  id: number (bắt buộc)
  ```
- **Example:** `/email/1`
- **Output (Success):**
  ```json
  {
    "statusCode": 200,
    "data": { /* message data */ },
    "message": "Remove email #1 successfully"
  }
  ```
- **Note:** Sử dụng soft delete (đánh dấu isDeleted = true)

---

## NOTES CHUNG

### Query Parameters cho List APIs
Các endpoint lấy danh sách sử dụng `buildQueryPrisma` helper:
- **Phân trang:**
  - `page`: Trang hiện tại (mặc định: 1)
  - `pageSize`: Số item mỗi trang (mặc định: 10)
  
- **Filter:** `where={field:operator:value}` - Chi tiết xem [build-query-prisma.helper.js](build-query-prisma.helper.js)

### Response Format
Tất cả responses có format:
```json
{
  "statusCode": number,
  "data": any,
  "message": "string"
}
```

### Soft Delete
Các entity có `isDeleted`, `deletedBy`, `deletedAt`:
- DELETE endpoints chỉ đánh dấu soft delete, không xóa vật lý
- `deletedAt` là timestamp khi bị xóa
- `deletedBy` là ID user thực hiện xóa

### Authentication
- Endpoints có dấu 🔒 yêu cầu `accessToken` trong cookies
- `accessToken` có thể lấy từ `/auth/login` hoặc `/auth/refresh-token`
- Token hết hạn sau 1 ngày
- Nếu hết hạn, sử dụng `refreshToken` để tạo mới

### Error Handling
Errors được throw qua middleware error handler với các exception types:
- `BadRequestException` - 400
- `UnauthorizedException` - 401
- `ForbiddenException` - 403
- `NotFoundException` - 404

### Upload Ảnh
- Sử dụng Memory Storage (không lưu local)
- Upload lên Cloudinary
- Ảnh cũ được xóa tự động khi upload ảnh mới
- Trả về `secure_url` từ Cloudinary
