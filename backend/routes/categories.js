const express = require('express');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { id, name } = req.body;
    const category = new Category({ id, name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id: newId, name } = req.body;
    const category = await Category.findOne({ id: req.params.id });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const oldId = category.id;
    category.id = newId;
    category.name = name;
    await category.save();

    // Update products with old category
    if (oldId !== newId) {
      await Product.updateMany({ cat: oldId }, { cat: newId });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ cat: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${productCount} products are using this category`
      });
    }

    const category = await Category.findOneAndDelete({ id: req.params.id });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
