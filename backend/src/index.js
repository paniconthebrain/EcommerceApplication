const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');
const { authLimiter } = require('./middleware/rateLimiters');
const { runMigrations } = require('./migrator');

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
const newsletterRoutes = require('./routes/newsletter');

const app = express();

// Vercel (and most PaaS) puts the app behind a proxy that sets X-Forwarded-For.
// Trusting exactly one hop lets express-rate-limit (and req.ip generally)
// identify the real client IP instead of the proxy's, without blindly trusting
// an arbitrary forwarded chain a client could otherwise spoof.
app.set('trust proxy', 1);

// Security headers — applied before all other middleware
app.use(helmet());

// CORS
const hardcodedOrigins = [
  'http://localhost:3001',
  'http://localhost:3002',
  'https://gogopantry.com',
  'https://www.gogopantry.com',
  'https://staff.gogopantry.com',
  'https://customerappproject.vercel.app',
  'https://gogopantrystaff.vercel.app',
];
// Vercel preview deployments get a unique hash per push (e.g.
// https://customerappproject-git-dev-paniconthebrain.vercel.app or
// https://gogopantrystaff-1s6a9ffef-paniconthebrain.vercel.app) — these can't be
// hardcoded in advance, so match any preview/branch URL for our own Vercel projects.
const previewOriginPattern = /^https:\/\/(customerappproject|gogopantrystaff|gogopantry)(-[a-z0-9]+)*-paniconthebrain\.vercel\.app$/;
const rawOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = rawOrigin === '*'
  ? '*'
  : rawOrigin
    ? [...new Set([...hardcodedOrigins, ...rawOrigin.split(',').map(o => o.trim())])]
    : hardcodedOrigins;
app.use(cors({
  origin: allowedOrigins === '*' ? true : (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || previewOriginPattern.test(origin)) {
      return cb(null, true);
    }
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

// API responses reflect live, frequently-changing data (inventory, orders, etc.) —
// never let the browser cache them or issue conditional requests, since a 304
// has no body and callers checking res.ok (200-299) would otherwise treat a
// valid cache-hit as a failure.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

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
app.use('/api/newsletter', newsletterRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function initDb() {
  await sequelize.authenticate();
  console.log('✓ Database connection established');
  // Schema changes now go through migrations/*.js (see src/migrator.js) instead
  // of sequelize.sync({ alter: true }) or hand-appended ALTER statements here.
  // Each migration runs exactly once per environment, tracked in SequelizeMeta —
  // this is what fixed the class of bug where a model gained a column that
  // never actually reached the production table (e.g. the Product.barcode
  // incident), since sync() without `alter` silently does nothing for existing tables.
  await runMigrations();
  console.log('✓ Migrations up to date');
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
