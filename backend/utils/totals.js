const Setting = require("../models/Setting");
const { quoteCart } = require("./promo");

const FEE_KEYS = [
  "deliveryFee",
  "freeDeliveryMin",
  "freeDeliveryPins",
  "freeDeliveryCities",
  "gstPercent",
  "gstInclusive",
  "codFee",
];

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function splitList(v) {
  return String(v || "")
    .split(/[\n,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function getFeeSettings() {
  const rows = await Setting.find({ key: { $in: FEE_KEYS } });
  const m = {};
  rows.forEach((s) => {
    m[s.key] = s.value;
  });
  return {
    deliveryFee: num(m.deliveryFee),
    freeDeliveryMin: num(m.freeDeliveryMin),
    freePins: splitList(m.freeDeliveryPins).map((p) => p.replace(/\s/g, "")),
    freeCities: splitList(m.freeDeliveryCities),
    gstPercent: num(m.gstPercent),
    gstInclusive: m.gstInclusive === "true",
    codFee: num(m.codFee),
  };
}

function applyFees(goodsTotal, dest, payment, fee) {
  const pin = String(dest.pin || "").replace(/\s/g, "");
  const city = String(dest.city || "")
    .trim()
    .toLowerCase();
  const freeByPin = pin && fee.freePins.includes(pin);
  const freeByCity =
    city && fee.freeCities.some((c) => city.includes(c) || c.includes(city));
  const freeByAmt =
    fee.freeDeliveryMin > 0 && goodsTotal >= fee.freeDeliveryMin;

  let shipping = fee.deliveryFee;
  let shippingNote = shipping > 0 ? `Delivery Rs ${shipping}` : "Free delivery";
  if (shipping > 0 && freeByPin) {
    shipping = 0;
    shippingNote = "Free delivery for this PIN";
  } else if (shipping > 0 && freeByCity) {
    shipping = 0;
    shippingNote = "Free delivery in this city";
  } else if (shipping > 0 && freeByAmt) {
    shipping = 0;
    shippingNote = `Free delivery on orders of Rs ${fee.freeDeliveryMin}+`;
  }

  let gst = 0;
  if (fee.gstPercent > 0) {
    gst = fee.gstInclusive
      ? Math.round((goodsTotal * fee.gstPercent) / (100 + fee.gstPercent))
      : Math.round((goodsTotal * fee.gstPercent) / 100);
  }

  const codFee = payment === "cod" ? fee.codFee : 0;
  const goodsWithGst = fee.gstInclusive ? goodsTotal : goodsTotal + gst;
  const total = Math.max(0, goodsWithGst + shipping + codFee);

  return {
    shipping,
    shippingNote,
    gst,
    gstPercent: fee.gstPercent,
    gstInclusive: fee.gstInclusive,
    codFee,
    total,
  };
}

async function quoteCheckout({ items, coupon, city, pin, payment, userId }) {
  const promo = await quoteCart(items || [], coupon || "", userId);
  const fee = await getFeeSettings();
  const extras = applyFees(promo.total, { city, pin }, payment || "cod", fee);
  return {
    subtotal: promo.subtotal,
    discount: promo.discount,
    promo: promo.promo,
    error: promo.error,
    goods: promo.total,
    shipping: extras.shipping,
    shippingNote: extras.shippingNote,
    gst: extras.gst,
    gstPercent: extras.gstPercent,
    gstInclusive: extras.gstInclusive,
    codFee: extras.codFee,
    total: extras.total,
  };
}

module.exports = { getFeeSettings, applyFees, quoteCheckout };
