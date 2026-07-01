// Adds real foreign key constraints matching the associations already defined
// in src/models/index.js. Until now the schema had ZERO FK constraints (sync()
// never adds them), so the database provided no backstop against orphaned data —
// this is exactly how a hardcoded fallback shop id ('msn') was once able to be
// inserted into inventory.shop_id even though no such shop existed.
//
// onDelete is RESTRICT (the default) everywhere: a Shop/Category/Supplier/etc.
// with dependent rows cannot be deleted until the app explicitly handles those
// dependents first. Cascading deletes were deliberately NOT used here — silently
// deleting a shop's entire order history because someone deleted the shop
// record would be far more dangerous than a blocked delete with a clear error
// (the errorHandler now translates SequelizeForeignKeyConstraintError into a
// clean 409 instead of a raw 500).
//
// IMPORTANT: if this migration fails on a given environment, it almost always
// means there's pre-existing orphaned data that violates the constraint (e.g. an
// inventory row referencing a shop_id that no longer exists). It is intentionally
// NOT swallowed per-constraint — Umzug will leave it pending and retry on the
// next cold start until the underlying data is cleaned up, rather than silently
// skipping the constraint and leaving the gap unfixed.
const CONSTRAINTS = [
  { table: 'users', fields: ['shop_id'], name: 'fk_users_shop_id', refTable: 'shops', refField: 'id' },
  { table: 'categories', fields: ['department_id'], name: 'fk_categories_department_id', refTable: 'departments', refField: 'id' },
  { table: 'products', fields: ['category_id'], name: 'fk_products_category_id', refTable: 'categories', refField: 'id' },
  { table: 'products', fields: ['parent_id'], name: 'fk_products_parent_id', refTable: 'products', refField: 'id' },
  { table: 'products', fields: ['supplier_id'], name: 'fk_products_supplier_id', refTable: 'suppliers', refField: 'id' },
  { table: 'inventory', fields: ['shop_id'], name: 'fk_inventory_shop_id', refTable: 'shops', refField: 'id' },
  { table: 'inventory', fields: ['product_id'], name: 'fk_inventory_product_id', refTable: 'products', refField: 'id' },
  { table: 'purchase_orders', fields: ['supplier_id'], name: 'fk_purchase_orders_supplier_id', refTable: 'suppliers', refField: 'id' },
  { table: 'purchase_orders', fields: ['shop_id'], name: 'fk_purchase_orders_shop_id', refTable: 'shops', refField: 'id' },
  { table: 'stock_transfers', fields: ['from_shop_id'], name: 'fk_stock_transfers_from_shop_id', refTable: 'shops', refField: 'id' },
  { table: 'stock_transfers', fields: ['to_shop_id'], name: 'fk_stock_transfers_to_shop_id', refTable: 'shops', refField: 'id' },
  { table: 'stock_transfers', fields: ['initiated_by'], name: 'fk_stock_transfers_initiated_by', refTable: 'users', refField: 'id' },
  { table: 'stock_transfers', fields: ['received_by'], name: 'fk_stock_transfers_received_by', refTable: 'users', refField: 'id' },
  { table: 'orders', fields: ['customer_id'], name: 'fk_orders_customer_id', refTable: 'customers', refField: 'id' },
  { table: 'orders', fields: ['shop_id'], name: 'fk_orders_shop_id', refTable: 'shops', refField: 'id' },
];

module.exports = {
  up: async ({ context: queryInterface }) => {
    for (const c of CONSTRAINTS) {
      await queryInterface.addConstraint(c.table, {
        fields: c.fields,
        type: 'foreign key',
        name: c.name,
        references: { table: c.refTable, field: c.refField },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      });
    }
  },
  down: async ({ context: queryInterface }) => {
    for (const c of CONSTRAINTS) {
      await queryInterface.removeConstraint(c.table, c.name).catch(() => {});
    }
  },
};
