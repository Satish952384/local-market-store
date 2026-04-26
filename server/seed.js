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
const Order = require('./models/Order');

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
  },
  {
    name: 'Mohammad Faizal',
    email: 'faizal@market.com',
    password: 'vendor123',
    role: 'vendor',
    phone: '+91 98765 43213',
    address: 'T Nagar, Chennai'
  },
  {
    name: 'Sunita Reddy',
    email: 'sunita@market.com',
    password: 'vendor123',
    role: 'vendor',
    phone: '+91 98765 43214',
    address: 'Jubilee Hills, Hyderabad'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@market.com',
    password: 'vendor123',
    role: 'vendor',
    phone: '+91 98765 43215',
    address: 'Civil Lines, Jaipur'
  },
  {
    name: 'Meera Iyer',
    email: 'meera@market.com',
    password: 'vendor123',
    role: 'vendor',
    phone: '+91 98765 43216',
    address: 'Indiranagar, Bangalore'
  },
  {
    name: 'Arjun Nair',
    email: 'arjun@market.com',
    password: 'vendor123',
    role: 'vendor',
    phone: '+91 98765 43217',
    address: 'Kochi, Kerala'
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
  },
  {
    name: 'Arun Joshi',
    email: 'arun@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+91 91234 56791',
    address: 'Banjara Hills, Hyderabad'
  },
  {
    name: 'Pooja Sharma',
    email: 'pooja@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+91 91234 56792',
    address: 'Vasant Kunj, Delhi'
  },
  {
    name: 'Karthik R',
    email: 'karthik@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+91 91234 56793',
    address: 'Whitefield, Bangalore'
  },
  {
    name: 'Divya Menon',
    email: 'divya@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+91 91234 56794',
    address: 'Powai, Mumbai'
  },
  {
    name: 'Sanjay Gupta',
    email: 'sanjay@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+91 91234 56795',
    address: 'Salt Lake, Kolkata'
  },
  {
    name: 'Lakshmi Narayanan',
    email: 'lakshmi@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+91 91234 56796',
    address: 'Adyar, Chennai'
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
  },
  {
    name: "Faizal's Silk House",
    description: 'Premium silk sarees, fabrics, and traditional Indian attire. Authentic weaves from Banaras and Kanchipuram at wholesale prices.',
    category: 'clothing',
    logo: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400',
    address: '42, Ground Floor, T Nagar, Chennai'
  },
  {
    name: "Sunita's Organic Kitchen",
    description: 'Organic spices, grains, and traditional food products. Farm to table — authentic South Indian ingredients for your kitchen.',
    category: 'food',
    logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    address: 'Plot 45, Jubilee Hills, Hyderabad'
  },
  {
    name: "Vikram's Book Corner",
    description: 'Wide collection of books across all genres. From bestsellers to rare finds — feeding the mind since 1995.',
    category: 'books',
    logo: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400',
    address: '15, MI Road, Civil Lines, Jaipur'
  },
  {
    name: "Meera's Wellness Center",
    description: 'Natural supplements, Ayurvedic medicines, and wellness products. Your journey to holistic health starts here.',
    category: 'health',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    address: '201, 2nd Floor, Indiranagar, Bangalore'
  },
  {
    name: "Arjun's Spice Mart",
    description: "Premium spices, masalas, and Kerala's finest cashews. Authentic Kerala flavors exported worldwide.",
    category: 'grocery',
    logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    address: 'Fort Road, Kochi, Kerala'
  }
];

const productSets = [
  // Priya's Grocery products (Shop 0)
  [
    { name: 'Organic Basmati Rice', description: 'Premium aged basmati rice from the foothills of Himalayas. Long grain, aromatic, and perfect for biryanis and pulao.', price: 280, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', category: 'grocery', stock: 150 },
    { name: 'Cold Pressed Coconut Oil', description: 'Pure cold-pressed virgin coconut oil. Ideal for cooking, hair care, and skin care. No chemicals, no preservatives.', price: 450, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87d5?w=400', category: 'grocery', stock: 80 },
    { name: 'Farm Fresh Honey', description: 'Raw, unprocessed multifloral honey sourced directly from beekeepers in Sundarbans. Rich in antioxidants.', price: 350, imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', category: 'grocery', stock: 60 },
    { name: 'Organic Turmeric Powder', description: 'Lakadong turmeric with high curcumin content. Freshly ground, vibrant color, and potent flavor for authentic Indian cooking.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400', category: 'grocery', stock: 200 },
    { name: 'Mixed Dry Fruits Pack', description: 'Premium assortment of almonds, cashews, raisins, and pistachios. Perfect for gifting or healthy snacking.', price: 750, imageUrl: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400', category: 'grocery', stock: 40 },
    { name: 'Organic Green Tea', description: 'Premium Darjeeling green tea leaves. Antioxidant-rich and naturally refreshing.', price: 220, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', category: 'grocery', stock: 100 },
    { name: 'Toor Dal', description: 'Split pigeon peas from Andhra farms. Perfect for dal tadka and sambar.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400', category: 'grocery', stock: 120 },
    { name: 'Ghee Clarified Butter', description: 'Traditional cow ghee made from desi bilona method. Rich aroma and authentic taste.', price: 550, imageUrl: 'https://images.unsplash.com/photo-1600189025748-7168f8e2f6c5?w=400', category: 'grocery', stock: 45 }
  ],
  // Ravi's Electronics products (Shop 1)
  [
    { name: 'Wireless Bluetooth Earbuds', description: 'True wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400', category: 'electronics', stock: 50 },
    { name: 'Smart LED Desk Lamp', description: 'Touch-controlled LED desk lamp with 5 brightness levels, 3 color temperatures, and USB charging port.', price: 1299, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab3fe?w=400', category: 'electronics', stock: 35 },
    { name: 'Portable Power Bank 20000mAh', description: 'Slim design power bank with dual USB-C ports, fast charging support, and LED display.', price: 1899, imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', category: 'electronics', stock: 70 },
    { name: 'Mechanical Gaming Keyboard', description: 'RGB backlit mechanical keyboard with blue switches, anti-ghosting, and programmable macro keys.', price: 3499, imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400', category: 'electronics', stock: 25 },
    { name: 'USB-C Hub 7-in-1', description: 'Multiport adapter with HDMI 4K, USB 3.0, SD card reader, and 100W PD charging.', price: 1599, imageUrl: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400', category: 'electronics', stock: 45 },
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with 2.4GHz connection and silent clicks. 12-month battery life.', price: 699, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', category: 'electronics', stock: 80 },
    { name: 'Smart Watch', description: 'Fitness tracker with heart rate monitor, sleep tracking, and 7-day battery. Compatible with iOS and Android.', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: 'electronics', stock: 40 },
    { name: 'Webcam HD 1080p', description: 'Full HD webcam with built-in microphone and automatic low-light correction.', price: 1899, imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400', category: 'electronics', stock: 30 }
  ],
  // Anita's Handicrafts products (Shop 2)
  [
    { name: 'Hand-painted Ceramic Vase', description: 'Exquisite blue pottery vase hand-painted by artisans from Jaipur. Each piece is unique with traditional Mughal motifs.', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400', category: 'handicrafts', stock: 15 },
    { name: 'Embroidered Cushion Covers (Set of 4)', description: 'Vibrant Kashmiri embroidery on pure cotton cushion covers. Traditional Phulkari patterns in contemporary colors.', price: 899, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400', category: 'handicrafts', stock: 30 },
    { name: 'Brass Diya Set (6 pieces)', description: 'Hand-crafted brass oil lamps with intricate engraving. Traditional design perfect for Diwali and home decor.', price: 650, imageUrl: 'https://images.unsplash.com/photo-1605882174146-a464b70cf691?w=400', category: 'handicrafts', stock: 50 },
    { name: 'Wooden Wall Art - Tree of Life', description: 'Intricately carved wooden wall panel depicting the Tree of Life. Made from seasoned teak wood with natural polish.', price: 2800, imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400', category: 'handicrafts', stock: 10 },
    { name: 'Handwoven Jute Basket Set', description: 'Eco-friendly jute storage baskets in 3 sizes. Perfect for organizing your space with a natural, rustic aesthetic.', price: 550, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', category: 'handicrafts', stock: 40 },
    { name: 'Macrame Wall Hanging', description: 'Bohemian-style macrame wall decor with cotton rope. Handmade by artisans.', price: 450, imageUrl: 'https://images.unsplash.com/photo-1622467827417-bbe6d1c10a6c?w=400', category: 'handicrafts', stock: 25 },
    { name: 'Terracotta Plant Pot Set', description: 'Set of 3 handcrafted terracotta pots with traditional design. Perfect for indoor plants.', price: 380, imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400', category: 'handicrafts', stock: 35 },
    { name: 'Brass Temple Bell', description: 'Hand-cast brass bell with melodious sound. Traditional puja accessory with intricate carvings.', price: 850, imageUrl: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400', category: 'handicrafts', stock: 20 }
  ],
  // Faizal's Silk House products (Shop 3)
  [
    { name: 'Banarasi Silk Saree', description: 'Authentic Banarasi silk saree with gold zari work. Traditional motifs and rich pallu.', price: 8500, imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e5501237d3?w=400', category: 'clothing', stock: 8 },
    { name: 'Kanchipuram Silk Saree', description: 'Pure Kanchipuram silk with contrasting border and pallu. Wedding special.', price: 12000, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', category: 'clothing', stock: 5 },
    { name: 'Cotton Kurti Set', description: 'Hand block printed cotton kurti with palazzo set. Comfortable everyday wear.', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400', category: 'clothing', stock: 25 },
    { name: 'Silk Dupatta', description: 'Soft silk dupatta with hand embroidery. Perfect for festive occasions.', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400', category: 'clothing', stock: 30 },
    { name: 'Linen Shirt', description: 'Premium linen shirt in solid colors. Breathable and elegant for formal wear.', price: 1650, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', category: 'clothing', stock: 20 },
    { name: 'Chikankari Kurti', description: 'Lucknowi chikankari kurti with delicate thread work. Summer essential.', price: 1450, imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400', category: 'clothing', stock: 18 },
    { name: 'Bandhani Dupatta', description: 'Traditional Bandhani tie-dye dupatta from Gujarat. Vibrant colors and unique patterns.', price: 950, imageUrl: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=400', category: 'clothing', stock: 22 },
    { name: 'Silk Kurta', description: 'Designer silk kurta with embroidery. Perfect for Eid and celebrations.', price: 2200, imageUrl: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400', category: 'clothing', stock: 15 }
  ],
  // Sunita's Organic Kitchen products (Shop 4)
  [
    { name: 'Organic Idli Rice', description: 'Premium organic idli rice for soft and fluffy idlis. Stone ground from organic farms.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', category: 'food', stock: 80 },
    { name: 'Organic Sambar Powder', description: 'Traditional sambar powder with homeground spices. No artificial preservatives.', price: 150, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', category: 'food', stock: 60 },
    { name: 'Tamil Nadu Filter Coffee', description: 'Traditional Chettinad coffee powder. Rich aroma and bold taste.', price: 280, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', category: 'food', stock: 45 },
    { name: 'Homemade Pickle - Mango', description: 'Traditional Andhra mango pickle. Authentic family recipe with sun-drying.', price: 320, imageUrl: 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?w=400', category: 'food', stock: 35 },
    { name: 'Organic Jaggery', description: 'Organic palm jaggery from Tamil Nadu. Natural sweetener without chemicals.', price: 220, imageUrl: 'https://images.unsplash.com/photo-1600528437526-4378e400a28c?w=400', category: 'food', stock: 50 },
    { name: 'Tamarind Paste', description: 'Organic tamarind paste for South Indian curries. No added preservatives.', price: 120, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', category: 'food', stock: 70 },
    { name: 'Ghee Roasted Poha', description: 'Premium beaten rice with curry leaves and peanuts. Healthy breakfast option.', price: 140, imageUrl: 'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=400', category: 'food', stock: 55 },
    { name: 'Organic Banana Chips', description: 'Crispy banana chips fried in coconut oil. Traditional Kerala snack.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1621951753013-0a2ff284662c?w=400', category: 'food', stock: 40 }
  ],
  // Vikram's Book Corner products (Shop 5)
  [
    { name: 'The Alchemist - Paulo Coelho', description: 'International bestseller about following your dreams. A magical story of shepherd Santiago.', price: 299, imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', category: 'books', stock: 25 },
    { name: 'Atomic Habits - James Clear', description: 'Transform your life through small changes. Practical guide to building good habits.', price: 399, imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', category: 'books', stock: 30 },
    { name: 'Rich Dad Poor Dad - Robert Kiyosaki', description: 'Financial literacy classic about money and investing. Changed millions of lives.', price: 350, imageUrl: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400', category: 'books', stock: 20 },
    { name: 'The Psychology of Money', description: 'Timeless lessons on wealth and happiness. By Morgan Housel.', price: 420, imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', category: 'books', stock: 18 },
    { name: 'Sapiens - Yuval Noah Harari', description: 'Brief history of humankind. From Stone Age to Silicon Valley.', price: 450, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734b794f?w=400', category: 'books', stock: 15 },
    { name: 'Ikigai - Hector Garcia', description: 'Japanese secret to a long and happy life. Find your purpose.', price: 380, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', category: 'books', stock: 22 },
    { name: 'Wings of Fire - APJ Abdul Kalam', description: 'Autobiography of India\'s missile man. Inspiring journey of a scientist.', price: 280, imageUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400', category: 'books', stock: 35 },
    { name: 'The Hobbit - JRR Tolkien', description: 'Fantasy classic about Bilbo Baggins. Enter the world of Middle-earth.', price: 320, imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400', category: 'books', stock: 28 }
  ],
  // Meera's Wellness Center products (Shop 6)
  [
    { name: 'Ashwagandha Capsules', description: 'Pure ashwagandha extract for stress relief and energy. 60-day supply.', price: 450, imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400', category: 'health', stock: 50 },
    { name: 'Chyawanprash', description: 'Classical Ayurvedic immunity booster with amla and herbs. Family health essential.', price: 380, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', category: 'health', stock: 40 },
    { name: 'Triphala Powder', description: 'Traditional Ayurvedic formula for digestive health. Natural detox.', price: 280, imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400', category: 'health', stock: 35 },
    { name: 'Amla Juice', description: 'Pure amla juice for immunity and hair health. No added sugar.', price: 220, imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a776ad61?w=400', category: 'health', stock: 45 },
    { name: 'Turmeric Capsules', description: 'High curcumin turmeric capsules for joint health and immunity.', price: 350, imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', category: 'health', stock: 55 },
    { name: 'Giloy Juice', description: 'Giloy extract for immunity and fever. Pure and natural.', price: 250, imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999eb?w=400', category: 'health', stock: 30 },
    { name: 'Massage Oil', description: 'Ayurvedic massage oil with sesame and herbs. For joint pain relief.', price: 320, imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=400', category: 'health', stock: 25 },
    { name: 'Detox Tea', description: 'Herbal detox tea for weight management. Natural ingredients.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', category: 'health', stock: 60 }
  ],
  // Arjun's Spice Mart products (Shop 7)
  [
    { name: 'Kerala Cardamom', description: 'Premium green cardamom from Idukki. Intense aroma and flavor.', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', category: 'grocery', stock: 25 },
    { name: 'Kashmiri Lal Mirch', description: 'Kashmiri red chili with vibrant color and mild heat. For curry lovers.', price: 280, imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400', category: 'grocery', stock: 40 },
    { name: 'Malabar Black Pepper', description: 'Premium black pepper from Kerala. Strong and aromatic.', price: 450, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: 'grocery', stock: 35 },
    { name: 'Kerala Cashews (500g)', description: 'Premium W210 cashews from Kerala. Perfect for snacking and cooking.', price: 650, imageUrl: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=400', category: 'grocery', stock: 30 },
    { name: 'Garam Masala', description: 'Traditional North Indian garam masala. Home ground spices.', price: 180, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', category: 'grocery', stock: 50 },
    { name: 'Curry Leaves', description: 'Fresh curry leaves from Kerala farms. Essential for South Indian cooking.', price: 80, imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400', category: 'grocery', stock: 60 },
    { name: 'Tamarind (1kg)', description: 'Premium tamarind from Tamil Nadu. Seedless and pure.', price: 220, imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', category: 'grocery', stock: 45 },
    { name: 'Coconut Frying Oil', description: 'Pure coconut oil for deep frying. Traditional Kerala cooking.', price: 380, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87d5?w=400', category: 'grocery', stock: 35 }
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
    await Order.deleteMany({});
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

    // Create products for each shop and collect all products
    const allProducts = [];
    let totalProducts = 0;
    for (let i = 0; i < createdShops.length; i++) {
      for (const productData of productSets[i]) {
        const product = await Product.create({
          ...productData,
          shop: createdShops[i]._id,
          vendor: createdVendors[i]._id
        });
        allProducts.push(product);
        totalProducts++;
      }
    }
    console.log(`📦 Created ${totalProducts} products`);

    // Create sample orders
    const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const sampleOrders = [];
    
    // Generate 15 random orders
    for (let i = 0; i < 15; i++) {
      const randomCustomer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderItems = [];
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        orderItems.push({
          product: randomProduct._id,
          productName: randomProduct.name,
          quantity: quantity,
          price: randomProduct.price
        });
        totalAmount += randomProduct.price * quantity;
      }
      
      const order = await Order.create({
        customer: randomCustomer._id,
        customerName: randomCustomer.name,
        customerEmail: randomCustomer.email,
        items: orderItems,
        totalAmount: totalAmount,
        status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
        shippingAddress: randomCustomer.address
      });
      sampleOrders.push(order);
    }
    console.log(`🛒 Created ${sampleOrders.length} sample orders`);

    console.log('\n✨ ============================================');
    console.log('   Database seeded successfully!');
    console.log('   ──────────────────────────────────────────');
    console.log('   Vendor Accounts (password: vendor123):');
    vendors.forEach(v => console.log(`     • ${v.email}`));
    console.log('   ──────────────────────────────────────────');
    console.log('   Customer Accounts (password: customer123):');
    customers.forEach(c => console.log(`     • ${c.email}`));
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
