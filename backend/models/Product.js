const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      enum: ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
    },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    sizes: [sizeSchema],
  },
  { _id: false },
);

const productSchema = new mongoose.Schema({
  sku: { type: String, trim: true, default: "" },
  name: { type: String, required: true, trim: true },
  cat: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0, default: 0 },
  desc: { type: String, default: "Quality product from Memon Cloth Store." },
  img: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80",
  },
  images: [{ type: String }],
  badge: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  comingSoon: { type: Boolean, default: false },
  comingSoonKind: {
    type: String,
    enum: ["", "launch", "restock"],
    default: "",
  },
  comingSoonNote: { type: String, default: "", trim: true },
  color: { type: String, default: "", trim: true },
  fabric: { type: String, default: "", trim: true },
  size: { type: String, default: "", trim: true },
  setInclude: { type: String, default: "", trim: true },
  work: { type: String, default: "", trim: true },
  stock: { type: Number, default: 0, min: 0 },
  sizes: [sizeSchema],
  colors: [colorSchema],
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
