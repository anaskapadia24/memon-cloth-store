const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/email');
const PDFDocument = require('pdfkit');
const shiprocket = require('../utils/shiprocket');
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

// Generate invoice PDF (admin)
router.get('/:id/invoice', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderNumber = order._id.toString().slice(-8).toUpperCase();
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderNumber}.pdf`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#0a1628').text('MEMON CLOTH STORE', 50, 50);

    doc.fontSize(18).font('Helvetica-Bold').fillColor('#0a1628').text('INVOICE', 350, 50, { width: 200, align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor('#666').text(`Date: ${orderDate}`, 350, 74, { width: 200, align: 'right' });

    doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#c9a84c').lineWidth(1.5).stroke();

    // Sold By / Billing columns
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0a1628').text('Sold By:', 50, 118);
    doc.fontSize(9).font('Helvetica').fillColor('#333').text(
      'Memon Cloth Store\nGhass Bazar Road, Near National Urdu\nPrimary School, Kalyan West, Mumbai\nMaharashtra, India\nPhone: +91 84528 03023',
      50, 134, { width: 240 }
    );

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0a1628').text('Billing / Shipping Address:', 320, 118);
    doc.fontSize(9).font('Helvetica').fillColor('#333').text(
      `${order.customer.name}\n${order.customer.address}\n${order.customer.city}, ${order.customer.state} - ${order.customer.pin}\nPhone: ${order.customer.phone}`,
      320, 134, { width: 230 }
    );

    // Order meta
    const metaY = 235;
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0a1628').text(`Order Number: #${orderNumber}`, 50, metaY);
    doc.text(`Payment Method: ${order.payment}`, 320, metaY);

    // Table header
    const tableTop = 270;
    doc.moveTo(50, tableTop - 8).lineTo(550, tableTop - 8).strokeColor('#e0e0e0').lineWidth(1).stroke();
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0a1628');
    doc.text('Sl No', 50, tableTop);
    doc.text('Description', 90, tableTop);
    doc.text('Qty', 340, tableTop, { width: 40, align: 'right' });
    doc.text('Price', 400, tableTop, { width: 60, align: 'right' });
    doc.text('Amount', 470, tableTop, { width: 80, align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#e0e0e0').lineWidth(1).stroke();

    // Table rows
    let y = tableTop + 25;
    doc.font('Helvetica').fillColor('#333');
    order.items.forEach((item, i) => {
      const desc = item.name + (item.size ? ` (${item.size})` : '');
      doc.fontSize(9);
      doc.text(String(i + 1), 50, y);
      doc.text(desc, 90, y, { width: 240 });
      doc.text(String(item.qty), 340, y, { width: 40, align: 'right' });
      doc.text(`Rs. ${item.price}`, 400, y, { width: 60, align: 'right' });
      doc.text(`Rs. ${item.price * item.qty}`, 470, y, { width: 80, align: 'right' });
      y += 22;
    });

    doc.moveTo(50, y).lineTo(550, y).strokeColor('#e0e0e0').lineWidth(1).stroke();
    y += 12;

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#0a1628');
    doc.text('TOTAL', 400, y, { width: 60, align: 'right' });
    doc.text(`Rs. ${order.total}`, 470, y, { width: 80, align: 'right' });

    y += 50;
    doc.fontSize(8).font('Helvetica').fillColor('#999').text(
      'Thank you for shopping with Memon Cloth Store! For queries, contact us on WhatsApp at +91 84528 03023.',
      50, y, { width: 500, align: 'center' }
    );

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ship order via Shiprocket (admin) - creates shipment, assigns AWB, gets label
router.post('/:id/ship-shiprocket', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.shiprocket && order.shiprocket.awbCode) {
      return res.status(400).json({ error: 'This order has already been shipped via Shiprocket' });
    }

    const shipmentData = await shiprocket.createShipment(order);

    if (!shipmentData.shipment_id) {
      return res.status(500).json({ error: shipmentData.message || 'Failed to create Shiprocket shipment' });
    }

    order.shiprocket.orderId = String(shipmentData.order_id || '');
    order.shiprocket.shipmentId = String(shipmentData.shipment_id);
    order.shiprocket.status = 'shipment_created';
    await order.save();

    const awbData = await shiprocket.assignAWB(shipmentData.shipment_id);

    if (awbData.response && awbData.response.data) {
      order.shiprocket.awbCode = awbData.response.data.awb_code || '';
      order.shiprocket.courierName = awbData.response.data.courier_name || '';
      order.shiprocket.status = 'awb_assigned';
    }

    order.status = 'packed';
    order.tracking.push({
      status: 'packed',
      notes: order.shiprocket.awbCode
        ? `Shipped via Shiprocket - AWB: ${order.shiprocket.awbCode} (${order.shiprocket.courierName})`
        : 'Shipment created on Shiprocket'
    });

    await order.save();

    try {
      const labelData = await shiprocket.generateLabel(shipmentData.shipment_id);
      if (labelData.label_url) {
        order.shiprocket.labelUrl = labelData.label_url;
        await order.save();
      }
    } catch (labelErr) {
      console.error('Label generation error (non-fatal):', labelErr.message);
    }

    res.json(order);
  } catch (err) {
    console.error('Shiprocket shipping error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.message || err.message });
  }
});

// Shiprocket webhook - receives automatic tracking updates
router.post('/courier-webhook', async (req, res) => {
  try {
    const { awb, current_status, order_id } = req.body;

    if (!awb) {
      return res.status(400).json({ error: 'Missing AWB in webhook payload' });
    }

    const order = await Order.findOne({ 'shiprocket.awbCode': awb });
    if (!order) {
      return res.status(200).json({ message: 'Order not found for this AWB, ignoring' });
    }

    const statusMap = {
      'PICKED UP': 'shipped',
      'IN TRANSIT': 'shipped',
      'OUT FOR DELIVERY': 'out_for_delivery',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    };

    const mappedStatus = statusMap[String(current_status).toUpperCase()];

    if (mappedStatus && mappedStatus !== order.status) {
      order.status = mappedStatus;
      order.tracking.push({
        status: mappedStatus,
        notes: `Shiprocket update: ${current_status}`
      });
      order.shiprocket.status = current_status;
      await order.save();
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (err) {
    console.error('Shiprocket webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;