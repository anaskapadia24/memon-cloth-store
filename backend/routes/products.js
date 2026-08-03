const express = require('express');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all products (public) - with price filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.cat = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } },
        { cat: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (admin) - with sizes and multiple images
router.post('/', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, cat, price, desc, badge, imageUrl, stock, sizes, sku } = req.body;

    let img = imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80';
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
      img = images[0]; // First image as main
    }

    // Parse sizes if provided as JSON string
    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        parsedSizes = [];
      }
    }

    const product = new Product({
      sku,
      name,
      cat,
      price,
      desc,
      img,
      images,
      badge,
      stock: stock || 0,
      sizes: parsedSizes
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product (admin) - with sizes and multiple images
router.put('/:id', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, cat, price, desc, badge, imageUrl, stock, sizes, sku } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.name = name || product.name;
    product.cat = cat || product.cat;
    product.sku = sku !== undefined ? sku : product.sku;
    product.price = price !== undefined ? price : product.price;
    product.desc = desc !== undefined ? desc : product.desc;
    product.badge = badge !== undefined ? badge : product.badge;
    product.stock = stock !== undefined ? stock : product.stock;

    // Update sizes
    if (sizes !== undefined) {
      try {
        product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        // Keep existing sizes
      }
    }

    // Update images
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(f => `/uploads/${f.filename}`);
      product.img = product.images[0];
    } else if (imageUrl) {
      product.img = imageUrl;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
