const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Shops table
    await queryInterface.createTable('shops', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      hours: {
        type: DataTypes.STRING,
      },
      tint: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // Create Categories table
    await queryInterface.createTable('categories', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hue: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      blurb: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // Create Suppliers table
    await queryInterface.createTable('suppliers', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lead_time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // Create Products table
    await queryInterface.createTable('products', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
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
      supplier_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'suppliers',
          key: 'id',
        },
      },
      tag: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // Create Users table
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('staff', 'manager', 'admin'),
        defaultValue: 'staff',
      },
      shop_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id',
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('users', ['email'], { unique: true });

    // Create Inventory table
    await queryInterface.createTable('inventory', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      shop_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id',
        },
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      par: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      last_received: {
        type: DataTypes.DATE,
      },
      last_adjusted: {
        type: DataTypes.DATE,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('inventory', ['shop_id', 'product_id'], { unique: true });

    // Create Customers table
    await queryInterface.createTable('customers', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      zip_code: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('customers', ['email'], { unique: true });

    // Create Purchase Orders table
    await queryInterface.createTable('purchase_orders', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      supplier_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'suppliers',
          key: 'id',
        },
      },
      shop_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'in-transit', 'arrived', 'received'),
        defaultValue: 'scheduled',
      },
      eta: {
        type: DataTypes.DATE,
      },
      received_at: {
        type: DataTypes.DATE,
      },
      line_items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('purchase_orders', ['shop_id', 'status']);

    // Create Stock Transfers table
    await queryInterface.createTable('stock_transfers', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      from_shop_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id',
        },
      },
      to_shop_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'in-transit', 'received'),
        defaultValue: 'pending',
      },
      line_items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      initiated_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      received_by: {
        type: DataTypes.UUID,
      },
      received_at: {
        type: DataTypes.DATE,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    // Create Orders table
    await queryInterface.createTable('orders', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.UUID,
        references: {
          model: 'customers',
          key: 'id',
        },
      },
      shop_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'shops',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('new', 'picking', 'ready', 'completed', 'cancelled'),
        defaultValue: 'new',
      },
      order_type: {
        type: DataTypes.ENUM('delivery', 'pickup'),
        allowNull: false,
      },
      time_slot: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      items: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      pricing: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      delivery: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      fulfillment: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn('now'),
      },
    });

    await queryInterface.addIndex('orders', ['shop_id', 'status', 'created_at']);
    await queryInterface.addIndex('orders', ['customer_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('stock_transfers');
    await queryInterface.dropTable('purchase_orders');
    await queryInterface.dropTable('customers');
    await queryInterface.dropTable('inventory');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('suppliers');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('shops');
  },
};
