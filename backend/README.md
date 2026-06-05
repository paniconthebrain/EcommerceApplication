# GoGO Pantry Backend API

Backend API and database layer for GoGO Pantry, a two-sided grocery management system.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure database**
   - Create a PostgreSQL database named `gogopantry`
   - Update `.env` with your database credentials:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=gogopantry
     DB_USER=postgres
     DB_PASSWORD=postgres
     ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3000`

## 📁 Project Structure

```
src/
├── models/          # Sequelize ORM models
├── routes/          # API endpoints (to implement)
├── middleware/      # Auth, validation, error handling
├── utils/           # JWT, errors, helpers
└── config/          # Database configuration
```

## 🗄️ Database Schema

**Models:**
- `Shop` — Store locations
- `Category` — Product categories
- `User` — Staff users
- `Product` — Inventory SKUs
- `Supplier` — Vendor information
- `Inventory` — Per-shop stock levels
- `PurchaseOrder` — Supplier deliveries
- `StockTransfer` — Inter-shop movements
- `Customer` — End customers
- `Order` — Customer orders

See `migrations/001_initial_schema.js` for schema details.

## 🔌 API Endpoints (To Implement)

### Authentication
- `POST /api/auth/login` — Staff login
- `POST /api/auth/logout` — Logout
- `POST /api/auth/refresh` — Refresh token

### Products & Inventory
- `GET /api/products` — List products
- `GET /api/products/:id` — Get product details
- `GET /api/shops/:shopId/inventory` — Shop inventory
- `PATCH /api/shops/:shopId/inventory/:productId` — Adjust stock
- `GET /api/inventory/:productId/across-shops` — Multi-shop view

### Suppliers & Deliveries
- `GET /api/suppliers` — List suppliers
- `GET /api/deliveries` — Purchase orders
- `POST /api/deliveries/:poId/receive` — Receive shipment
- `PATCH /api/deliveries/:poId/status` — Update PO status

### Stock Transfers
- `GET /api/transfer/suggestions` — Suggest transfers
- `POST /api/transfer` — Create transfer
- `PATCH /api/transfer/:id/status` — Update transfer status

### Orders
- `GET /api/orders` — List orders
- `POST /api/orders` — Create order
- `PATCH /api/orders/:id/status` — Update order status

### Dashboard
- `GET /api/shops/:shopId/dashboard` — KPIs and summaries
- `GET /api/shops/:shopId/inventory/low-stock` — Low stock alerts

## 🔐 Authentication

JWT-based with bearer tokens. Add to headers:
```
Authorization: Bearer {token}
```

Token payload:
```json
{
  "sub": "user-id",
  "email": "user@gogopantry.com",
  "role": "staff|manager|admin",
  "shopId": "shop-id",
  "iat": 1700000000,
  "exp": 1700086400
}
```

## 📝 Development

- Use `.env` for configuration
- Models are defined in `src/models/`
- Database auto-syncs on server start
- Use Postman/Insomnia for API testing

## 🔄 Next Steps

1. Implement authentication middleware
2. Build auth routes (login, logout, refresh)
3. Create product routes with filtering
4. Implement inventory endpoints
5. Build order processing endpoints
6. Add error handling and validation
7. Create integration tests
