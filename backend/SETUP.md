# GoGO Pantry Backend — Setup Guide

## Prerequisites

- **Node.js** 16+ ([download](https://nodejs.org/))
- **PostgreSQL** 12+ ([download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)

---

## 1. Database Setup

### Create PostgreSQL Database

Open PostgreSQL command line or use a GUI (pgAdmin):

```sql
CREATE DATABASE gogopantry;
```

Verify connection:
```bash
psql -h localhost -U postgres -d gogopantry
```

---

## 2. Configure Environment

Edit `.env` file in `backend/` directory:

```
NODE_ENV=development
PORT=3000

# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gogopantry
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-12345678
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=*
```

⚠️ **Change these values for production!**

---

## 3. Install Dependencies

```bash
cd backend
npm install
```

---

## 4. Create Database Tables

The tables are automatically created when the server starts. First start:

```bash
npm run dev
```

You should see:
```
✓ Database connection established
✓ Database synced
✓ Server running on port 3000
✓ API ready at: http://localhost:3000/api
```

---

## 5. Seed Sample Data

⚠️ **The seeds need to be run manually.** You have two options:

### Option A: Using Sequelize CLI (Recommended)

1. Install Sequelize CLI globally:
   ```bash
   npm install -g sequelize-cli
   ```

2. Create a `.sequelizerc` file in the backend directory:
   ```javascript
   const path = require('path');

   module.exports = {
     config: path.resolve('src/config', 'config.json'),
     'models-path': path.resolve('src/models'),
     'seeders-path': path.resolve('seeds'),
     'migrations-path': path.resolve('migrations'),
   };
   ```

3. Run migrations and seeds:
   ```bash
   sequelize db:migrate
   sequelize db:seed:all
   ```

### Option B: Manual Seeding Script

Create a `scripts/seed.js` file:

```javascript
const { sequelize, Shop, Category, Supplier, Product, Inventory } = require('../src/models');
require('dotenv').config();

async function seed() {
  try {
    // Truncate existing data (be careful in production!)
    await sequelize.truncate({ cascade: true });

    // Insert shops
    const shops = await Shop.bulkCreate([
      { id: "msn", name: "Mission District", city: "San Francisco, CA", code: "SF-01", hours: "7am – 10pm", tint: "152" },
      { id: "psl", name: "Park Slope", city: "Brooklyn, NY", code: "NY-02", hours: "7am – 11pm", tint: "45" },
      // ... add more shops
    ]);

    // Insert categories
    const categories = await Category.bulkCreate([
      { id: "produce", name: "Produce", hue: 145, blurb: "Picked at peak ripeness" },
      // ... add more categories
    ]);

    // Insert suppliers and products similarly

    console.log('✓ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
```

Then run:
```bash
node scripts/seed.js
```

---

## 6. Test the API

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-06-02T..."
}
```

### Sample Login (after seeding)

You'll need to add test staff users to the `users` table first. Use a tool like **pgAdmin** or create a migration.

Example staff user to insert:
```sql
INSERT INTO users (id, email, password, name, role, shop_id, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'alex@gogopantry.com',
  '$2b$10$...',  -- bcryptjs hashed password
  'Alex Rivera',
  'staff',
  'msn',
  NOW(),
  NOW()
);
```

Then test login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex@gogopantry.com",
    "password": "password123",
    "shopId": "msn"
  }'
```

---

## 7. Verify Endpoints

Once seeded, test a simple endpoint:

```bash
curl -X GET http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer {your-token-here}"
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for all available endpoints.

---

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify credentials in `.env`
- Ensure database `gogopantry` exists

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Change PORT in .env to 3001, 3002, etc.
```

### Missing Dependencies
```bash
npm install
```

### Clear Database (development only)
```bash
# Drop all tables
npm run drop-tables
```

---

## Development Commands

```bash
# Start dev server (with auto-reload)
npm run dev

# Start production server
npm start

# Run tests (if added)
npm test
```

---

## Next Steps

1. ✅ Set up database
2. ✅ Configure `.env`
3. ✅ Seed sample data
4. ✅ Test endpoints with Postman/Insomnia
5. Connect frontend to this API
6. Add test suite
7. Deploy to production

---

## Recommended Tools

- **Postman** or **Insomnia** — API testing
- **pgAdmin** — Database GUI
- **VS Code** — Code editor

---

**Questions?** Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) or the [README.md](./README.md).
