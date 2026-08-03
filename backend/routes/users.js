const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all users (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Add order stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const orderCount = await Order.countDocuments({ userId: user._id });
      const orders = await Order.find({ userId: user._id });
      const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

      return {
        ...user.toJSON(),
        orderCount,
        totalSpent
      };
    }));

    res.json(usersWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
