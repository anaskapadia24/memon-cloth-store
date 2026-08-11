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
    const { name, cat, price, originalPrice, desc, badge, imageUrl, stock, sizes, sku, color, fabric, size, setInclude, work } = req.body;

    let img = imageUrl || 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80';
    let images = [];

    if (req.files && req.files.length > 0) {
      images = req.files.map(f => f.path);
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
      originalPrice: originalPrice || 0,
      desc,
      img,
      images,
      badge,
      color: color || '',
      fabric: fabric || '',
      size: size || '',
      setInclude: setInclude || '',
      work: work || '',
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
    const { name, cat, price, originalPrice, desc, badge, imageUrl, stock, sizes, sku, color, fabric, size, setInclude, work } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.name = name || product.name;
    product.cat = cat || product.cat;
    product.sku = sku !== undefined ? sku : product.sku;
    product.price = price !== undefined ? price : product.price;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.desc = desc !== undefined ? desc : product.desc;
    product.badge = badge !== undefined ? badge : product.badge;
    product.color = color !== undefined ? color : product.color;
    product.fabric = fabric !== undefined ? fabric : product.fabric;
    product.size = size !== undefined ? size : product.size;
    product.setInclude = setInclude !== undefined ? setInclude : product.setInclude;
    product.work = work !== undefined ? work : product.work;
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
      product.images = req.files.map(f => f.path);
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

// Add a color variant to a product (admin) - own photos + own size/stock
router.post('/:id/colors', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, sizes, stock } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Color name is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let parsedSizes = [];
    if (sizes) {
      try {
        parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        parsedSizes = [];
      }
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => f.path);
    }

    product.colors.push({
      name: name.trim(),
      images,
      stock: Number(stock) || 0,
      sizes: parsedSizes
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a color variant (admin) - by its position in the colors array
router.put('/:id/colors/:colorIndex', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, sizes, stock } = req.body;
    const colorIndex = parseInt(req.params.colorIndex);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (!product.colors[colorIndex]) {
      return res.status(404).json({ error: 'Color variant not found' });
    }

    if (name) product.colors[colorIndex].name = name.trim();
    if (stock !== undefined) product.colors[colorIndex].stock = Number(stock) || 0;

    if (sizes !== undefined) {
      try {
        product.colors[colorIndex].sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
      } catch (e) {
        // Keep existing sizes
      }
    }

    if (req.files && req.files.length > 0) {
      product.colors[colorIndex].images = req.files.map(f => f.path);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a color variant (admin)
router.delete('/:id/colors/:colorIndex', adminAuth, async (req, res) => {
  try {
    const colorIndex = parseInt(req.params.colorIndex);
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (!product.colors[colorIndex]) {
      return res.status(404).json({ error: 'Color variant not found' });
    }

    product.colors.splice(colorIndex, 1);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark a product as sold out (admin) - zeroes all stock, sizes, and color variant sizes
router.put('/:id/sold-out', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.stock = 0;
    if (product.sizes && product.sizes.length > 0) {
      product.sizes.forEach(s => { s.stock = 0; });
    }
    if (product.colors && product.colors.length > 0) {
      product.colors.forEach(c => {
        if (c.sizes && c.sizes.length > 0) {
          c.sizes.forEach(s => { s.stock = 0; });
        }
      });
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

