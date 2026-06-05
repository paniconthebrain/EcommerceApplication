const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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

// CORS — support comma-separated list of allowed origins
const rawOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001,http://localhost:3002';
const allowedOrigins = rawOrigin === '*' ? '*' : rawOrigin.split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins === '*' ? true : (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50kb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'GoGO Pantry API',
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
app.use('/api/transfer', transferRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/delivery-slots', deliverySlotsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Sync models — alter only in development to avoid schema corruption in production
    const env = process.env.NODE_ENV;
    if (!env) console.warn('WARNING: NODE_ENV is not set — defaulting to development mode');
    const isProduction = env === 'production';
    const syncOptions = isProduction ? {} : { alter: true };
    if (!isProduction) console.warn('DB sync: alter:true is active — never use in production');
    await sequelize.sync(syncOptions);
    console.log('✓ Database synced');

    // Fix department_id NOT NULL constraint for categories
    await sequelize.query('ALTER TABLE "categories" ALTER COLUMN "department_id" DROP NOT NULL').catch(() => {});
    console.log('✓ Fixed categories.department_id constraint');

    // Start listening and keep server alive
    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ API ready at: http://localhost:${PORT}/api`);
    });

    // Keep the server alive
    server.on('close', () => {
      console.log('Server closed');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error('Startup error:', err);
  process.exit(1);
});

module.exports = app;
