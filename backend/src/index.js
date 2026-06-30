const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const staffManagementRoutes = require('./routes/staffManagement');
const shopManagementRoutes = require('./routes/shopManagement');
const departmentRoutes = require('./routes/departments');
const categoryRoutes = require('./routes/categories');
const customerAuthRoutes = require('./routes/customerAuth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const supplierRoutes = require('./routes/suppliers');
const orderRoutes = require('./routes/orders');
const deliveryRoutes = require('./routes/deliveries');
const transferRoutes = require('./routes/transfers');
const dashboardRoutes = require('./routes/dashboard');
const deliverySlotsRoutes = require('./routes/deliverySlots');
const emailRoutes = require('./routes/email');
const careersRoutes = require('./routes/careers');

const app = express();

// Security headers — applied before all other middleware
app.use(helmet());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS
const hardcodedOrigins = [
  'http://localhost:3001',
  'http://localhost:3002',
  'https://gogopantry.com',
  'https://www.gogopantry.com',
  'https://staff.gogopantry.com',
  'https://customerappproject.vercel.app',
];
const rawOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = rawOrigin === '*'
  ? '*'
  : rawOrigin
    ? [...new Set([...hardcodedOrigins, ...rawOrigin.split(',').map(o => o.trim())])]
    : hardcodedOrigins;
app.use(cors({
  origin: allowedOrigins === '*' ? true : (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Serve uploaded shop images — cross-origin allowed so the frontend (port 3001) can load them
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'GoGoPantry API',
    version: '1.0.0',
    status: 'ready',
    endpoints: {
      staffAuth: '/api/auth',
      customerAuth: '/api/customers/auth',
      products: '/api/products',
      inventory: '/api/inventory',
      orders: '/api/orders',
      deliveries: '/api/deliveries',
      transfers: '/api/transfer',
      dashboard: '/api/dashboard',
      suppliers: '/api/suppliers'
    },
    docs: 'See API_DOCUMENTATION.md for details'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/staff', staffManagementRoutes);
app.use('/api/shops', shopManagementRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers/auth', authLimiter, customerAuthRoutes);
app.use('/api/products', productRoutes);
app.use('/api', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/purchase-orders', deliveryRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/delivery-slots', deliverySlotsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/careers', careersRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function initDb() {
  await sequelize.authenticate();
  console.log('✓ Database connection established');
  await sequelize.sync({ alter: true });
  console.log('✓ Database synced');
  // Fix department_id NOT NULL constraint — safe to re-run, ignored if already dropped
  await sequelize.query('ALTER TABLE "categories" ALTER COLUMN "department_id" DROP NOT NULL').catch(() => {});
}

// require.main === module is true when run directly (local dev), false when imported by Vercel
if (require.main === module) {
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ Health check: http://localhost:${PORT}/health`);
      });
    })
    .catch(err => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
} else {
  // Serverless (Vercel) — init DB in background, Sequelize pool handles reconnection
  initDb().catch(err => console.error('DB init error:', err));
}

module.exports = app;
