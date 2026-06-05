const bcryptjs = require('bcryptjs');
require('dotenv').config();
const { sequelize, User, Shop, Supplier, Category, Product } = require('./src/models');

async function seedDatabase() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Connected to database');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✓ Models synced');

    // Create shops first
    const shops = [
      { id: 'msn', name: 'Mission District', city: 'San Francisco', code: 'MSN', hours: '9am-9pm', tint: '#3498db' },
      { id: 'psl', name: 'Park Slope', city: 'Brooklyn', code: 'PSL', hours: '9am-9pm', tint: '#e74c3c' },
      { id: 'wkr', name: 'Wicker Park', city: 'Chicago', code: 'WKR', hours: '9am-9pm', tint: '#2ecc71' },
      { id: 'scg', name: 'South Congress', city: 'Austin', code: 'SCG', hours: '9am-9pm', tint: '#f39c12' },
    ];

    for (const shop of shops) {
      const existingShop = await Shop.findByPk(shop.id);
      if (!existingShop) {
        await Shop.create(shop);
        console.log(`✓ Created shop: ${shop.name}`);
      }
    }

    // Create suppliers
    const suppliers = [
      {
        id: 'valley',
        name: 'Valley Fresh Farms',
        type: 'Produce',
        leadTime: 'Next-day',
        email: 'sales@valleyfresh.com',
        phone: '(555) 123-4567',
        contactName: 'John Smith',
        deliveryModel: 'local_perishable',
        deliveryDays: ['monday', 'wednesday', 'friday'],
        minimumOrderAmount: 150.00,
        paymentTerms: 'cod',
      },
      {
        id: 'golden',
        name: 'Golden State Dairy Co.',
        type: 'Dairy & Eggs',
        leadTime: '2 days',
        email: 'orders@goldendairy.com',
        phone: '(555) 234-5678',
        contactName: 'Sarah Johnson',
        deliveryModel: 'local_perishable',
        deliveryDays: ['tuesday', 'thursday', 'saturday'],
        minimumOrderAmount: 200.00,
        paymentTerms: 'cod',
      },
      {
        id: 'sunrise',
        name: 'Sunrise Bakehouse',
        type: 'Bakery',
        leadTime: 'Daily',
        email: 'deliveries@sunrise.com',
        phone: '(555) 345-6789',
        contactName: 'Maria Garcia',
        deliveryModel: 'dsd',
        deliveryDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        minimumOrderAmount: null,
        paymentTerms: 'cod',
      },
      {
        id: 'harbor',
        name: 'Harbor Catch Seafood',
        type: 'Meat & Seafood',
        leadTime: 'Next-day',
        email: 'wholesale@harborcatch.com',
        phone: '(555) 456-7890',
        contactName: 'Tom Wilson',
        deliveryModel: 'local_perishable',
        deliveryDays: ['monday', 'wednesday', 'friday'],
        minimumOrderAmount: 300.00,
        paymentTerms: 'net30',
      },
      {
        id: 'prairie',
        name: 'Prairie Mills',
        type: 'Pantry',
        leadTime: '3 days',
        email: 'sales@prairiemills.com',
        phone: '(555) 567-8901',
        contactName: 'Robert Brown',
        deliveryModel: 'wholesale',
        deliveryDays: ['wednesday'],
        minimumOrderAmount: 500.00,
        paymentTerms: 'net30',
      },
      {
        id: 'cascade',
        name: 'Cascade Beverage Dist.',
        type: 'Beverages',
        leadTime: '2 days',
        email: 'orders@cascadebev.com',
        phone: '(555) 678-9012',
        contactName: 'Jennifer Lee',
        deliveryModel: 'wholesale',
        deliveryDays: ['tuesday', 'friday'],
        minimumOrderAmount: 400.00,
        paymentTerms: 'net30',
      },
    ];

    for (const supplier of suppliers) {
      const existingSupplier = await Supplier.findByPk(supplier.id);
      if (!existingSupplier) {
        await Supplier.create(supplier);
        console.log(`✓ Created supplier: ${supplier.name}`);
      }
    }

    // Delete and recreate admin user (force fresh creation)
    await User.destroy({ where: { email: 'admin@gogopantry.com' } });

    {
      await User.create({
        email: 'admin@gogopantry.com',
        password: '123456',
        name: 'Admin User',
        phone: '(555) 000-0001',
        userType: 'admin',
        shopId: 'msn',
        status: 'active',
      });

      console.log('✓ Admin user created:');
      console.log('  Email: admin@gogopantry.com');
      console.log('  Password: 123456');
      console.log('  userType: admin');
    }

    // Create demo staff user
    const existingStaffUser = await User.findOne({ where: { email: 'staff@gogopantry.com' } });

    if (existingStaffUser) {
      console.log('✓ Demo staff user already exists');
    } else {
      await User.create({
        email: 'staff@gogopantry.com',
        password: 'password123',
        name: 'Demo Staff',
        phone: '(555) 000-0002',
        userType: 'staff',
        shopId: 'msn',
        status: 'active',
      });

      console.log('✓ Demo staff user created:');
      console.log('  Email: staff@gogopantry.com');
      console.log('  Password: password123');
      console.log('  userType: staff');
    }

    // Create additional demo staff for other shops
    const otherShops = [
      { shopId: 'psl', shopName: 'Park Slope' },
      { shopId: 'wkr', shopName: 'Wicker Park' },
      { shopId: 'scg', shopName: 'South Congress' },
    ];

    for (const shop of otherShops) {
      const existingShopUser = await User.findOne({ where: { email: `staff@${shop.shopId}.com` } });
      if (!existingShopUser) {
        await User.create({
          email: `staff@${shop.shopId}.com`,
          password: 'password123',
          name: `Staff - ${shop.shopName}`,
          phone: `(555) 000-${Math.floor(Math.random() * 9000) + 1000}`,
          userType: 'staff',
          shopId: shop.shopId,
          status: 'active',
        });
        console.log(`✓ Created staff for ${shop.shopName}`);
      }
    }

    // Create default categories
    const categories = [
      { id: 'produce', name: 'Produce', hue: 120, blurb: 'Fresh vegetables and fruits' },
      { id: 'dairy', name: 'Dairy & Eggs', hue: 200, blurb: 'Milk, cheese, and eggs' },
      { id: 'bakery', name: 'Bakery', hue: 30, blurb: 'Fresh baked goods' },
      { id: 'meat', name: 'Meat & Seafood', hue: 350, blurb: 'Fresh meat and seafood' },
      { id: 'pantry', name: 'Pantry', hue: 45, blurb: 'Dry goods and staples' },
      { id: 'beverages', name: 'Beverages', hue: 260, blurb: 'Drinks and beverages' },
    ];

    for (const cat of categories) {
      const existingCat = await Category.findByPk(cat.id);
      if (!existingCat) {
        await Category.create(cat);
        console.log(`✓ Created category: ${cat.name}`);
      }
    }

    // Create sample products
    const sampleProducts = [
      { id: 'p1', name: 'Organic Tomatoes', categoryId: 'produce', price: 3.99, unit: 'lb', par: 10, supplierId: 'valley', productType: 'simple', status: 'draft' },
      { id: 'p2', name: 'Fresh Lettuce', categoryId: 'produce', price: 2.49, unit: 'head', par: 15, supplierId: 'valley', productType: 'simple', status: 'draft' },
      { id: 'p3', name: 'Whole Milk', categoryId: 'dairy', price: 3.49, unit: 'gal', par: 8, supplierId: 'golden', productType: 'simple', status: 'draft' },
      { id: 'p4', name: 'Cheddar Cheese', categoryId: 'dairy', price: 6.99, unit: 'lb', par: 5, supplierId: 'golden', productType: 'simple', status: 'draft' },
      { id: 'p5', name: 'Sourdough Bread', categoryId: 'bakery', price: 4.99, unit: 'loaf', par: 12, supplierId: 'sunrise', productType: 'simple', status: 'draft' },
      { id: 'p6', name: 'Croissants', categoryId: 'bakery', price: 2.99, unit: 'piece', par: 20, supplierId: 'sunrise', productType: 'simple', status: 'draft' },
      { id: 'p7', name: 'Atlantic Salmon', categoryId: 'meat', price: 12.99, unit: 'lb', par: 6, supplierId: 'harbor', productType: 'simple', status: 'draft' },
      { id: 'p8', name: 'Ground Beef', categoryId: 'meat', price: 8.99, unit: 'lb', par: 10, supplierId: 'harbor', productType: 'simple', status: 'draft' },
      { id: 'p9', name: 'Organic Rice', categoryId: 'pantry', price: 4.49, unit: 'lb', par: 15, supplierId: 'prairie', productType: 'simple', status: 'draft' },
      { id: 'p10', name: 'Extra Virgin Olive Oil', categoryId: 'pantry', price: 9.99, unit: 'bottle', par: 8, supplierId: 'prairie', productType: 'simple', status: 'draft' },
      { id: 'p11', name: 'Orange Juice', categoryId: 'beverages', price: 4.99, unit: 'gal', par: 10, supplierId: 'cascade', productType: 'simple', status: 'draft' },
      { id: 'p12', name: 'Craft Cola', categoryId: 'beverages', price: 1.99, unit: 'can', par: 25, supplierId: 'cascade', productType: 'simple', status: 'draft' },
    ];

    for (const prod of sampleProducts) {
      const existingProd = await Product.findByPk(prod.id);
      if (!existingProd) {
        await Product.create(prod);
        console.log(`✓ Created product: ${prod.name}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n--- LOGIN CREDENTIALS ---');
    console.log('\nAdmin User:');
    console.log('  Email: admin@gogopantry.com');
    console.log('  Password: 1234');
    console.log('  userType: admin');
    console.log('\nStaff Users:');
    console.log('  Email: staff@gogopantry.com');
    console.log('  Password: password123');
    console.log('  userType: staff');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
