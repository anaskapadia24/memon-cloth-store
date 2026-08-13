"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <section className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <i className="fas fa-shopping-bag" />
            <h4>Your cart is empty</h4>
            <p>Add some products before checkout!</p>
            <Link href="/category/all" className="btn btn-primary">
              <i className="fas fa-th-large" /> Browse Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 32 }}>
          Your Cart
        </h1>

        <div className="cart-page-grid">
          <div className="cart-page-items">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="cart-page-item"
              >
                <div className="cart-page-item-img">
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    sizes="100px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="cart-page-item-info">
                  <h4>{item.name}</h4>
                  {(item.color || item.size) && (
                    <p className="cat">
                      {item.color}
                      {item.color && item.size ? " / " : ""}
                      {item.size}
                    </p>
                  )}
                  <p className="price">₹{item.price}</p>
                </div>
                <div className="cart-page-item-actions">
                  <div className="cart-page-qty">
                    <button
                      onClick={() =>
                        updateQty(item.id, item.qty - 1, item.size, item.color)
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() =>
                        updateQty(item.id, item.qty + 1, item.size, item.color)
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-page-remove"
                    onClick={() => removeItem(item.id, item.size, item.color)}
                  >
                    <i className="fas fa-trash" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <strong>Free</strong>
            </div>
            <hr className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <strong>₹{subtotal}</strong>
            </div>
            {user ? (
              <Link href="/checkout" className="btn btn-primary btn-full">
                Proceed to Checkout
              </Link>
            ) : (
              <Link
                href="/login?next=/checkout"
                className="btn btn-primary btn-full"
              >
                Log In to Checkout
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
