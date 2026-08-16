const mongoose = require("mongoose");

const stockAlertSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  email: { type: String, required: true, trim: true, lowercase: true },
  createdAt: { type: Date, default: Date.now },
});

stockAlertSchema.index({ productId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("StockAlert", stockAlertSchema);
