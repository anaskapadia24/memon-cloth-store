// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   cat: { type: String, required: true, trim: true },
//   price: { type: Number, required: true, min: 0 },
//   desc: { type: String, default: 'Quality product from Memon Cloth Store.' },
//   img: { type: String, default: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80' },
//   badge: { type: String, default: '' },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Product', productSchema);


const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  size: { type: String, required: true, enum: ['S', 'M', 'L', 'XL', 'XXL', '3XL'] },
  stock: { type: Number, default: 0, min: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  sku: { type: String, trim: true, default: '' },
  name: { type: String, required: true, trim: true },
  cat: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  desc: { type: String, default: 'Quality product from Memon Cloth Store.' },
  img: { type: String, default: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80' },
  images: [{ type: String }],
  badge: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  sizes: [sizeSchema],
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);