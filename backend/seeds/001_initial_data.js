module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed Shops
    await queryInterface.bulkInsert('shops', [
      { id: "msn", name: "Mission District", city: "San Francisco, CA", code: "SF-01", hours: "7am – 10pm", tint: "152", created_at: new Date(), updated_at: new Date() },
      { id: "psl", name: "Park Slope", city: "Brooklyn, NY", code: "NY-02", hours: "7am – 11pm", tint: "45", created_at: new Date(), updated_at: new Date() },
      { id: "wkr", name: "Wicker Park", city: "Chicago, IL", code: "IL-03", hours: "8am – 10pm", tint: "245", created_at: new Date(), updated_at: new Date() },
      { id: "scg", name: "South Congress", city: "Austin, TX", code: "TX-04", hours: "7am – 11pm", tint: "78", created_at: new Date(), updated_at: new Date() },
    ]);

    // Seed Categories
    await queryInterface.bulkInsert('categories', [
      { id: "produce", name: "Produce", hue: 145, blurb: "Picked at peak ripeness", created_at: new Date(), updated_at: new Date() },
      { id: "dairy", name: "Dairy & Eggs", hue: 75, blurb: "Fresh from local farms", created_at: new Date(), updated_at: new Date() },
      { id: "bakery", name: "Bakery", hue: 55, blurb: "Baked in-house daily", created_at: new Date(), updated_at: new Date() },
      { id: "meat", name: "Meat & Seafood", hue: 18, blurb: "Butcher & dock fresh", created_at: new Date(), updated_at: new Date() },
      { id: "pantry", name: "Pantry", hue: 35, blurb: "Everyday staples", created_at: new Date(), updated_at: new Date() },
      { id: "beverages", name: "Beverages", hue: 230, blurb: "Sip something good", created_at: new Date(), updated_at: new Date() },
      { id: "frozen", name: "Frozen", hue: 210, blurb: "Freezer favorites", created_at: new Date(), updated_at: new Date() },
      { id: "snacks", name: "Snacks", hue: 30, blurb: "Crunch & munch", created_at: new Date(), updated_at: new Date() },
    ]);

    // Seed Suppliers
    await queryInterface.bulkInsert('suppliers', [
      { id: "valley", name: "Valley Fresh Farms", type: "Produce", lead_time: "Next-day", email: "contact@valleyfresh.com", phone: "555-0101", contact_name: "John Smith", created_at: new Date(), updated_at: new Date() },
      { id: "golden", name: "Golden State Dairy Co.", type: "Dairy & Eggs", lead_time: "2 days", email: "sales@goldendairy.com", phone: "555-0102", contact_name: "Sarah Johnson", created_at: new Date(), updated_at: new Date() },
      { id: "sunrise", name: "Sunrise Bakehouse", type: "Bakery", lead_time: "Daily", email: "orders@sunrisebake.com", phone: "555-0103", contact_name: "Mike Brown", created_at: new Date(), updated_at: new Date() },
      { id: "harbor", name: "Harbor Catch Seafood", type: "Meat & Seafood", lead_time: "Next-day", email: "ordering@harborcatch.com", phone: "555-0104", contact_name: "Elena Garcia", created_at: new Date(), updated_at: new Date() },
      { id: "prairie", name: "Prairie Mills", type: "Pantry", lead_time: "3 days", email: "b2b@prairiemills.com", phone: "555-0105", contact_name: "David Lee", created_at: new Date(), updated_at: new Date() },
      { id: "cascade", name: "Cascade Beverage Dist.", type: "Beverages", lead_time: "2 days", email: "accounts@cascadebev.com", phone: "555-0106", contact_name: "Lisa Chen", created_at: new Date(), updated_at: new Date() },
    ]);

    // Seed Products (38 total)
    const products = [
      { id: "p01", name: "Organic Hass Avocados", category_id: "produce", price: 1.49, unit: "each", par: 40, supplier_id: "valley", tag: "Organic" },
      { id: "p02", name: "Honeycrisp Apples", category_id: "produce", price: 2.99, unit: "lb", par: 30, supplier_id: "valley", tag: null },
      { id: "p03", name: "Rainbow Carrots", category_id: "produce", price: 3.49, unit: "bunch", par: 20, supplier_id: "valley", tag: "Organic" },
      { id: "p04", name: "Baby Spinach", category_id: "produce", price: 3.99, unit: "5 oz", par: 24, supplier_id: "valley", tag: "Organic" },
      { id: "p05", name: "Vine Tomatoes", category_id: "produce", price: 2.79, unit: "lb", par: 25, supplier_id: "valley", tag: null },
      { id: "p06", name: "Lemons", category_id: "produce", price: 0.79, unit: "each", par: 40, supplier_id: "valley", tag: null },
      { id: "p07", name: "Cremini Mushrooms", category_id: "produce", price: 2.49, unit: "8 oz", par: 18, supplier_id: "valley", tag: null },
      { id: "p08", name: "Strawberries", category_id: "produce", price: 4.49, unit: "1 lb", par: 24, supplier_id: "valley", tag: "Local" },
      { id: "p09", name: "Pasture-Raised Eggs", category_id: "dairy", price: 6.49, unit: "dozen", par: 30, supplier_id: "golden", tag: "Local" },
      { id: "p10", name: "Whole Milk", category_id: "dairy", price: 4.29, unit: "half gal", par: 24, supplier_id: "golden", tag: null },
      { id: "p11", name: "Greek Yogurt, Plain", category_id: "dairy", price: 5.99, unit: "32 oz", par: 20, supplier_id: "golden", tag: null },
      { id: "p12", name: "Aged White Cheddar", category_id: "dairy", price: 7.99, unit: "8 oz", par: 15, supplier_id: "golden", tag: null },
      { id: "p13", name: "Salted Butter", category_id: "dairy", price: 5.49, unit: "1 lb", par: 20, supplier_id: "golden", tag: null },
      { id: "p14", name: "Oat Milk, Barista", category_id: "dairy", price: 4.99, unit: "32 oz", par: 18, supplier_id: "golden", tag: "Plant-based" },
      { id: "p15", name: "Sourdough Boule", category_id: "bakery", price: 5.99, unit: "loaf", par: 18, supplier_id: "sunrise", tag: "Baked today" },
      { id: "p16", name: "Butter Croissants", category_id: "bakery", price: 3.49, unit: "4 ct", par: 16, supplier_id: "sunrise", tag: "Baked today" },
      { id: "p17", name: "Multigrain Sandwich Bread", category_id: "bakery", price: 4.49, unit: "loaf", par: 16, supplier_id: "sunrise", tag: null },
      { id: "p18", name: "Blueberry Muffins", category_id: "bakery", price: 4.99, unit: "4 ct", par: 12, supplier_id: "sunrise", tag: null },
      { id: "p19", name: "Wild King Salmon", category_id: "meat", price: 16.99, unit: "lb", par: 12, supplier_id: "harbor", tag: "Wild" },
      { id: "p20", name: "Organic Chicken Breast", category_id: "meat", price: 8.99, unit: "lb", par: 20, supplier_id: "harbor", tag: "Organic" },
      { id: "p21", name: "Grass-Fed Ground Beef", category_id: "meat", price: 9.49, unit: "lb", par: 18, supplier_id: "harbor", tag: null },
      { id: "p22", name: "Jumbo Gulf Shrimp", category_id: "meat", price: 13.99, unit: "lb", par: 12, supplier_id: "harbor", tag: null },
      { id: "p23", name: "Extra Virgin Olive Oil", category_id: "pantry", price: 12.99, unit: "500 ml", par: 18, supplier_id: "prairie", tag: null },
      { id: "p24", name: "Bronze-Cut Spaghetti", category_id: "pantry", price: 3.29, unit: "16 oz", par: 30, supplier_id: "prairie", tag: null },
      { id: "p25", name: "San Marzano Tomatoes", category_id: "pantry", price: 3.99, unit: "28 oz", par: 24, supplier_id: "prairie", tag: null },
      { id: "p26", name: "Wildflower Honey", category_id: "pantry", price: 8.49, unit: "12 oz", par: 15, supplier_id: "prairie", tag: "Local" },
      { id: "p27", name: "Sea Salt Flakes", category_id: "pantry", price: 6.99, unit: "8.8 oz", par: 12, supplier_id: "prairie", tag: null },
      { id: "p28", name: "Cold Brew Coffee", category_id: "beverages", price: 4.99, unit: "32 oz", par: 24, supplier_id: "cascade", tag: null },
      { id: "p29", name: "Sparkling Water, Lime", category_id: "beverages", price: 5.49, unit: "8 pk", par: 30, supplier_id: "cascade", tag: null },
      { id: "p30", name: "Fresh Orange Juice", category_id: "beverages", price: 6.99, unit: "52 oz", par: 18, supplier_id: "cascade", tag: "Cold-pressed" },
      { id: "p31", name: "Kombucha, Ginger", category_id: "beverages", price: 3.99, unit: "16 oz", par: 24, supplier_id: "cascade", tag: null },
      { id: "p32", name: "Wild Blueberries", category_id: "frozen", price: 5.99, unit: "10 oz", par: 20, supplier_id: "valley", tag: "Frozen" },
      { id: "p33", name: "Margherita Pizza", category_id: "frozen", price: 7.49, unit: "each", par: 18, supplier_id: "prairie", tag: null },
      { id: "p34", name: "Vanilla Bean Gelato", category_id: "frozen", price: 6.49, unit: "1 pt", par: 18, supplier_id: "golden", tag: null },
      { id: "p35", name: "Sea Salt Kettle Chips", category_id: "snacks", price: 3.99, unit: "8 oz", par: 24, supplier_id: "prairie", tag: null },
      { id: "p36", name: "Dark Chocolate, 70%", category_id: "snacks", price: 4.49, unit: "3.5 oz", par: 20, supplier_id: "prairie", tag: "Fair trade" },
      { id: "p37", name: "Roasted Almonds", category_id: "snacks", price: 7.99, unit: "16 oz", par: 18, supplier_id: "prairie", tag: null },
      { id: "p38", name: "Sourdough Pretzels", category_id: "snacks", price: 3.49, unit: "10 oz", par: 18, supplier_id: "prairie", tag: null },
    ];

    const productsWithTimestamps = products.map(p => ({
      ...p,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert('products', productsWithTimestamps);

    // Seed Inventory (create entries for all shops x products)
    const shops = ["msn", "psl", "wkr", "scg"];
    const inventory = [];

    function shopStock(productId, shopId) {
      const product = products.find(x => x.id === productId);
      if (!product) return 0;
      const seed = (productId.charCodeAt(1) * 7 + shopId.charCodeAt(0) * 3) % 11;
      const base = 20; // baseline stock for demo
      const shopIdx = shops.indexOf(shopId);
      const factors = [1, 0.55, 1.4, 0.8];
      return Math.max(0, Math.round(base * factors[shopIdx] + (seed - 5)));
    }

    for (const product of products) {
      for (const shopId of shops) {
        inventory.push({
          id: require('crypto').randomUUID(),
          shop_id: shopId,
          product_id: product.id,
          stock: shopStock(product.id, shopId),
          par: product.par,
          last_received: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          last_adjusted: null,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    // Insert inventory in batches to avoid too large insert
    for (let i = 0; i < inventory.length; i += 50) {
      await queryInterface.bulkInsert('inventory', inventory.slice(i, i + 50));
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('inventory', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('suppliers', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('shops', null, {});
  },
};
