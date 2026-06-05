# GoGO Pantry API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except health check) require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## 🔐 Authentication Endpoints

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "staff@gogopantry.com",
  "password": "password123",
  "shopId": "msn"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "staff@gogopantry.com",
    "name": "Alex Rivera",
    "role": "staff",
    "shopId": "msn"
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer {token}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}

Response:
{
  "success": true
}
```

---

## 📦 Product Endpoints

### List Products
```http
GET /products?categoryId=produce&search=apple&sort=name
Authorization: Bearer {token}

Response:
[
  {
    "id": "p01",
    "name": "Organic Hass Avocados",
    "price": 1.49,
    "unit": "each",
    "par": 40,
    "tag": "Organic",
    "categoryId": "produce",
    "Category": {
      "id": "produce",
      "name": "Produce",
      "hue": 145
    }
  }
]
```

### Get Product Details
```http
GET /products/p01
Authorization: Bearer {token}

Response:
{
  "id": "p01",
  "name": "Organic Hass Avocados",
  "price": 1.49,
  "unit": "each",
  "par": 40,
  "tag": "Organic",
  "categoryId": "produce",
  "supplierId": "valley",
  "Category": { ... },
  "Supplier": { ... }
}
```

---

## 📊 Inventory Endpoints

### Get Shop Inventory
```http
GET /shops/msn/inventory
Authorization: Bearer {token}

Response:
[
  {
    "id": "uuid",
    "productId": "p01",
    "shopId": "msn",
    "stock": 38,
    "par": 40,
    "status": "low",
    "product": { ... }
  }
]
```

### Update Inventory Stock
```http
PATCH /shops/msn/inventory/p01
Authorization: Bearer {token}
Content-Type: application/json

{
  "stock": 50,
  "action": "set"  // "set" | "add" | "subtract"
}

Response:
{
  "productId": "p01",
  "newStock": 50,
  "status": "ok",
  "updatedAt": "2024-06-02T..."
}
```

### Get Low Stock Items
```http
GET /shops/msn/inventory/low-stock
Authorization: Bearer {token}

Response:
[
  {
    "id": "uuid",
    "productId": "p01",
    "stock": 15,
    "par": 40,
    "status": "critical",
    "shortage": 25,
    "product": { ... }
  }
]
```

### Get Product Stock Across Shops
```http
GET /inventory/p01/across-shops
Authorization: Bearer {token}

Response:
[
  {
    "shopId": "msn",
    "stock": 38,
    "par": 40,
    "status": "low",
    "shortage": true,
    "shop": { "id": "msn", "name": "Mission District" }
  }
]
```

---

## 🏪 Supplier Endpoints

### List Suppliers
```http
GET /suppliers
Authorization: Bearer {token}

Response:
[
  {
    "id": "valley",
    "name": "Valley Fresh Farms",
    "type": "Produce",
    "leadTime": "Next-day",
    "email": "contact@valleyfresh.com",
    "phone": "555-0101",
    "contactName": "John Smith"
  }
]
```

---

## 📦 Delivery (Purchase Order) Endpoints

### List Deliveries
```http
GET /deliveries?shopId=msn&status=in-transit
Authorization: Bearer {token}

Response:
[
  {
    "id": "PO-2204",
    "supplierId": "valley",
    "shopId": "msn",
    "status": "in-transit",
    "eta": "2024-06-02T14:00:00Z",
    "lineItems": [
      {
        "productId": "p01",
        "expectedQty": 100,
        "receivedQty": null,
        "variance": null
      }
    ]
  }
]
```

### Get Delivery Details
```http
GET /deliveries/PO-2204
Authorization: Bearer {token}
```

### Receive Delivery
```http
POST /deliveries/PO-2204/receive
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    { "productId": "p01", "receivedQty": 98 },
    { "productId": "p02", "receivedQty": 50 }
  ]
}

Response:
{
  "poId": "PO-2204",
  "status": "received",
  "itemsReceived": 2,
  "updatedAt": "2024-06-02T..."
}
```

### Update Delivery Status
```http
PATCH /deliveries/PO-2204/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in-transit"  // "scheduled" | "in-transit" | "arrived" | "received"
}
```

---

## 📋 Order Endpoints

### List Orders
```http
GET /orders?shopId=msn&status=new&limit=20&offset=0
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": "GG-4821",
      "customerId": "uuid",
      "shopId": "msn",
      "status": "new",
      "orderType": "delivery",
      "timeSlot": "2024-06-02T14:00:00Z to 2024-06-02T15:00:00Z",
      "items": [ ... ],
      "pricing": { ... }
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

### Get Order Details
```http
GET /orders/GG-4821
Authorization: Bearer {token}
```

### Create Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "shopId": "msn",
  "items": [
    { "productId": "p01", "qty": 2 },
    { "productId": "p05", "qty": 3 }
  ],
  "orderType": "delivery",
  "timeSlot": "2024-06-02T14:00:00Z to 2024-06-02T15:00:00Z",
  "customerEmail": "maya@example.com",
  "customerName": "Maya Thompson",
  "deliveryAddress": "21st & Valencia",
  "deliveryCity": "San Francisco, CA",
  "deliveryZipCode": "94103"
}

Response:
{
  "orderId": "GG-4821",
  "status": "new",
  "total": 64.18,
  "customerEmail": "maya@example.com"
}
```

### Update Order Status
```http
PATCH /orders/GG-4821/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "picking",
  "pickerId": "user-uuid"
}

Response:
{
  "orderId": "GG-4821",
  "status": "picking",
  "updatedAt": "2024-06-02T..."
}
```

---

## 🔄 Stock Transfer Endpoints

### Get Transfer Suggestions
```http
GET /transfer/suggestions?fromShop=msn&toShop=psl
Authorization: Bearer {token}

Response:
[
  {
    "productId": "p01",
    "productName": "Organic Hass Avocados",
    "fromStock": 60,
    "fromPar": 40,
    "toStock": 15,
    "toPar": 40,
    "recommended": 25
  }
]
```

### Create Transfer
```http
POST /transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "fromShop": "msn",
  "toShop": "psl",
  "items": [
    { "productId": "p01", "qty": 20 },
    { "productId": "p05", "qty": 15 }
  ]
}

Response:
{
  "transferId": "uuid",
  "status": "pending",
  "fromShop": "msn",
  "toShop": "psl",
  "itemCount": 2,
  "createdAt": "2024-06-02T..."
}
```

### Get Transfer Details
```http
GET /transfer/uuid
Authorization: Bearer {token}
```

### Update Transfer Status
```http
PATCH /transfer/uuid/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in-transit"  // "pending" | "in-transit" | "received"
}
```

---

## 📈 Dashboard Endpoints

### Get Shop Dashboard
```http
GET /dashboard/shops/msn/dashboard
Authorization: Bearer {token}

Response:
{
  "shop": {
    "id": "msn",
    "name": "Mission District",
    "code": "SF-01",
    "city": "San Francisco, CA"
  },
  "kpis": {
    "openOrders": 5,
    "lowStock": 8,
    "todaySales": 1245.50,
    "fillRate": 72
  },
  "products": [ ... ],
  "orders": [ ... ],
  "deliveries": [ ... ]
}
```

### Get Daily Order Summary
```http
GET /dashboard/shops/msn/orders/daily-summary?date=2024-06-02
Authorization: Bearer {token}

Response:
{
  "date": "2024-06-02",
  "totalOrders": 8,
  "completedOrders": 6,
  "pendingOrders": 2,
  "revenue": 1245.50,
  "averageOrderValue": 155.69,
  "fillRate": 75
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Validation Error",
  "code": "VALIDATION_ERROR",
  "status": 400
}
```

Common status codes:
- `400` — Bad Request / Validation Error
- `401` — Authentication Error / Invalid Token
- `403` — Authorization Error / Insufficient Permissions
- `404` — Not Found
- `409` — Conflict / Resource Already Exists
- `500` — Internal Server Error

---

## Sample Credentials

For testing, use these shop IDs:
- `msn` — Mission District (San Francisco)
- `psl` — Park Slope (Brooklyn)
- `wkr` — Wicker Park (Chicago)
- `scg` — South Congress (Austin)

Sample product IDs: `p01`, `p02`, `p03`, etc. (up to `p38`)
Sample supplier IDs: `valley`, `golden`, `sunrise`, `harbor`, `prairie`, `cascade`
