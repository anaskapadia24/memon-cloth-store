const Promo = require("../models/Promo");

function isLive(promo, now = new Date()) {
  if (!promo.active) return false;
  if (promo.startsAt && now < promo.startsAt) return false;
  if (promo.endsAt && now > promo.endsAt) return false;
  return true;
}

function discountFor(promo, items) {
  const lines = (items || []).filter((i) => i && i.qty > 0 && i.price >= 0);
  const scoped =
    promo.productIds && promo.productIds.length
      ? lines.filter((i) =>
          promo.productIds.some((id) => String(id) === String(i.id || i._id)),
        )
      : lines;
  const subtotal = scoped.reduce(
    (s, i) => s + Number(i.price) * Number(i.qty),
    0,
  );

  if (
    promo.kind === "percent" ||
    (promo.kind === "custom" &&
      Number(promo.percent) > 0 &&
      !(Number(promo.flatOff) > 0))
  ) {
    if (subtotal < (promo.minAmount || 0)) return 0;
    return Math.round((subtotal * (Number(promo.percent) || 0)) / 100);
  }

  if (
    promo.kind === "flat" ||
    (promo.kind === "custom" && Number(promo.flatOff) > 0)
  ) {
    if (subtotal < (promo.minAmount || 0)) return 0;
    return Math.min(Number(promo.flatOff) || 0, subtotal);
  }

  if (promo.kind === "bogo") {
    const buy = Math.max(2, Number(promo.buyQty) || 3);
    const pay = Math.min(buy - 1, Math.max(1, Number(promo.payQty) || 2));
    const units = [];
    for (const i of scoped) {
      for (let n = 0; n < Number(i.qty); n++) units.push(Number(i.price));
    }
    const freeCount = Math.floor(units.length / buy) * (buy - pay);
    units.sort((a, b) => a - b);
    return units.slice(0, freeCount).reduce((s, p) => s + p, 0);
  }

  return 0;
}

// Counts redemptions straight from Order history instead of a separate
// ledger - a coupon's usage IS the set of non-cancelled orders that recorded
// that code, so there's nothing to keep in sync.
async function couponUsage(code, userId) {
  const Order = require("../models/Order");
  const match = { coupon: code, status: { $ne: "cancelled" } };
  const total = await Order.countDocuments(match);
  const byUser = userId ? await Order.countDocuments({ ...match, userId }) : 0;
  return { total, byUser };
}

async function quoteCart(items, coupon, userId) {
  const now = new Date();
  const all = await Promo.find({ active: true });
  const live = all.filter((p) => isLive(p, now));
  const code = (coupon || "").trim().toUpperCase();

  let chosen = null;
  if (code) {
    chosen = live.find((p) => p.coupon && p.coupon === code) || null;
    if (!chosen)
      return {
        subtotal: sum(items),
        discount: 0,
        total: sum(items),
        promo: null,
        error: "This coupon is not valid",
      };
    if (chosen.usageLimit > 0 || (userId && chosen.perUserLimit > 0)) {
      const usage = await couponUsage(code, userId);
      if (chosen.usageLimit > 0 && usage.total >= chosen.usageLimit) {
        return {
          subtotal: sum(items),
          discount: 0,
          total: sum(items),
          promo: null,
          error: "This coupon has reached its usage limit",
        };
      }
      if (
        userId &&
        chosen.perUserLimit > 0 &&
        usage.byUser >= chosen.perUserLimit
      ) {
        return {
          subtotal: sum(items),
          discount: 0,
          total: sum(items),
          promo: null,
          error: "You've already used this coupon",
        };
      }
    }
  } else {
    const autos = live.filter(
      (p) =>
        !p.coupon && ["percent", "bogo", "flat", "custom"].includes(p.kind),
    );
    let best = 0;
    for (const p of autos) {
      const d = discountFor(p, items);
      if (d > best) {
        best = d;
        chosen = p;
      }
    }
  }

  const subtotal = sum(items);
  const discount = chosen ? discountFor(chosen, items) : 0;
  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
    promo: chosen
      ? {
          _id: chosen._id,
          title: chosen.title,
          kind: chosen.kind,
          coupon: chosen.coupon || "",
        }
      : null,
    error:
      chosen && discount === 0 && code
        ? "Cart does not meet this offer yet"
        : "",
  };
}

function sum(items) {
  return (items || []).reduce(
    (s, i) => s + Number(i.price || 0) * Number(i.qty || 0),
    0,
  );
}

module.exports = { isLive, discountFor, quoteCart, couponUsage };
