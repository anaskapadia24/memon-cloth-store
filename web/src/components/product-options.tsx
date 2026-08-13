"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { whatsappLink } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

function stockDotClass(stock: number) {
  if (stock === 0) return "no-stock";
  if (stock <= 5) return "low-stock";
  return "in-stock";
}

export function ProductOptions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [size, setSize] = useState("");
  const [added, setAdded] = useState(false);

  const activeColor = product.colors.find((c) => c.name === color);
  const sizeOptions = activeColor ? activeColor.sizes : product.sizes;

  const stock = useMemo(() => {
    if (sizeOptions.length > 0)
      return sizeOptions.find((s) => s.size === size)?.stock ?? 0;
    if (activeColor) return activeColor.stock;
    return product.stock;
  }, [sizeOptions, size, activeColor, product.stock]);

  const comingSoon = !!product.comingSoon;
  const needsSize = sizeOptions.length > 0 && !size;
  const canAdd = !comingSoon && !needsSize && stock > 0;

  function handleAdd() {
    if (!canAdd) return;
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      qty: 1,
      img: activeColor?.images[0] || product.img,
      size: size || undefined,
      color: color || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const waMessage = comingSoon
    ? `Hi Memon Cloth Store, please tell me when "${product.name}" is available.`
    : `Hi Memon Cloth Store, I'm interested in "${product.name}" (₹${product.price}). Please share more details.`;

  return (
    <div>
      {product.colors.length > 0 && (
        <div className="color-selector">
          <h4
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--navy)",
              marginBottom: 12,
            }}
          >
            Color: <span style={{ fontWeight: 400 }}>{color}</span>
          </h4>
          <div className="color-options">
            {product.colors.map((c) => (
              <button
                key={c.name}
                className={`color-btn${c.name === color ? " selected" : ""}`}
                onClick={() => {
                  setColor(c.name);
                  setSize("");
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizeOptions.length > 0 && (
        <div className="size-selector">
          <h4>
            Size {size && <span style={{ fontWeight: 400 }}>: {size}</span>}
          </h4>
          <div className="size-options">
            {sizeOptions.map((s) => (
              <button
                key={s.size}
                className={`size-btn${s.size === size ? " selected" : ""}${s.stock === 0 ? " out-of-stock" : ""}`}
                disabled={s.stock === 0}
                onClick={() => setSize(s.size)}
              >
                {s.size}
                <span className={`stock-dot ${stockDotClass(s.stock)}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {sizeOptions.length === 0 && (
        <div className="product-stock-large">
          <span
            className={`stock-status ${comingSoon ? "coming-soon" : stock === 0 ? "out-of-stock" : stock <= 5 ? "low-stock" : "in-stock"}`}
          >
            <i
              className={`fas fa-${comingSoon ? "clock" : stock === 0 ? "times-circle" : stock <= 5 ? "exclamation-triangle" : "check-circle"}`}
            />
            {comingSoon
              ? product.comingSoonNote ||
                (product.comingSoonKind === "restock"
                  ? "Back soon"
                  : "Coming soon")
              : stock === 0
                ? "Out of Stock"
                : stock <= 5
                  ? `Only ${stock} left`
                  : `In Stock (${stock})`}
          </span>
        </div>
      )}

      <div className="product-actions-large">
        <button className="btn btn-navy" onClick={handleAdd} disabled={!canAdd}>
          <i className={`fas fa-${added ? "check" : "shopping-bag"}`} />
          {comingSoon
            ? "Coming Soon"
            : needsSize
              ? "Select a Size"
              : stock === 0
                ? "Sold Out"
                : added
                  ? "Added to Cart"
                  : "Add to Cart"}
        </button>
        <a
          href={whatsappLink(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <i className="fab fa-whatsapp" /> Inquire
        </a>
      </div>
    </div>
  );
}
