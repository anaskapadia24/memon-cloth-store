const express = require("express");
const Promo = require("../models/Promo");
const { adminAuth } = require("../middleware/auth");
const { isLive } = require("../utils/promo");
const { revalidate } = require("../utils/revalidate");
const router = express.Router();

const FIELDS = [
  "title",
  "blurb",
  "kind",
  "percent",
  "flatOff",
  "customRule",
  "minAmount",
  "buyQty",
  "payQty",
  "coupon",
  "usageLimit",
  "perUserLimit",
  "placements",
  "productIds",
  "active",
  "startsAt",
  "endsAt",
];

function pick(body) {
  const out = {};
  for (const k of FIELDS) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  if (typeof out.coupon === "string")
    out.coupon = out.coupon.trim().toUpperCase();
  if (out.startsAt === "") out.startsAt = null;
  if (out.endsAt === "") out.endsAt = null;
  return out;
}

router.get("/", async (req, res) => {
  try {
    const all = await Promo.find().sort({ createdAt: -1 });
    res.json(all.filter((p) => isLive(p)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales the admin has scheduled but haven't started yet (public) - lets the
// storefront build anticipation ("20% off starting Friday") instead of a
// scheduled promo being invisible to customers until the moment it goes live.
router.get("/upcoming", async (req, res) => {
  try {
    const now = new Date();
    const upcoming = await Promo.find({
      active: true,
      startsAt: { $gt: now },
    }).sort({ startsAt: 1 });
    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", adminAuth, async (req, res) => {
  try {
    const all = await Promo.find().sort({ createdAt: -1 });
    const Order = require("../models/Order");
    const codes = all.map((p) => p.coupon).filter(Boolean);
    const usage = codes.length
      ? await Order.aggregate([
          { $match: { coupon: { $in: codes }, status: { $ne: "cancelled" } } },
          { $group: { _id: "$coupon", count: { $sum: 1 } } },
        ])
      : [];
    const usageByCode = new Map(usage.map((u) => [u._id, u.count]));
    res.json(
      all.map((p) => ({
        ...p.toObject(),
        timesUsed: p.coupon ? usageByCode.get(p.coupon) || 0 : 0,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/quote", async (req, res) => {
  try {
    const { quoteCheckout } = require("../utils/totals");
    const result = await quoteCheckout({
      items: req.body.items || [],
      coupon: req.body.coupon || "",
      city: req.body.city || "",
      pin: req.body.pin || "",
      payment: req.body.payment || "cod",
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", adminAuth, async (req, res) => {
  try {
    if (!req.body.title || !req.body.kind) {
      return res
        .status(400)
        .json({ error: "Title and offer type are required" });
    }
    const promo = await Promo.create(pick(req.body));
    revalidate(["promos", "products"]);
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
    });
    if (!promo) return res.status(404).json({ error: "Offer not found" });
    revalidate(["promos", "products"]);
    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ error: "Offer not found" });
    revalidate(["promos", "products"]);
    res.json({ message: "Offer removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
