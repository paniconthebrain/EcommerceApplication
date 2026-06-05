const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'category_id',
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  weight: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'cost_price',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  par: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  supplierId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'supplier_id',
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  isRestricted18Plus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_restricted_18_plus',
  },
  slug: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  subheading: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  shortDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'short_description',
  },
  productType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'simple',
    field: 'product_type',
  },
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'sale_price',
  },
  metaTitle: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'meta_title',
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description',
  },
  metaKeywords: {
    type: DataTypes.STRING(1000),
    allowNull: true,
    field: 'meta_keywords',
  },
  visibility: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'public',
  },
  featuredImage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'featured_image',
  },
  galleryImages: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'gallery_images',
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'draft',
  },
}, {
  tableName: 'products',
  timestamps: true,
});

module.exports = Product;
