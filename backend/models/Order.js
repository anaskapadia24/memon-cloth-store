const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'] 
  },
  timestamp: { type: Date, default: Date.now },
  location: { type: String, default: '' },
  notes: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pin: { type: String, required: true },
    state: { type: String, required: true }
  },
  items: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    size: { type: String, default: '' }
  }],
  total: { type: Number, required: true, min: 0 },
  payment: { type: String, required: true },
  paymentId: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  tracking: [trackingSchema],
  shiprocket: {
    orderId: { type: String, default: '' },
    shipmentId: { type: String, default: '' },
    awbCode: { type: String, default: '' },
    courierName: { type: String, default: '' },
    labelUrl: { type: String, default: '' },
    status: { type: String, default: '' }
  },
  returnRequest: {
    requested: { type: Boolean, default: false },
    type: { type: String, enum: ['replace', 'refund', ''], default: '' },
    reason: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['none', 'requested', 'approved', 'rejected', 'completed'], 
      default: 'none' 
    },
    requestedAt: { type: Date },
    adminNotes: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
