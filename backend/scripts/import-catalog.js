#!/usr/bin/env node
// Load a catalog.json into MONGO_URI (use a local/VPS URI).
// Replaces products, categories, settings. Does not touch users or orders.
// Usage: MONGO_URI=mongodb://127.0.0.1:27017/memon-store node scripts/import-catalog.js [infile]
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Setting = require("../models/Setting");

const src = path.resolve(
  process.argv[2] || path.join(__dirname, "../../data/catalog.json"),
);

(async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
  const raw = JSON.parse(fs.readFileSync(src, "utf8"));
  const products = raw.products || [];
  const categories = raw.categories || [];
  const settings = raw.settings || [];
  if (!products.length && !categories.length)
    throw new Error("catalog file looks empty");

  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Setting.deleteMany({}),
  ]);
  if (products.length) await Product.insertMany(products);
  if (categories.length) await Category.insertMany(categories);
  if (settings.length) await Setting.insertMany(settings);
  console.log(
    `Imported ${products.length} products, ${categories.length} categories, ${settings.length} settings into ${process.env.MONGO_URI.replace(/\/\/.*@/, "//***@")}`,
  );
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
