require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const seedData = require("./config/seed");

const app = express();

// Behind a reverse proxy (CloudPanel/Nginx) in production - trust the first hop's
// X-Forwarded-For so express-rate-limit identifies real client IPs correctly.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Connect to MongoDB
connectDB();

// Security & logging middleware
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Restrict cross-origin API access to known frontends (falls back to open for local dev
// when FRONTEND_URL/ADMIN_URL aren't set - always set both in production).
const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(
  Boolean,
);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting: loose global cap, stricter cap on auth/payment endpoints (brute-force/abuse targets)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (req, res) => res.json({ ok: true }));

// Marketing-email opt-out link, clicked straight from an email client - plain
// HTML response, not JSON, since there's no frontend page for this.
app.get("/api/unsubscribe/:userId", async (req, res) => {
  const User = require("./models/User");
  try {
    await User.findByIdAndUpdate(req.params.userId, { unsubscribed: true });
  } catch (err) {
    // Invalid/unknown id - still show the same confirmation, nothing sensitive to leak
  }
  res.send(
    '<div style="font-family:Arial,sans-serif;max-width:480px;margin:80px auto;text-align:center;">' +
      "<h2>You've been unsubscribed</h2>" +
      "<p>You won't receive marketing emails from Memon Cloth Store anymore.</p>" +
      "</div>",
  );
});

// API Routes
app.use("/api/auth", strictLimiter, require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/users", require("./routes/users"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/payment", strictLimiter, require("./routes/payment"));
app.use("/api/promos", require("./routes/promos"));
app.use("/api/campaigns", require("./routes/campaigns"));

// Settings endpoint (admin)
app.get("/api/settings", async (req, res) => {
  try {
    const Setting = require("./models/Setting");
    const settings = await Setting.find();
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/api/settings",
  require("./middleware/auth").adminAuth,
  async (req, res) => {
    try {
      const Setting = require("./models/Setting");
      const entries = Object.entries(req.body);
      for (const [key, value] of entries) {
        await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
      }
      res.json({ message: "Settings updated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Dashboard stats (admin)
app.get(
  "/api/admin/stats",
  require("./middleware/auth").adminAuth,
  async (req, res) => {
    try {
      const Product = require("./models/Product");
      const Order = require("./models/Order");
      const User = require("./models/User");

      const [totalProducts, totalOrders, pendingOrders, totalCustomers, rev] =
        await Promise.all([
          Product.countDocuments(),
          Order.countDocuments(),
          Order.countDocuments({ status: "pending" }),
          User.countDocuments({ role: "customer" }),
          Order.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ]),
        ]);

      res.json({
        totalProducts,
        totalOrders,
        totalRevenue: rev[0]?.total || 0,
        pendingOrders,
        totalCustomers,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Export/Import endpoints
app.get(
  "/api/admin/export",
  require("./middleware/auth").adminAuth,
  async (req, res) => {
    try {
      const Product = require("./models/Product");
      const Order = require("./models/Order");
      const Category = require("./models/Category");
      const Setting = require("./models/Setting");
      const User = require("./models/User");

      const [products, orders, categories, settings, users] = await Promise.all(
        [
          Product.find(),
          Order.find(),
          Category.find(),
          Setting.find(),
          User.find().select("-password"),
        ],
      );

      const settingsObj = {};
      settings.forEach((s) => {
        settingsObj[s.key] = s.value;
      });

      res.json({ products, orders, categories, settings: settingsObj, users });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.post(
  "/api/admin/import",
  require("./middleware/auth").adminAuth,
  async (req, res) => {
    try {
      const Product = require("./models/Product");
      const Order = require("./models/Order");
      const Category = require("./models/Category");
      const Setting = require("./models/Setting");

      const { products, orders, categories, settings } = req.body;

      // Clear existing data
      await Promise.all([
        Product.deleteMany({}),
        Order.deleteMany({}),
        Category.deleteMany({}),
        Setting.deleteMany({}),
      ]);

      // Import new data
      if (products?.length) await Product.insertMany(products);
      if (orders?.length) await Order.insertMany(orders);
      if (categories?.length) await Category.insertMany(categories);
      if (settings) {
        for (const [key, value] of Object.entries(settings)) {
          await Setting.create({ key, value });
        }
      }

      res.json({ message: "Data imported successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.post(
  "/api/admin/reset",
  require("./middleware/auth").adminAuth,
  async (req, res) => {
    try {
      const Product = require("./models/Product");
      const Order = require("./models/Order");
      const Category = require("./models/Category");

      await Promise.all([
        Product.deleteMany({}),
        Order.deleteMany({}),
        Category.deleteMany({}),
      ]);

      // Re-seed default data
      await seedData();

      res.json({ message: "Data reset to defaults" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// Error handling for multer/upload failures (and anything else that reaches
// here uncaught) - err.message isn't guaranteed to exist on every error type
// (e.g. Cloudinary upload failures), so guard before calling string methods
// on it instead of crashing the crash handler itself.
app.use((err, req, res, next) => {
  if (err.message === "Only image files (JPG, PNG, WebP) are allowed") {
    return res.status(400).json({ error: err.message });
  }
  if (err.message && err.message.includes("File too large")) {
    return res.status(400).json({ error: "File size must be less than 5MB" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
