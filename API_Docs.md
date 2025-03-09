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
### Schema:
* name: string
* description?: string
* image?: string
