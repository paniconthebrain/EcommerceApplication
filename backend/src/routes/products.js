const express = require('express');
const { Op } = require('sequelize');
const { Product, Category, Supplier, Inventory, Shop } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { NotFoundError, ValidationError } = require('../utils/errors');

const router = express.Router();

// ─── helpers ────────────────────────────────────────────────────────────────

const PRODUCT_INCLUDES = (shopId) => [
  { model: Category, attributes: ['id', 'name', 'hue'] },
  { model: Supplier,  attributes: ['id', 'name', 'leadTime'] },
  shopId ? {
    model: Inventory,
    where: { shopId },
    attributes: ['stock', 'par'],
    required: false,
  } : null,
].filter(Boolean);

function attachInventory(data, shopId) {
  if (shopId && data.Inventories?.length) {
    const inv = data.Inventories[0];
    data.stock        = inv.stock;
    data.par          = inv.par;
    data.availability = inv.stock > 0 ? 'in_stock' : 'out_of_stock';
    delete data.Inventories;
  }
  return data;
}

// ─── POST /api/products ──────────────────────────────────────────────────────
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const {
      name, brand, categoryId, size, weight, costPrice, price, unit, par,
      supplierId, tags, attributes, isRestricted18Plus, slug, subheading,
      description, shortDescription, productType, salePrice, metaTitle,
      metaDescription, metaKeywords, visibility, featuredImage, galleryImages,
      status, parentId, barcode, ingredients, nutritionFacts, allergens,
      countryOfOrigin, storageInstructions,
    } = req.body;

    const type = productType || 'simple';
    const errors = [];
    if (!name)       errors.push('name');
    if (!categoryId) errors.push('categoryId');
    if (!supplierId) errors.push('supplierId');
    // price & par not required for variable products
    if (type !== 'variable') {
      if (price === undefined || price === null || price === '') errors.push('price');
      if (!unit) errors.push('unit');
      if (par  === undefined || par  === null || par  === '') errors.push('par');
    }
    if (errors.length) throw new ValidationError(`Missing required fields: ${errors.join(', ')}`);

    const product = await Product.create({
      id: `p${Date.now()}`,
      name, brand, categoryId, size, weight,
      costPrice:  costPrice  ? parseFloat(costPrice)  : null,
      price:      price !== undefined && price !== '' ? parseFloat(price) : null,
      unit:       unit  || 'each',
      par:        par   !== undefined && par !== '' ? parseInt(par) : 0,
      supplierId,
      tags:           Array.isArray(tags)          ? tags          : [],
      attributes:     Array.isArray(attributes)    ? attributes    : [],
      isRestricted18Plus: isRestricted18Plus || false,
      slug, subheading, description, shortDescription,
      productType: type,
      salePrice:  salePrice ? parseFloat(salePrice) : null,
      metaTitle, metaDescription, metaKeywords,
      visibility: visibility || 'public',
      featuredImage,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      status: status || 'draft',
      parentId: parentId || null,
      barcode: barcode || null,
      ingredients: ingredients || null,
      nutritionFacts: nutritionFacts && typeof nutritionFacts === 'object' ? nutritionFacts : null,
      allergens: Array.isArray(allergens) ? allergens : [],
      countryOfOrigin: countryOfOrigin || null,
      storageInstructions: storageInstructions || null,
    });

    res.status(201).json(product);
  } catch (err) { next(err); }
});

// ─── POST /api/products/group ────────────────────────────────────────────────
// Group existing products under a new or existing variable parent.
// Body: { parentName, parentId?, productIds: string[] }
router.post('/group', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { parentName, parentId, productIds } = req.body;
    if (!productIds?.length) throw new ValidationError('productIds required');

    const variants = await Product.findAll({ where: { id: { [Op.in]: productIds } } });
    if (!variants.length) throw new NotFoundError('None of the given products found');

    const first = variants[0];
    let parent;

    if (parentId) {
      parent = await Product.findByPk(parentId);
      if (!parent) throw new NotFoundError('Parent product not found');
    } else {
      if (!parentName) throw new ValidationError('parentName required when parentId not provided');
      parent = await Product.create({
        id:          `par_${Date.now()}`,
        name:        parentName,
        categoryId:  first.categoryId,
        supplierId:  first.supplierId,
        unit:        first.unit || 'each',
        par:         0,
        price:       null,
        productType: 'variable',
        status:      first.status || 'active',
        featuredImage: first.featuredImage || null,
      });
    }

    // Link all selected products as variants
    await Product.update(
      { parentId: parent.id, productType: 'variant' },
      { where: { id: { [Op.in]: productIds } } }
    );

    const updated = await Product.findByPk(parent.id, {
      include: [{ model: Product, as: 'variants' }],
    });

    res.json(updated);
  } catch (err) { next(err); }
});

// ─── GET /api/products ───────────────────────────────────────────────────────
// Query params:
//   shopId   — attach stock/availability from that shop's inventory
//   grouped  — if 'true', return only parents+simples with variants embedded
//              (used by staff product management)
//   categoryId, search, sort, ids — standard filters
router.get('/', async (req, res, next) => {
  try {
    const { categoryId, search, sort = 'name', shopId, ids, grouped } = req.query;

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (search)     where.name = { [Op.iLike]: `%${search}%` };
    if (ids)        where.id   = { [Op.in]: ids.split(',').map(s => s.trim()) };

    if (grouped === 'true') {
      // Return only top-level products (variable parents + orphan simples)
      where.parentId = null;

      const products = await Product.findAll({
        where,
        include: [
          { model: Category, attributes: ['id', 'name', 'hue'] },
          { model: Supplier,  attributes: ['id', 'name', 'leadTime'] },
          {
            model: Product,
            as: 'variants',
            include: shopId ? [{ model: Inventory, where: { shopId }, attributes: ['stock', 'par'], required: false }] : [],
          },
          shopId ? { model: Inventory, where: { shopId }, attributes: ['stock', 'par'], required: false } : null,
        ].filter(Boolean),
        order: [[sort, 'ASC']],
      });

      return res.json(products.map(p => {
        const d = p.toJSON();
        d.variants = (d.variants || []).map(v => attachInventory(v, shopId));
        return attachInventory(d, shopId);
      }));
    }

    // Default: flat list (customer webapp, inventory screens, etc.)
    const products = await Product.findAll({
      where,
      include: PRODUCT_INCLUDES(shopId),
      order: [[sort, 'ASC']],
    });

    res.json(products.map(p => attachInventory(p.toJSON(), shopId)));
  } catch (err) { next(err); }
});

// ─── GET /api/products/:id ───────────────────────────────────────────────────
router.get('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { shopId } = req.query;

    const product = await Product.findByPk(productId, {
      include: [
        ...PRODUCT_INCLUDES(shopId),
        { model: Product, as: 'variants', include: PRODUCT_INCLUDES(shopId) },
      ],
    });
    if (!product) throw new NotFoundError('Product not found');

    const data = product.toJSON();
    data.variants = (data.variants || []).map(v => attachInventory(v, shopId));
    res.json(attachInventory(data, shopId));
  } catch (err) { next(err); }
});

// ─── GET /api/products/:id/variants ─────────────────────────────────────────
router.get('/:productId/variants', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { shopId } = req.query;

    const variants = await Product.findAll({
      where: { parentId: productId },
      include: PRODUCT_INCLUDES(shopId),
      order: [['name', 'ASC']],
    });

    res.json(variants.map(v => attachInventory(v.toJSON(), shopId)));
  } catch (err) { next(err); }
});

// ─── GET /api/products/:id/availability ─────────────────────────────────────
router.get('/:productId/availability', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { shopId } = req.query;

    const product = await Product.findByPk(productId);
    if (!product) throw new NotFoundError('Product not found');

    const invWhere = { productId };
    if (shopId) invWhere.shopId = shopId;

    const inventories = await Inventory.findAll({
      where: invWhere,
      include: [{ model: Shop, attributes: ['id', 'name', 'city', 'code'] }],
      attributes: ['shopId', 'stock', 'par'],
    });

    res.json({
      productId,
      productName: product.name,
      availability: inventories.map(inv => ({
        shopId:   inv.shopId,
        shopName: inv.Shop?.name,
        stock:    inv.stock,
        par:      inv.par,
        status:   inv.stock > 0 ? 'in_stock' : 'out_of_stock',
      })),
    });
  } catch (err) { next(err); }
});

// ─── PUT /api/products/:id ───────────────────────────────────────────────────
router.put('/:productId', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) throw new NotFoundError('Product not found');

    const allowed = [
      'name', 'brand', 'categoryId', 'size', 'weight', 'costPrice', 'price', 'unit', 'par',
      'supplierId', 'tags', 'attributes', 'isRestricted18Plus', 'slug', 'subheading',
      'description', 'shortDescription', 'productType', 'salePrice', 'metaTitle',
      'metaDescription', 'metaKeywords', 'visibility', 'featuredImage', 'galleryImages',
      'status', 'parentId', 'barcode', 'ingredients', 'nutritionFacts', 'allergens',
      'countryOfOrigin', 'storageInstructions',
    ];

    const updates = {};
    for (const f of allowed) {
      if (!(f in req.body)) continue;
      if (['price', 'salePrice', 'costPrice'].includes(f)) {
        updates[f] = req.body[f] !== '' && req.body[f] != null ? parseFloat(req.body[f]) : null;
      } else if (f === 'par') {
        updates[f] = req.body[f] !== '' && req.body[f] != null ? parseInt(req.body[f]) : 0;
      } else if (['tags', 'attributes', 'galleryImages', 'allergens'].includes(f)) {
        updates[f] = Array.isArray(req.body[f]) ? req.body[f] : [];
      } else if (f === 'nutritionFacts') {
        updates[f] = req.body[f] && typeof req.body[f] === 'object' ? req.body[f] : null;
      } else {
        updates[f] = req.body[f];
      }
    }

    await product.update(updates);
    res.json(product);
  } catch (err) { next(err); }
});

// ─── DELETE /api/products/:id ────────────────────────────────────────────────
router.delete('/:productId', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);
    if (!product) throw new NotFoundError('Product not found');

    // If deleting a variable parent, unlink variants (make them simple orphans)
    if (product.productType === 'variable') {
      await Product.update(
        { parentId: null, productType: 'simple' },
        { where: { parentId: productId } }
      );
    }

    // Remove inventory records then delete
    await Inventory.destroy({ where: { productId } });
    await product.destroy();

    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
