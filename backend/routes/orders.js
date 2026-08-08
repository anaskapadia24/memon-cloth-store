const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/email');
const router = express.Router();

// Create order (customer)
router.post('/', auth, async (req, res) => {
  try {
    const { customer, items, total, payment, notes, paymentId } = req.body;

    const order = new Order({
      userId: req.user._id,
      customer,
      items,
      total,
      payment,
      paymentId: paymentId || '',
      notes,
      tracking: [{ status: 'pending', notes: 'Order placed' }]
    });

    await order.save();
    // Send confirmation email (won't block order creation if it fails)
    sendOrderConfirmationEmail(order);
    // Reduce stock for each item (color + size aware)
    for (const item of items) {
      if (item.id) {
        const product = await Product.findById(item.id);
        if (product) {
          if (item.color && product.colors && product.colors.length > 0) {
            const colorObj = product.colors.find(c => c.name === item.color);
            if (colorObj) {
              const sizeObj = colorObj.sizes.find(s => s.size === item.size);
              if (sizeObj) {
                sizeObj.stock = Math.max(0, sizeObj.stock - item.qty);
              }
            }
          } else if (item.size) {
            const sizeObj = product.sizes.find(s => s.size === item.size);
            if (sizeObj) {
              sizeObj.stock = Math.max(0, sizeObj.stock - item.qty);
            }
          } else {
            product.stock = Math.max(0, product.stock - item.qty);
          }
          await product.save();
        }
      }
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status with tracking (admin)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, location, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.tracking.push({
      status,
      location: location || '',
      notes: notes || ''
    });

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Request return/refund (customer) - allowed within 7 days of order, only for delivered orders
router.post('/:id/return-request', auth, async (req, res) => {
  try {
    const { type, reason } = req.body;

    if (!['replace', 'refund'].includes(type)) {
      return res.status(400).json({ error: 'Type must be "replace" or "refund"' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please provide a reason' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Returns are only available for delivered orders' });
    }
    if (order.returnRequest && order.returnRequest.requested) {
      return res.status(400).json({ error: 'A return request already exists for this order' });
    }

    const daysSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceOrder > 7) {
      return res.status(400).json({ error: 'Return window (7 days) has expired for this order' });
    }

    order.returnRequest = {
      requested: true,
      type,
      reason: reason.trim(),
      status: 'requested',
      requestedAt: new Date(),
      adminNotes: ''
    };

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update return/refund request status (admin)
router.put('/:id/return-status', adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['requested', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (!order.returnRequest || !order.returnRequest.requested) {
      return res.status(400).json({ error: 'No return request exists for this order' });
    }

    order.returnRequest.status = status;
    if (adminNotes !== undefined) {
      order.returnRequest.adminNotes = adminNotes;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;