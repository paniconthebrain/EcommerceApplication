const sequelize = require('../config/database');
const Shop = require('./Shop');
const Department = require('./Department');
const Category = require('./Category');
const User = require('./User');
const Product = require('./Product');
const Supplier = require('./Supplier');
const Inventory = require('./Inventory');
const PurchaseOrder = require('./PurchaseOrder');
const StockTransfer = require('./StockTransfer');
const Customer = require('./Customer');
const Order = require('./Order');
const EmailTemplate = require('./EmailTemplate');
const JobApplication = require('./JobApplication');
const TokenBlacklist = require('./TokenBlacklist');

// Define associations
User.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });
Shop.hasMany(User, { foreignKey: 'shopId', sourceKey: 'id' });

Category.belongsTo(Department, { foreignKey: 'departmentId', targetKey: 'id' });
Department.hasMany(Category, { foreignKey: 'departmentId', sourceKey: 'id' });

Product.belongsTo(Category, { foreignKey: 'categoryId', targetKey: 'id' });
Category.hasMany(Product, { foreignKey: 'categoryId', sourceKey: 'id' });

// Self-referencing: variable product ↔ variants
Product.hasMany(Product, { foreignKey: 'parentId', sourceKey: 'id', as: 'variants' });
Product.belongsTo(Product, { foreignKey: 'parentId', targetKey: 'id', as: 'parent' });

Product.belongsTo(Supplier, { foreignKey: 'supplierId', targetKey: 'id' });
Supplier.hasMany(Product, { foreignKey: 'supplierId', sourceKey: 'id' });

Inventory.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });
Shop.hasMany(Inventory, { foreignKey: 'shopId', sourceKey: 'id' });

Inventory.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id' });
Product.hasMany(Inventory, { foreignKey: 'productId', sourceKey: 'id' });

PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', targetKey: 'id' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', sourceKey: 'id' });

PurchaseOrder.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });
Shop.hasMany(PurchaseOrder, { foreignKey: 'shopId', sourceKey: 'id' });

StockTransfer.belongsTo(Shop, { foreignKey: 'fromShopId', targetKey: 'id', as: 'fromShop' });
StockTransfer.belongsTo(Shop, { foreignKey: 'toShopId', targetKey: 'id', as: 'toShop' });

StockTransfer.belongsTo(User, { foreignKey: 'initiatedBy', targetKey: 'id', as: 'initiator' });
StockTransfer.belongsTo(User, { foreignKey: 'receivedBy', targetKey: 'id', as: 'receiver' });

Order.belongsTo(Customer, { foreignKey: 'customerId', targetKey: 'id' });
Customer.hasMany(Order, { foreignKey: 'customerId', sourceKey: 'id' });

Order.belongsTo(Shop, { foreignKey: 'shopId', targetKey: 'id' });
Shop.hasMany(Order, { foreignKey: 'shopId', sourceKey: 'id' });

module.exports = {
  sequelize,
  Shop,
  Department,
  Category,
  User,
  Product,
  Supplier,
  Inventory,
  PurchaseOrder,
  StockTransfer,
  Customer,
  Order,
  EmailTemplate,
  JobApplication,
  TokenBlacklist,
};
