const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  blurb: { type: String, default: "", trim: true },
  kind: {
    type: String,
    enum: ["percent", "bogo", "flat", "featured", "banner", "custom"],
    required: true,
  },
  percent: { type: Number, default: 0, min: 0, max: 90 },
  flatOff: { type: Number, default: 0, min: 0 },
  customRule: { type: String, default: "", trim: true },
  minAmount: { type: Number, default: 0, min: 0 },
  buyQty: { type: Number, default: 3, min: 2 },
  payQty: { type: Number, default: 2, min: 1 },
  coupon: { type: String, default: "", trim: true, uppercase: true },
  placements: [
    {
      type: String,
      enum: [
        "home_top",
        "home_ticker",
        "shop_side",
        "product",
        "checkout",
        "popup",
      ],
    },
  ],
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  active: { type: Boolean, default: false },
  startsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Promo", promoSchema);
