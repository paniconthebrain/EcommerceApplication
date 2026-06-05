const express = require('express');
const { Op } = require('sequelize');
const { Product, Category, Supplier, Inventory, Shop } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { NotFoundError, ValidationError, AuthenticationError } = require('../utils/errors');

const router = express.Router();

// POST /api/products - Create product (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {

    const {
      name,
      brand,
      categoryId,
      size,
      weight,
      costPrice,
      price,
      unit,
      par,
      supplierId,
      tags,
      attributes,
      isRestricted18Plus,
      slug,
      subheading,
      description,
      shortDescription,
      productType,
      salePrice,
      metaTitle,
      metaDescription,
      metaKeywords,
      visibility,
      featuredImage,
      galleryImages,
      status,
    } = req.body;

    const errors = [];
    if (!name) errors.push('name');
    if (!categoryId) errors.push('categoryId');
    if (price === undefined || price === null) errors.push('price');
    if (!unit) errors.push('unit');
    if (par === undefined || par === null) errors.push('par');
    if (!supplierId) errors.push('supplierId');

    if (errors.length > 0) {
      throw new ValidationError(`Missing required fields: ${errors.join(', ')}`);
    }

    // Generate product ID
    const productId = `p${Date.now()}`;

    const product = await Product.create({
      id: productId,
      name,
      brand,
      categoryId,
      size,
      weight,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      price: parseFloat(price),
      unit,
      par: parseInt(par),
      supplierId,
      tags: Array.isArray(tags) ? tags : [],
      attributes: Array.isArray(attributes) ? attributes : [],
      isRestricted18Plus: isRestricted18Plus || false,
      slug,
      subheading,
      description,
      shortDescription,
      productType: productType || 'simple',
      salePrice: salePrice ? parseFloat(salePrice) : null,
      metaTitle,
      metaDescription,
      metaKeywords,
      visibility: visibility || 'public',
      featuredImage,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      status: status || 'draft',
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// GET /api/products - List products (public endpoint)
router.get('/', async (req, res, next) => {
  try {
    const { categoryId, search, sort = 'name', shopId, ids } = req.query;

    const where = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    // Filter by comma-separated product IDs (e.g., ?ids=p01,p02,p03)
    if (ids) {
      const idList = ids.split(',').map(id => id.trim());
      where.id = { [Op.in]: idList };
    }

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name', 'hue'] },
        { model: Supplier, attributes: ['id', 'name', 'leadTime'] },
        // Include inventory if shopId provided
        shopId ? {
          model: Inventory,
          where: { shopId },
          attributes: ['stock', 'par'],
          required: false,
        } : null,
      ].filter(Boolean),
      order: [[sort, 'ASC']],
    });

    // Format response with inventory info
    const result = products.map(product => {
      const data = product.toJSON();
      if (shopId && data.Inventories && data.Inventories.length > 0) {
        const inv = data.Inventories[0];
        data.stock = inv.stock;
        data.par = inv.par;
        data.availability = inv.stock > 0 ? 'in_stock' : 'out_of_stock';
        delete data.Inventories;
      }
      return data;
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:productId - Get product details (public endpoint)
router.get('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { shopId } = req.query;

    const product = await Product.findByPk(productId, {
      include: [
        { model: Category, attributes: ['id', 'name', 'hue', 'blurb'] },
        { model: Supplier, attributes: ['id', 'name', 'type', 'leadTime'] },
        // Include inventory if shopId provided
        shopId ? {
          model: Inventory,
          where: { shopId },
          attributes: ['stock', 'par'],
          required: false,
        } : null,
      ].filter(Boolean),
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const data = product.toJSON();
    if (shopId && data.Inventories && data.Inventories.length > 0) {
      const inv = data.Inventories[0];
      data.stock = inv.stock;
      data.par = inv.par;
      data.availability = inv.stock > 0 ? 'in_stock' : 'out_of_stock';
      delete data.Inventories;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:productId/availability - Get product availability across shops
router.get('/:productId/availability', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { shopId } = req.query;

    const product = await Product.findByPk(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const where = { productId };
    if (shopId) {
      where.shopId = shopId;
    }

    const inventories = await Inventory.findAll({
      where,
      include: [{ model: Shop, attributes: ['id', 'name', 'city', 'code'] }],
      attributes: ['shopId', 'stock', 'par'],
    });

    const availability = inventories.map(inv => ({
      shopId: inv.shopId,
      shopName: inv.Shop?.name,
      stock: inv.stock,
      par: inv.par,
      status: inv.stock > 0 ? 'in_stock' : 'out_of_stock',
    }));

    res.json({
      productId,
      productName: product.name,
      availability,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:productId - Update product (admin only)
router.put('/:productId', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {

    const { productId } = req.params;
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Update fields
    const updateFields = {};
    const allowedFields = [
      'name', 'brand', 'categoryId', 'size', 'weight', 'costPrice', 'price', 'unit', 'par',
      'supplierId', 'tags', 'attributes', 'isRestricted18Plus', 'slug', 'subheading',
      'description', 'shortDescription', 'productType', 'salePrice', 'metaTitle',
      'metaDescription', 'metaKeywords', 'visibility', 'featuredImage', 'galleryImages', 'status'
    ];

    for (const field of allowedFields) {
      if (field in req.body) {
        if (field === 'price' || field === 'salePrice' || field === 'costPrice') {
          updateFields[field] = req.body[field] ? parseFloat(req.body[field]) : null;
        } else if (field === 'par') {
          updateFields[field] = req.body[field] ? parseInt(req.body[field]) : null;
        } else if (field === 'tags' || field === 'attributes' || field === 'galleryImages') {
          updateFields[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
        } else {
          updateFields[field] = req.body[field];
        }
      }
    }

    await product.update(updateFields);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
