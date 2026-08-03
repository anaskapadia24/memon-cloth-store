require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const seedData = require('./config/seed');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/users', require('./routes/users'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/payment', require('./routes/payment'));

// Settings endpoint (admin)
app.get('/api/settings', async (req, res) => {
  try {
    const Setting = require('./models/Setting');
    const settings = await Setting.find();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', require('./middleware/auth').adminAuth, async (req, res) => {
  try {
    const Setting = require('./models/Setting');
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
    }
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats (admin)
app.get('/api/admin/stats', require('./middleware/auth').adminAuth, async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Order = require('./models/Order');
    const User = require('./models/User');

    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalCustomers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-' + process.env.ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

// Export/Import endpoints
app.get('/api/admin/export', require('./middleware/auth').adminAuth, async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Order = require('./models/Order');
    const Category = require('./models/Category');
    const Setting = require('./models/Setting');
    const User = require('./models/User');

    const [products, orders, categories, settings, users] = await Promise.all([
      Product.find(),
      Order.find(),
      Category.find(),
      Setting.find(),
      User.find().select('-password')
    ]);

    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });

    res.json({ products, orders, categories, settings: settingsObj, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/import', require('./middleware/auth').adminAuth, async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Order = require('./models/Order');
    const Category = require('./models/Category');
    const Setting = require('./models/Setting');

    const { products, orders, categories, settings } = req.body;

    // Clear existing data
    await Promise.all([
      Product.deleteMany({}),
      Order.deleteMany({}),
      Category.deleteMany({}),
      Setting.deleteMany({})
    ]);

    // Import new data
    if (products?.length) await Product.insertMany(products);
    if (orders?.length) await Order.insertMany(orders);
    if (categories?.length) await Category.insertMany(categories);
    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        await Setting.create({ key, value });
      }
    }

    res.json({ message: 'Data imported successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/reset', require('./middleware/auth').adminAuth, async (req, res) => {
  try {
    const Product = require('./models/Product');
    const Order = require('./models/Order');
    const Category = require('./models/Category');

    await Promise.all([
      Product.deleteMany({}),
      Order.deleteMany({}),
      Category.deleteMany({})
    ]);

    // Re-seed default data
    await seedData();

    res.json({ message: 'Data reset to defaults' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to frontend for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling for multer
app.use((err, req, res, next) => {
  if (err.message === 'Only image files (JPG, PNG, WebP) are allowed') {
    return res.status(400).json({ error: err.message });
  }
  if (err.message.includes('File too large')) {
    return res.status(400).json({ error: 'File size must be less than 5MB' });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
