const { DataTypes } = require('sequelize');

// Creates the addresses table backing the customer address book. Unlike
// 004's FK constraints (all RESTRICT — shared reference data shouldn't
// vanish silently), this FK uses CASCADE: an address is a dependent row
// that has no meaning once its owning customer is gone, so it should be
// removed along with the customer rather than blocking the delete.
module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('addresses', {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      customer_id: { type: DataTypes.UUID, allowNull: false },
      label: { type: DataTypes.STRING(50), allowNull: true },
      address: { type: DataTypes.STRING(200), allowNull: false },
      city: { type: DataTypes.STRING(100), allowNull: false },
      zip_code: { type: DataTypes.STRING(20), allowNull: false },
      is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });
    await queryInterface.addIndex('addresses', ['customer_id']);
    await queryInterface.addConstraint('addresses', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_addresses_customer_id',
      references: { table: 'customers', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('addresses');
  },
};
