const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");
const { auth, adminAuth } = require("../middleware/auth");
const router = express.Router();

async function recalcProductRating(productId) {
  const product = await Product.findById(productId);
  if (!product) return;
  const stats = await Review.aggregate([
    { $match: { productId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  product.avgRating = stats[0]?.avg || 0;
  product.numReviews = stats[0]?.count || 0;
  await product.save();
}

// Get reviews for a product (public)
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort(
      { createdAt: -1 },
    );
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create review (customer)
router.post("/", auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user already reviewed this product
    const existing = await Review.findOne({
      productId,
      userId: req.user._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ error: "You already reviewed this product" });
    }

    // Create review
    const review = new Review({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      rating,
      comment,
    });
    await review.save();

    // Update product average rating
    await recalcProductRating(review.productId);

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update review (customer - own review only)
router.put("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { rating, comment } = req.body;
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    // Update product average rating
    await recalcProductRating(review.productId);

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete review (customer - own review, or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if user owns review or is admin
    const isAdmin = req.user.role === "admin";
    if (review.userId.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const productId = review.productId;
    await review.deleteOne();

    // Update product average rating
    await recalcProductRating(productId);

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all reviews (admin)
router.get("/", adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("productId", "name")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
