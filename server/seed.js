/**
 * ===========================================
 * Database Seed Script
 * ===========================================
 * Populates the database with sample vendors, shops, and products.
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Shop = require('./models/Shop');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/local_market_store';

// ─── Sample Data ────────────────────────────────────────

const vendors = [
  {
    name: 'Priya Sharma',
    email: 'priya@market.com',
    password: 'vendor123',
    role: 'vendor',
    phone: '+91 98765 43210',
    address: 'Chandni Chowk, Delhi'
  },
  {
    name: 'Ravi Kumar',
    email: 'ravi@market.com',
    password: 'vendor123',
    role: 'vendor',
    phone: '+91 98765 43211',
    address: 'Koramangala, Bangalore'
  },
  {
    name: 'Anita Desai',
    email: 'anita@market.com',
    password: 'vendor123',
    role: 'vendor',
    phone: '+91 98765 43212',
    address: 'Bandra West, Mumbai'
  }
];

const customers = [
  {
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+91 91234 56789',
    address: '42 MG Road, Pune'
  },
  {
    name: 'Sneha Patel',
    email: 'sneha@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+91 91234 56790',
    address: '15 Park Street, Kolkata'
  }
];

const shops = [
  {
    name: "Priya's Fresh Grocery",
    description: 'Farm-fresh vegetables, fruits, and organic staples delivered from local farms. Quality you can taste, prices you can afford.',
    category: 'grocery',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    address: 'Shop 12, Chandni Chowk Market, Delhi'
  },
  {
    name: "Ravi's Tech Hub",
    description: 'Latest gadgets, accessories, and electronics at competitive prices. From smartphones to smart home devices — we have it all.',
    category: 'electronics',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    address: '3rd Floor, Forum Mall, Koramangala'
  },
  {
    name: "Anita's Handcraft Studio",
    description: 'Beautiful handmade crafts, artisanal home decor, and unique gift items. Each piece tells a story of Indian craftsmanship.',
    category: 'handicrafts',
    logo: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    address: '7 Hill Road, Bandra West, Mumbai'
  }
];

const productSets = [
  // Priya's Grocery products
  [
    {
      name: 'Organic Basmati Rice',
      description: 'Premium aged basmati rice from the foothills of Himalayas. Long grain, aromatic, and perfect for biryanis and pulao.',
      price: 280,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      category: 'grocery',
      stock: 150
    },
    {
      name: 'Cold Pressed Coconut Oil',
      description: 'Pure cold-pressed virgin coconut oil. Ideal for cooking, hair care, and skin care. No chemicals, no preservatives.',
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87d5?w=400',
      category: 'grocery',
      stock: 80
    },
    {
      name: 'Farm Fresh Honey',
      description: 'Raw, unprocessed multifloral honey sourced directly from beekeepers in Sundarbans. Rich in antioxidants.',
      price: 350,
      imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
      category: 'grocery',
      stock: 60
    },
    {
      name: 'Organic Turmeric Powder',
      description: 'Lakadong turmeric with high curcumin content. Freshly ground, vibrant color, and potent flavor for authentic Indian cooking.',
      price: 180,
      imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400',
      category: 'grocery',
      stock: 200
    },
    {
      name: 'Mixed Dry Fruits Pack',
      description: 'Premium assortment of almonds, cashews, raisins, and pistachios. Perfect for gifting or healthy snacking.',
      price: 750,
      imageUrl: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400',
      category: 'grocery',
      stock: 40
    }
  ],
  // Ravi's Electronics products
  [
    {
      name: 'Wireless Bluetooth Earbuds',
      description: 'True wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance.',
      price: 2499,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400',
      category: 'electronics',
      stock: 50
    },
    {
      name: 'Smart LED Desk Lamp',
      description: 'Touch-controlled LED desk lamp with 5 brightness levels, 3 color temperatures, and USB charging port. Eye-care certified.',
      price: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab3fe?w=400',
      category: 'electronics',
      stock: 35
    },
    {
      name: 'Portable Power Bank 20000mAh',
      description: 'Slim design power bank with dual USB-C ports, fast charging support, and LED display. Charge 3 devices simultaneously.',
      price: 1899,
      imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
      category: 'electronics',
      stock: 70
    },
    {
      name: 'Mechanical Gaming Keyboard',
      description: 'RGB backlit mechanical keyboard with blue switches, anti-ghosting, and programmable macro keys. Built for gamers.',
      price: 3499,
      imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400',
      category: 'electronics',
      stock: 25
    },
    {
      name: 'USB-C Hub 7-in-1',
      description: 'Multiport adapter with HDMI 4K, USB 3.0, SD card reader, and 100W PD charging. Compatible with all USB-C laptops.',
      price: 1599,
      imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400',
      category: 'electronics',
      stock: 45
    }
  ],
  // Anita's Handicrafts products
  [
    {
      name: 'Hand-painted Ceramic Vase',
      description: 'Exquisite blue pottery vase hand-painted by artisans from Jaipur. Each piece is unique with traditional Mughal motifs.',
      price: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400',
      category: 'handicrafts',
      stock: 15
    },
    {
      name: 'Embroidered Cushion Covers (Set of 4)',
      description: 'Vibrant Kashmiri embroidery on pure cotton cushion covers. Traditional Phulkari patterns in contemporary colors.',
      price: 899,
      imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400',
      category: 'handicrafts',
      stock: 30
    },
    {
      name: 'Brass Diya Set (6 pieces)',
      description: 'Hand-crafted brass oil lamps with intricate engraving. Traditional design perfect for Diwali, pooja, and home decor.',
      price: 650,
      imageUrl: 'https://images.unsplash.com/photo-1605882174146-a464b70cf691?w=400',
      category: 'handicrafts',
      stock: 50
    },
    {
      name: 'Wooden Wall Art - Tree of Life',
      description: 'Intricately carved wooden wall panel depicting the Tree of Life. Made from seasoned teak wood with natural polish.',
      price: 2800,
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400',
      category: 'handicrafts',
      stock: 10
    },
    {
      name: 'Handwoven Jute Basket Set',
      description: 'Eco-friendly jute storage baskets in 3 sizes. Perfect for organizing your space with a natural, rustic aesthetic.',
      price: 550,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      category: 'handicrafts',
      stock: 40
    }
  ]
];

// ─── Seed Function ──────────────────────────────────────

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create vendors
    const createdVendors = [];
    for (const vendor of vendors) {
      const user = await User.create(vendor);
      createdVendors.push(user);
    }
    console.log(`👤 Created ${createdVendors.length} vendors`);

    // Create customers
    const createdCustomers = [];
    for (const customer of customers) {
      const user = await User.create(customer);
      createdCustomers.push(user);
    }
    console.log(`👤 Created ${createdCustomers.length} customers`);

    // Create shops (one per vendor)
    const createdShops = [];
    for (let i = 0; i < createdVendors.length; i++) {
      const shop = await Shop.create({
        ...shops[i],
        owner: createdVendors[i]._id
      });
      createdShops.push(shop);
    }
    console.log(`🏪 Created ${createdShops.length} shops`);

    // Create products for each shop
    let totalProducts = 0;
    for (let i = 0; i < createdShops.length; i++) {
      for (const productData of productSets[i]) {
        await Product.create({
          ...productData,
          shop: createdShops[i]._id,
          vendor: createdVendors[i]._id
        });
        totalProducts++;
      }
    }
    console.log(`📦 Created ${totalProducts} products`);

    console.log('\n✨ ============================================');
    console.log('   Database seeded successfully!');
    console.log('   ──────────────────────────────────────────');
    console.log('   Vendor Accounts (password: vendor123):');
    console.log('     • priya@market.com');
    console.log('     • ravi@market.com');
    console.log('     • anita@market.com');
    console.log('   ──────────────────────────────────────────');
    console.log('   Customer Accounts (password: customer123):');
    console.log('     • rahul@example.com');
    console.log('     • sneha@example.com');
    console.log('✨ ============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
