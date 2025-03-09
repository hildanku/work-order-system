# API Endpoints - Authentication

## Base URL: `/api/auth`

### 1. Get Current User  
**Endpoint:** `/current_user`  
**Method:** `GET`  
**Authentication:** JWT Protected  

**Response:**
```json
{
    "message": "Success",
    "data": {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe"
    }
}
```

---

### 2. Register  
**Endpoint:** `/register`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`  

**Request Body:**
| Field            | Type   | Required | Description |
|-----------------|--------|----------|-------------|
| `name`          | string | ✅        | Full name |
| `username`      | string | ✅        | Unique username |
| `password`      | string | ✅        | User password |
| `confirm_password` | string | ✅    | Must match `password` |

**Response:**
```json
{
    "message": "Registration successful",
    "data": {
        "id": 1,
        "name": "John Doe",
        "username": "johndoe"
    }
}
```

---

### 3. Login  
**Endpoint:** `/login`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`  

**Request Body:**
| Field       | Type   | Required | Description  |
|------------|--------|----------|--------------|
| `username` | string | ✅        | User's username |
| `password` | string | ✅        | User's password |

**Response:**
```json
{
    "message": "Login successful",
    "data": {
        "access_token": "jwt_token_here",
        "refresh_token": "refresh_token_here"
    }
}
```

---

### 4. Refresh Token  
**Endpoint:** `/refresh`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`  

**Request Body:**
| Field          | Type   | Required | Description  |
|--------------|--------|----------|--------------|
| `refresh_token` | string | ✅      | Valid refresh token |

**Response:**
```json
{
    "message": "Token refreshed successfully",
    "data": {
        "access_token": "new_jwt_token",
        "refresh_token": "new_refresh_token"
    }
}
```

# API Endpoints - Product
## Base URL: `/api/product`
## Schema:
* name: string
* description?: string
* image?: string
## Role Middleware Schema
```
get: ['production_manager'],
update: ['production_manager'],
create: ['production_manager'],
delete: ['production_manager'],
```
### Create Product
**Endpoint:** `/`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`  

**Request Body:**
| Field          | Type   | Required | Description  |
|--------------|--------|----------|--------------|
| `name` | string | ✅      | Name Product |
| `description` | string | x     | Desc Product |
| `image` | string | x     | Image Product |

**Response:**
```json
{
    "message": "Product created",
    "results": {
        "id": 2,
        "created_at": 1741562239298,
        "updated_at": 1741562239298,
        "name": "test",
        "description": "test",
        "image": "1741562239294-908-ss figma 1.png"
    }
}
```
### Update Product
**Endpoint:** `/:id`  
**Method:** `PATCH`  
**Content-Type:** `multipart/form-data`  

**Request Body:**
| Field          | Type   | Required | Description  |
|--------------|--------|----------|--------------|
| `name` | string | ✅      | Name Product |
| `description` | string | x     | Desc Product |
| `image` | string | x     | Image Product |

**Response:**
```json
{
    "message": "Product updated",
    "results": {
        "id": 1,
        "created_at": 1741542370477,
        "updated_at": 1741562334994,
        "name": "test",
        "description": "test",
        "image": "1741562334993-757-ss figma 1.png"
    }
}
```
### Get Product
**Endpoint:** `/`  
**Method:** `GET`

**Response:**
```json
{
    "message": "Success get data",
    "results": {
        "items": [
            {
                "id": 1,
                "created_at": 1741542370477,
                "updated_at": 1741562334994,
                "name": "test",
                "description": "test",
                "image": "1741562334993-757-ss figma 1.png"
            },
            {
                "id": 2,
                "created_at": 1741562239298,
                "updated_at": 1741562239298,
                "name": "test",
                "description": "test",
                "image": "1741562239294-908-ss figma 1.png"
            }
        ],
        "meta": {
            "totalItems": 2
        }
    }
}
```

### Get Product By ID
**Endpoint:** `/:id`  
**Method:** `GET`

**Response:**
```json
{
    "message": "Success get data",
    "results": {
        "id": 1,
        "created_at": 1741542370477,
        "updated_at": 1741562334994,
        "name": "test",
        "description": "test",
        "image": "1741562334993-757-ss figma 1.png"
    }
}
```

# API Endpoints - User
## Base URL: `/api/user`
## Schema:
* name: string
* description?: string
* image?: string
## Role Middleware Schema
```
get: ['production_manager'],
update: ['production_manager'],
create: ['production_manager'],
delete: ['production_manager'],
```
### Get Users

**Endpoint:** `GET /api/user`

**Headers:**
```json
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type   | Description |
|-----------|--------|------------|
| q         | string | Search query |
| page      | number | Page number |
| limit     | number | Number of results per page |
| sort      | string | Sort field |
| order     | string | Sort order (`asc` or `desc`) |

**Response:**
- **200 OK**
```json
{
  "status": 200,
  "message": "success get data",
  "data": {
    "items": [{"id": 1, "username": "john_doe", "role": "operator"}],
    "meta": {"totalItems": 1}
  }
}
```
- **404 Not Found**
```json
{
  "status": 404,
  "message": "user not found",
  "data": null
}
```

---

### Get User by ID

**Endpoint:** `GET /api/user/:id`

**Headers:**
```json
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | number | User ID |

**Response:**
- **200 OK**
```json
{
  "status": 200,
  "message": "Success Get Data",
  "data": {"id": 1, "username": "john_doe", "role": "operator"}
}
```
- **404 Not Found**
```json
{
  "status": 404,
  "message": "user not found",
  "data": null
}
```

---

### Create User

**Endpoint:** `POST /api/user`

**Headers:**
```json
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john_doe",
  "name": "John Doe",
  "role": "operator",
  "avatar": null,
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
- **201 Created**
```json
{
  "status": 201,
  "message": "user created",
  "data": {"id": 1, "username": "john_doe"}
}
```
- **400 Bad Request** (Username already taken)
```json
{
  "status": 400,
  "message": "username already taken",
  "data": null
}
```

---

### Update User

**Endpoint:** `PATCH /api/user/:id`

**Headers:**
```json
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Path Parameters:**
| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | number | User ID |

**Request Body:**
- `username` (string)
- `name` (string)
- `role` (enum: `production_manager`, `operator`)
- `avatar` (file, max 2MB, optional)
- `email` (string)
- `password` (string)

**Response:**
- **200 OK**
```json
{
  "status": 200,
  "message": "user updated",
  "data": {"id": 1, "username": "john_doe"}
}
```
- **500 Internal Server Error**
```json
{
  "status": 500,
  "message": "something went wrong",
  "data": null
}
```

---

### Delete User

**Endpoint:** `DELETE /api/user/:id`

**Headers:**
```json
Authorization: Bearer <token>
```

**Path Parameters:**
| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | number | User ID |

**Response:**
- **200 OK**
```json
{
  "status": 200,
  "message": "user deleted",
  "data": null
}
```
- **500 Internal Server Error**
```json
{
  "status": 500,
  "message": "failed to delete user",
  "data": null
}
```

---
# Work Order API Documentation

## Base URL
```
/api/work-orders
```

## Authentication
All endpoints require authentication using JWT in the `Authorization` header.

---

## Get Assigned Work Order by ID
**Endpoint:**
```
GET /assigned/:id
```
**Description:** Retrieves an assigned work order by ID.

**Permissions:** `production_manager`, `operator`

**Request Parameters:**
- `id` (path) - Work Order ID (integer)

**Response:**
```json
{
    "status": 200,
    "message": "success",
    "data": { /* Work Order Object */ }
}
```

---

## Get Assigned Work Orders
**Endpoint:**
```
GET /assigned
```
**Description:** Retrieves a list of assigned work orders for the authenticated user.

**Permissions:** `production_manager`, `operator`

**Query Parameters:**
- `q` (string, optional) - Search query
- `page` (integer, optional) - Page number
- `sort` (string, optional) - Sorting field
- `order` (string, optional) - Sorting order (`asc` or `desc`)
- `limit` (integer, optional) - Items per page

**Response:**
```json
{
    "status": 200,
    "message": "success",
    "data": {
        "items": [ /* Work Order Objects */ ],
        "meta": { "totalItems": 10 }
    }
}
```

---

## Get All Work Orders
**Endpoint:**
```
GET /
```
**Description:** Retrieves all work orders.

**Permissions:** `production_manager`, `operator`

**Query Parameters:** (same as `/assigned`)

**Response:**
```json
{
    "status": 200,
    "message": "success",
    "data": { /* Work Orders List */ }
}
```

---

## Get Work Order by ID
**Endpoint:**
```
GET /:id
```
**Description:** Retrieves a specific work order by ID.

**Permissions:** `production_manager`, `operator`

**Request Parameters:**
- `id` (path) - Work Order ID (integer)

**Response:**
```json
{
    "status": 200,
    "message": "success",
    "data": { /* Work Order Object */ }
}
```

---

## Create Work Order
**Endpoint:**
```
POST /
```
**Description:** Creates a new work order.

**Permissions:** `production_manager`

**Request Body:**
```json
{
    "product": 1,
    "user": 2,
    "quantity": 10,
    "status": "pending",
    "deadline": 1710000000
}
```

**Response:**
```json
{
    "status": 201,
    "message": "work order created",
    "data": { /* New Work Order Object */ }
}
```

---

## Update Work Order
**Endpoint:**
```
PATCH /:id
```
**Description:** Updates an existing work order.

**Permissions:** `production_manager`, `operator`

**Request Parameters:**
- `id` (path) - Work Order ID (integer)

**Request Body:** (same as Create Work Order)

**Response:**
```json
{
    "status": 200,
    "message": "work order updated",
    "data": { /* Updated Work Order Object */ }
}
```

---

## Delete Work Order
**Endpoint:**
```
DELETE /:id
```
**Description:** Deletes a work order by ID.

**Permissions:** `production_manager`

**Request Parameters:**
- `id` (path) - Work Order ID (integer)

**Response:**
```json
{
    "status": 200,
    "message": "work order deleted"
}
```
## API Documentation - Work Order

### Authentication
All endpoints require authentication via Bearer Token.

---

### Work Order Endpoints

#### 1. Create Work Order
**Endpoint:**
```
POST /api/work-orders
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "title": "Fix Server Issue",
  "description": "Resolve network failure in data center",
  "assigned_to": 5,
  "priority": "high"
}
```
**Response:**
```json
{
  "id": 123,
  "title": "Fix Server Issue",
  "description": "Resolve network failure in data center",
  "assigned_to": 5,
  "priority": "high",
  "status": "pending",
  "created_at": "2025-03-10T12:00:00Z"
}
```
---

#### 2. Get Work Order by ID
**Endpoint:**
```
GET /api/work-orders/{id}
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "id": 123,
  "title": "Fix Server Issue",
  "description": "Resolve network failure in data center",
  "assigned_to": 5,
  "priority": "high",
  "status": "pending",
  "created_at": "2025-03-10T12:00:00Z"
}
```
---

#### 3. Update Work Order
**Endpoint:**
```
PUT /api/work-orders/{id}
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "title": "Update Server Issue",
  "description": "Fix new network issue",
  "priority": "medium",
  "status": "in_progress"
}
```
**Response:**
```json
{
  "id": 123,
  "title": "Update Server Issue",
  "description": "Fix new network issue",
  "priority": "medium",
  "status": "in_progress",
  "updated_at": "2025-03-10T12:30:00Z"
}
```
---

#### 4. Delete Work Order
**Endpoint:**
```
DELETE /api/work-orders/{id}
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Work Order deleted successfully"
}
```
---

### Work Order Progress Endpoints

#### 1. Get Progress Timeline by ID
**Endpoint:**
```
GET /api/work-orders/progress/timeline/{id}
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "id": 1,
  "work_order": "WO-12345",
  "status": "in_progress",
  "description": "Work has started",
  "date_start": 1710000000,
  "date_end": 1710100000
}
```
---

#### 2. Create Progress Timeline
**Endpoint:**
```
POST /api/work-orders/progress/timeline
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "work_order": "WO-12345",
  "status": "pending",
  "description": "Initial work order created",
  "date_start": 1710000000,
  "date_end": 1710100000
}
```
**Response:**
```json
{
  "id": 1,
  "work_order": "WO-12345",
  "status": "pending",
  "description": "Initial work order created",
  "date_start": 1710000000,
  "date_end": 1710100000
}
```
---

#### 3. Get All Progress
**Endpoint:**
```
GET /api/work-orders/progress
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "work_order": "WO-12345",
      "status": "in_progress",
      "description": "Work ongoing",
      "date_start": 1710000000,
      "date_end": 1710100000
    }
  ],
  "meta": {
    "totalItems": 1
  }
}
```
---

#### 4. Get Progress by ID
**Endpoint:**
```
GET /api/work-orders/progress/{id}
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "id": 1,
  "work_order": "WO-12345",
  "status": "in_progress",
  "description": "Work ongoing",
  "date_start": 1710000000,
  "date_end": 1710100000
}
```
---

#### 5. Update Progress
**Endpoint:**
```
PATCH /api/work-orders/progress/{id}
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```
**Request Body:**
```json
{
  "status": "completed",
  "description": "Work completed successfully"
}
```
**Response:**
```json
{
  "id": 1,
  "work_order": "WO-12345",
  "status": "completed",
  "description": "Work completed successfully",
  "date_start": 1710000000,
  "date_end": 1710100000
}
```
---

#### 6. Delete Progress
**Endpoint:**
```
DELETE /api/work-orders/progress/{id}
```
**Headers:**
```
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Progress deleted successfully"
}
```
---

### Error Responses
All endpoints may return the following error formats:
```json
{
  "error": "Unauthorized"
}
```
```json
{
  "error": "Not Found"
}
```



