const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const { auth, adminAuth } = require("../middleware/auth");
const router = express.Router();

// Get all users (admin)
router.get("/", adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    const ids = users.map((u) => u._id);
    const stats = ids.length
      ? await Order.aggregate([
          { $match: { userId: { $in: ids } } },
          {
            $group: {
              _id: "$userId",
              orderCount: { $sum: 1 },
              totalSpent: { $sum: "$total" },
              couponsUsed: {
                $sum: { $cond: [{ $ne: ["$coupon", ""] }, 1, 0] },
              },
            },
          },
        ])
      : [];
    const byUser = new Map(stats.map((s) => [String(s._id), s]));

    res.json(
      users.map((u) => {
        const s = byUser.get(String(u._id));
        return {
          ...u,
          orderCount: s?.orderCount || 0,
          totalSpent: s?.totalSpent || 0,
          couponsUsed: s?.couponsUsed || 0,
        };
      }),
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete own account (customer) - soft delete: scrubs PII, keeps order/invoice
// history intact for tax/legal record-keeping (order docs snapshot customer info
// independently, see models/Order.js) and satisfies DPDP-style right-to-erasure.
router.delete("/me", auth, async (req, res) => {
  try {
    const user = req.user;
    user.name = "Deleted User";
    user.email = `deleted-${user._id}@deleted.local`;
    user.phone = undefined;
    user.googleId = undefined;
    user.addresses = [];
    user.deletedAt = new Date();
    await user.save();

    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
