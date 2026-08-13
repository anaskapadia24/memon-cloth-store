"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import {
  createRazorpayOrderAction,
  verifyPaymentAction,
} from "@/lib/actions/payment";
import { createOrderAction } from "@/lib/actions/orders";
import { PromoBar } from "@/components/promo-ads";
import { getPromos, promosAt, quotePromo } from "@/lib/promos";
import type { Promo, PromoQuote } from "@/lib/types";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    pin: "",
    state: "Maharashtra",
    notes: "",
  });
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [coupon, setCoupon] = useState("");
  const [quote, setQuote] = useState<PromoQuote | null>(null);
  const [ads, setAds] = useState<Promo[]>([]);

  if (!user) {
    return (
      <section className="checkout-page">
        <div className="container cart-empty">
          <i className="fas fa-lock" />
          <h4>Please login to checkout</h4>
          <p>You need to be logged in to place an order</p>
          <a href="/login?next=/checkout" className="btn btn-primary">
            <i className="fas fa-sign-in-alt" /> Login
          </a>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="checkout-page">
        <div className="container cart-empty">
          <i className="fas fa-shopping-bag" />
          <h4>Your cart is empty</h4>
          <p>Add some products before checkout!</p>
          <a href="/category/all" className="btn btn-primary">
            <i className="fas fa-th-large" /> Browse Products
          </a>
        </div>
      </section>
    );
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    getPromos()
      .then((list) => setAds(promosAt(list, "checkout")))
      .catch(() => {});
    void refreshQuote(coupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, form.city, form.pin, payment]);

  async function refreshQuote(code = coupon) {
    try {
      const q = await quotePromo(
        items.map((i) => ({ id: i.id, price: i.price, qty: i.qty })),
        code,
        { city: form.city, pin: form.pin, payment },
      );
      setQuote(q);
    } catch {
      /* keep last quote */
    }
  }

  async function finalizeOrder(paymentId?: string) {
    const result = await createOrderAction({
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        pin: form.pin,
        state: form.state,
      },
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        size: i.size,
        color: i.color,
      })),
      payment: paymentId ? "online" : "cod",
      notes: form.notes,
      paymentId,
      coupon,
    });

    if (!result.ok) {
      setError(result.error);
      setPlacing(false);
      return;
    }

    clear();
    router.push(`/account/orders?placed=${result.data._id}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPlacing(true);

    if (payment === "cod") {
      await finalizeOrder();
      return;
    }

    const payAmount = quote?.total ?? subtotal;
    const orderResult = await createRazorpayOrderAction(payAmount);
    if (!orderResult.ok) {
      setError(orderResult.error);
      setPlacing(false);
      return;
    }

    const rzpOrder = orderResult.data;
    const rzp = new window.Razorpay({
      key: rzpOrder.keyId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      name: "Memon Cloth Store",
      description: "Order Payment",
      order_id: rzpOrder.orderId,
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: "#0a1628" },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verify = await verifyPaymentAction(response);
        if (!verify.ok) {
          setError(
            "Payment verification failed. Please contact support before retrying.",
          );
          setPlacing(false);
          return;
        }
        await finalizeOrder(response.razorpay_payment_id);
      },
      modal: { ondismiss: () => setPlacing(false) },
    });
    rzp.open();
  }

  return (
    <section className="checkout-page">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="container">
        <div className="checkout-grid">
          <div className="checkout-form">
            <h3>Delivery Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-section-title">
                <i className="fas fa-user" /> Contact Details
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>

              <div className="form-section-title">
                <i className="fas fa-map-marker-alt" /> Delivery Address
              </div>
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input
                    value={form.pin}
                    onChange={(e) => update("pin", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  required
                />
              </div>

              <div className="form-section-title">
                <i className="fas fa-credit-card" /> Payment Method
              </div>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                  />
                  Cash on Delivery
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    checked={payment === "online"}
                    onChange={() => setPayment("online")}
                  />
                  Pay Online (UPI / Card / Netbanking)
                </label>
              </div>

              <div className="form-group">
                <label>Order Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ marginTop: 20 }}
                disabled={placing}
              >
                <i className="fas fa-check-circle" />{" "}
                {placing
                  ? "Placing Order..."
                  : `Place Order - ₹${quote?.total ?? subtotal}`}
              </button>
            </form>
          </div>

          <div className="checkout-summary">
            <h3>Your Order ({items.length} items)</h3>
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="checkout-item"
              >
                <Image
                  src={item.img}
                  alt={item.name}
                  width={48}
                  height={48}
                  style={{ objectFit: "cover", borderRadius: 6 }}
                />
                <div className="checkout-item-info">
                  <h5>{item.name}</h5>
                  <p>Qty: {item.qty}</p>
                </div>
                <div className="checkout-item-price">
                  ₹{item.price * item.qty}
                </div>
              </div>
            ))}
            {ads.map((p) => (
              <PromoBar key={p._id} promo={p} compact />
            ))}
            <div className="coupon-row">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="Coupon code"
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => void refreshQuote()}
              >
                Apply
              </button>
            </div>
            {quote?.error ? <p className="form-error">{quote.error}</p> : null}
            {quote?.promo && quote.discount > 0 ? (
              <p className="form-success">
                {quote.promo.title}: -₹{quote.discount}
              </p>
            ) : null}
            <hr className="summary-divider" style={{ marginTop: 20 }} />
            <div className="summary-row" style={{ marginTop: 16 }}>
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            {quote && quote.discount > 0 ? (
              <div className="summary-row">
                <span>Offer</span>
                <strong>-₹{quote.discount}</strong>
              </div>
            ) : null}
            {quote && quote.gst && quote.gst > 0 ? (
              <div className="summary-row">
                <span>
                  GST {quote.gstPercent}%
                  {quote.gstInclusive ? " (in price)" : ""}
                </span>
                <strong>
                  {quote.gstInclusive ? `₹${quote.gst}` : `₹${quote.gst}`}
                </strong>
              </div>
            ) : null}
            <div className="summary-row">
              <span>Delivery</span>
              <strong>
                {!quote || quote.shipping === 0 ? "Free" : `₹${quote.shipping}`}
              </strong>
            </div>
            {quote?.shippingNote ? (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gray-500)",
                  margin: "-6px 0 10px",
                }}
              >
                {quote.shippingNote}
              </p>
            ) : null}
            {quote && quote.codFee && quote.codFee > 0 ? (
              <div className="summary-row">
                <span>COD fee</span>
                <strong>₹{quote.codFee}</strong>
              </div>
            ) : null}
            <hr className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <strong>₹{quote?.total ?? subtotal}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
