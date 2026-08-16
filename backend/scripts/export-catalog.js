#!/usr/bin/env node
// Dump products + categories + settings from MONGO_URI (Atlas or local).
// Usage: node scripts/export-catalog.js [outfile]
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Setting = require("../models/Setting");

const dest = path.resolve(
  process.argv[2] || path.join(__dirname, "../../data/catalog.json"),
);

(async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
  await mongoose.connect(process.env.MONGO_URI);
  const [products, categories, settings] = await Promise.all([
    Product.find().lean(),
    Category.find().lean(),
    Setting.find().lean(),
  ]);
  const payload = {
    exportedAt: new Date().toISOString(),
    source: process.env.MONGO_URI.replace(/\/\/.*@/, "//***@"),
    products,
    categories,
    settings,
  };
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(payload, null, 2));
  console.log(
    `Wrote ${products.length} products, ${categories.length} categories, ${settings.length} settings → ${dest}`,
  );
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
